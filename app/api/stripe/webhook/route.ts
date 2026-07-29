import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { planById } from "@/lib/plans";

// Stripe requires the raw request body (unparsed) to verify the webhook
// signature — Next.js's default JSON body parsing would break that.
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? session.client_reference_id;
      const planId = session.metadata?.plan_id;
      const plan = planId ? planById(planId) : undefined;
      if (!userId || !plan) break;

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

      await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        stripe_subscription_id: subscriptionId,
        plan: plan.id,
        status: "active",
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // current_period_end lives on the subscription item, not the
      // subscription itself, as of Stripe's newer API versions.
      const periodEnd = subscription.items.data[0]?.current_period_end;
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
