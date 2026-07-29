import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { planById, priceIdForPlan } from "@/lib/plans";

// Creates a Stripe Checkout Session for the signed-in user. The client
// authenticates by sending its Supabase access token as a Bearer header —
// there's no cookie-based Supabase session in this app (no @supabase/ssr),
// so this is how a server route learns who's asking.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { planId } = await request.json();
  const plan = planById(planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await getSupabaseAdmin().auth.getUser(accessToken);
    if (userError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const priceId = priceIdForPlan(plan);

    const session = await getStripe().checkout.sessions.create({
      mode: plan.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan_id: plan.id },
      success_url: `${origin}/upgrade/success`,
      cancel_url: `${origin}/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
