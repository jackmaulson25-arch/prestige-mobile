import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get user's Stripe subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("provider_subscription_id")
      .eq("user_id", userId)
      .eq("provider", "stripe")
      .eq("status", "active")
      .single();

    if (!subscription?.provider_subscription_id) {
      return NextResponse.json(
        { error: "No active Stripe subscription found" },
        { status: 404 }
      );
    }

    // Retrieve the subscription to get the customer ID
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.provider_subscription_id
    );

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeSub.customer as string,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
