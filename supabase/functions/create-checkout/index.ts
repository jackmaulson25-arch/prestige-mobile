import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { tierSlug, billingCycle = "monthly" } = await req.json();

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("slug", tierSlug)
      .eq("is_active", TRUE)
      .single();

    if (tierError || !tier) {
      return new Response(
        JSON.stringify({ error: "Invalid subscription tier" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const priceId =
      billingCycle === "yearly"
        ? tier.stripe_price_id_yearly
        : tier.stripe_price_id_monthly;

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "No price configured for this tier" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Stripe Checkout Session
    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "payment_method_types[]": "card",
          mode: "subscription",
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
          success_url: `${SITE_URL}/dashboard/subscription?success=true`,
          cancel_url: `${SITE_URL}/dashboard/subscription?cancelled=true`,
          "metadata[user_id]": user.id,
          "metadata[tier_slug]": tierSlug,
          "metadata[billing_cycle]": billingCycle,
          customer_email: user.email!,
          client_reference_id: user.id,
        }).toString(),
      }
    );

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe error:", session);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
