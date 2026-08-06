import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { planById } from "@/lib/plans";
import { findOrCreateUserIdByEmail } from "@/lib/guestCheckout";

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
      const planId = session.metadata?.plan_id;
      const plan = planId ? planById(planId) : undefined;
      if (!plan) break;

      // Signed-in purchase: the user id was known before checkout.
      // Guest purchase: it wasn't, so the email Stripe collected is the only
      // key we have. Create the account or attach to an existing one with
      // that address — never a duplicate.
      let userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
      if (!userId) {
        const email = session.customer_details?.email ?? session.customer_email;
        if (!email) {
          // Nothing to key on. Loud, because someone has paid and this is
          // the branch that leaves them without an account.
          console.error("Stripe webhook: paid session with neither user_id nor email", session.id);
          break;
        }
        userId = await findOrCreateUserIdByEmail(email);
      }

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

      // Stripe retries on any non-2xx, and one-time purchases have no
      // stripe_subscription_id to dedupe on — so the checkout session id is
      // the idempotency key (unique index in supabase/schema.sql).
      const { error: insertError } = await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        stripe_subscription_id: subscriptionId,
        stripe_checkout_session_id: session.id,
        plan: plan.id,
        status: "active",
      });
      // 23505 = unique violation: this session was already recorded, which
      // is a retry doing its job rather than a failure.
      if (insertError && insertError.code !== "23505") {
        console.error("Stripe webhook: subscription insert failed", session.id, insertError.message);
        return NextResponse.json({ error: "Could not record purchase" }, { status: 500 });
      }
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
