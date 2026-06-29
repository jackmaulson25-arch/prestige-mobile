import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// RevenueCat webhook event types
interface RCEvent {
  api_version: string;
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number;
    store: string;
    is_trial_period: boolean;
    cancel_reason?: string;
  };
}

serve(async (req) => {
  try {
    const body = await req.text();
    const authHeader = req.headers.get("authorization");

    // Verify webhook authorization
    if (authHeader !== `Bearer ${REVENUECAT_WEBHOOK_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload: RCEvent = JSON.parse(body);
    const { event } = payload;

    console.log(`Processing RevenueCat event: ${event.type} for user: ${event.app_user_id}`);

    // Map RevenueCat product IDs to tier slugs
    const productToTier: Record<string, string> = {
      prestige_basic_monthly: "basic",
      prestige_basic_yearly: "basic",
      prestige_premium_monthly: "premium",
      prestige_premium_yearly: "premium",
    };

    const tierSlug = productToTier[event.product_id];
    const userId = event.app_user_id;
    const billingCycle = event.product_id.includes("yearly") ? "yearly" : "monthly";

    if (!tierSlug) {
      console.log(`Unknown product: ${event.product_id}`);
      return new Response("OK", { status: 200 });
    }

    // Get tier ID
    const { data: tier } = await supabase
      .from("subscription_tiers")
      .select("id")
      .eq("slug", tierSlug)
      .single();

    if (!tier) {
      console.error(`Tier not found: ${tierSlug}`);
      return new Response("OK", { status: 200 });
    }

    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "NON_RENEWING_PURCHASE": {
        // Activate subscription
        const { error } = await supabase
          .from("user_subscriptions")
          .upsert(
            {
              user_id: userId,
              tier_id: tier.id,
              status: "active",
              provider: "revenuecat",
              provider_subscription_id: `${event.product_id}_${event.purchased_at_ms}`,
              billing_cycle: billingCycle,
              period_start: new Date(event.purchased_at_ms).toISOString(),
              period_end: new Date(event.expiration_at_ms).toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) {
          console.error("Error upserting subscription:", error);
        }

        // Record payment
        const priceMap: Record<string, number> = {
          basic: billingCycle === "yearly" ? 99.99 : 9.99,
          premium: billingCycle === "yearly" ? 199.99 : 19.99,
        };

        await supabase.from("payments").insert({
          user_id: userId,
          amount: priceMap[tierSlug] || 0,
          currency: "usd",
          provider: "revenuecat",
          provider_payment_id: `${event.product_id}_${event.purchased_at_ms}`,
          status: "completed",
          description: `PrestigeSupliments ${tierSlug} ${billingCycle} subscription`,
        });
        break;
      }

      case "CANCELLATION": {
        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            cancel_at_period_end: true,
            period_end: new Date(event.expiration_at_ms).toISOString(),
          })
          .eq("user_id", userId)
          .eq("provider", "revenuecat")
          .eq("status", "active");
        break;
      }

      case "EXPIRATION": {
        await supabase
          .from("user_subscriptions")
          .update({ status: "expired" })
          .eq("user_id", userId)
          .eq("provider", "revenuecat")
          .eq("status", "active");
        break;
      }

      case "BILLING_ISSUE": {
        await supabase
          .from("user_subscriptions")
          .update({ status: "past_due" })
          .eq("user_id", userId)
          .eq("provider", "revenuecat")
          .eq("status", "active");
        break;
      }

      default:
        console.log(`Unhandled RevenueCat event: ${event.type}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("RevenueCat webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
