import Stripe from "stripe";

// Server-only — never import this from a "use client" file.
//
// Lazily constructed so that `next build` (which loads every API route
// module to collect page data) doesn't fail before STRIPE_SECRET_KEY
// actually exists — it won't, until the Stripe Singapore account is
// created (docs/PLAN.md §9, Phase 0 manual step). Calling getStripe()
// without the env var set throws only when a request actually hits it.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    cached = new Stripe(key);
  }
  return cached;
}
