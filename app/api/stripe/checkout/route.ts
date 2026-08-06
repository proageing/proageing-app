import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { planById, priceIdForPlan } from "@/lib/plans";

// Creates a Stripe Checkout Session, for a signed-in user or a guest.
//
// Signed in: the client sends its Supabase access token as a Bearer header
// (there's no cookie-based Supabase session in this app — no @supabase/ssr —
// so this is how a server route learns who's asking), and the user id rides
// along in metadata for the webhook.
//
// Guest: no token. proageing.org links straight here for people who have
// never signed in, and making them create an account before paying loses
// most of them. Stripe collects the email at checkout and the webhook
// creates or attaches the account afterwards.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

  const { planId } = await request.json();
  const plan = planById(planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  try {
    // A token that's present but invalid is an error, not a guest — silently
    // downgrading would attach someone's purchase to nobody.
    let user: { id: string; email?: string } | null = null;
    if (accessToken) {
      const { data, error: userError } = await getSupabaseAdmin().auth.getUser(accessToken);
      if (userError || !data.user) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
      }
      user = { id: data.user.id, email: data.user.email };
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const priceId = priceIdForPlan(plan);

    const session = await getStripe().checkout.sessions.create({
      mode: plan.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      // Guests: omit customer_email so Stripe collects it. That address is
      // what the webhook keys the account on.
      ...(user?.email ? { customer_email: user.email } : {}),
      ...(user ? { client_reference_id: user.id } : {}),
      metadata: user ? { user_id: user.id, plan_id: plan.id } : { plan_id: plan.id },
      // The session id lets /upgrade/success identify the buyer without a
      // session of their own, so it can send the sign-in link.
      success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Generic on purpose: a misconfigured environment throws messages that
    // name STRIPE_SECRET_KEY and friends, which shouldn't be handed back
    // to the caller. The detail goes to the server log instead.
    console.error("Checkout route failed", err);
    return NextResponse.json({ error: "Couldn't start checkout." }, { status: 500 });
  }
}
