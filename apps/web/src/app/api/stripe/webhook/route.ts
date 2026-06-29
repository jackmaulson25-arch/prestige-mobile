import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tierSlug = session.metadata?.tier_slug;
        const billingCycle = session.metadata?.billing_cycle || "monthly";

        if (!userId || !tierSlug) break;

        const { data: tier } = await supabase
          .from("subscription_tiers")
          .select("id")
          .eq("slug", tierSlug)
          .single();

        if (!tier) break;

        // Create or update subscription
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: userId,
            tier_id: tier.id,
            status: "active",
            provider: "stripe",
            provider_subscription_id:
              (session.subscription as string) || session.id,
            billing_cycle: billingCycle,
            period_start: new Date().toISOString(),
            period_end: new Date(
              Date.now() +
                (billingCycle === "yearly" ? 365 : 30) * 86400000
            ).toISOString(),
          },
          { onConflict: "user_id" }
        );

        // Record payment
        await supabase.from("payments").insert({
          user_id: userId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          provider: "stripe",
          provider_payment_id: session.payment_intent as string,
          status: "completed",
          description: `PrestigeSupliments ${tierSlug} subscription`,
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "cancelled",
          unpaid: "expired",
        };

        await supabase
          .from("user_subscriptions")
          .update({
            status: statusMap[subscription.status] || "expired",
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
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("user_subscriptions")
          .update({ status: "cancelled" })
          .eq("provider_subscription_id", subscription.id)
          .eq("provider", "stripe");

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.user_id;

        if (userId && invoice.amount_paid > 0) {
          await supabase.from("payments").insert({
            user_id: userId,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency || "usd",
            provider: "stripe",
            provider_payment_id: invoice.payment_intent as string,
            status: "completed",
            description: "Subscription renewal",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("provider_subscription_id", invoice.subscription as string)
            .eq("provider", "stripe");
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
