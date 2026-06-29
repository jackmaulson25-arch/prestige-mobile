import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { tierSlug, billingCycle, userId, email } = await req.json();

    if (!tierSlug || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("slug", tierSlug)
      .eq("is_active", true)
      .single();

    if (tierError || !tier) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    const priceId =
      billingCycle === "yearly"
        ? tier.stripe_price_id_yearly
        : tier.stripe_price_id_monthly;

    if (!priceId) {
      return NextResponse.json(
        { error: "No price configured for this tier" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription?cancelled=true`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        tier_slug: tierSlug,
        billing_cycle: billingCycle || "monthly",
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          tier_slug: tierSlug,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
