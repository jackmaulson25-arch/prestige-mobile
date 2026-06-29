import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Stripe webhook handler
serve(async (req) => {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    // In production, use Stripe's official verification
    const event = JSON.parse(body);

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const tierSlug = session.metadata?.tier_slug;
        const billingCycle = session.metadata?.billing_cycle || "monthly";

        if (!userId || !tierSlug) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Get tier
        const { data: tier } = await supabase
          .from("subscription_tiers")
          .select("id")
          .eq("slug", tierSlug)
          .single();

        if (!tier) {
          console.error(`Tier not found: ${tierSlug}`);
          break;
        }

        // Create subscription record
        const { error: subError } = await supabase
          .from("user_subscriptions")
          .upsert(
            {
              user_id: userId,
              tier_id: tier.id,
              status: "active",
              provider: "stripe",
              provider_subscription_id: session.subscription || session.id,
              billing_cycle: billingCycle,
              period_start: new Date().toISOString(),
              period_end: new Date(
                Date.now() + (billingCycle === "yearly" ? 365 : 30) * 86400000
              ).toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (subError) {
          console.error("Error creating subscription:", subError);
        }

        // Record payment
        await supabase.from("payments").insert({
          user_id: userId,
          amount: session.amount_total / 100,
          currency: session.currency || "usd",
          provider: "stripe",
          provider_payment_id: session.payment_intent,
          status: "completed",
          description: `PrestigeSupliments ${tierSlug} subscription`,
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        const newStatus =
          subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
            ? "past_due"
            : subscription.status === "canceled"
            ? "cancelled"
            : "expired";

        await supabase
          .from("user_subscriptions")
          .update({
            status: newStatus,
            cancel_at_period_end: subscription.cancel_at_period_end,
            period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("provider_subscription_id", subscription.id)
          .eq("provider", "stripe");

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        await supabase
          .from("user_subscriptions")
          .update({ status: "cancelled" })
          .eq("provider_subscription_id", subscription.id)
          .eq("provider", "stripe");

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const userId = invoice.metadata?.user_id;

        if (userId && invoice.amount_paid > 0) {
          await supabase.from("payments").insert({
            user_id: userId,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency || "usd",
            provider: "stripe",
            provider_payment_id: invoice.payment_intent,
            status: "completed",
            description: "Subscription renewal",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const userId = invoice.metadata?.user_id;

        if (userId) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("provider_subscription_id", invoice.subscription)
            .eq("provider", "stripe");
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
