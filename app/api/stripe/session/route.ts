import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Tells /upgrade/success who just paid, so a guest can be sent their
// sign-in link without ever having had a session.
//
// Returns the email only for a session that actually completed payment, and
// nothing else about it — a checkout session id should not be a way to read
// order details.
export async function GET(request: NextRequest) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ paid: false });
    }
    return NextResponse.json({
      paid: true,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      // Whether this purchase was made by someone already signed in — the
      // success page has nothing to do for them.
      hadAccount: Boolean(session.metadata?.user_id ?? session.client_reference_id),
    });
  } catch (err) {
    console.error("Stripe session lookup failed", err);
    return NextResponse.json({ error: "Could not look up that purchase." }, { status: 500 });
  }
}
