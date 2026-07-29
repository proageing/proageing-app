// Plan catalog for the Stripe paywall — mirrors docs/PLAN.md §5. Price IDs
// come from env vars (set once the products/prices exist in the Stripe
// Singapore account, Phase 0 manual step) rather than being hardcoded, since
// Stripe price IDs are account-specific.
export type PlanId = "90-day" | "90-day-coaching" | "membership";

export interface Plan {
  id: PlanId;
  title: string;
  priceLabel: string;
  mode: "payment" | "subscription";
  priceEnvVar: string;
}

export const PLANS: Plan[] = [
  {
    id: "90-day",
    title: "90-Day Transformation",
    priceLabel: "S$129 one-time",
    mode: "payment",
    priceEnvVar: "STRIPE_PRICE_90DAY",
  },
  {
    id: "90-day-coaching",
    title: "90-Day + Coaching",
    priceLabel: "S$249 one-time",
    mode: "payment",
    priceEnvVar: "STRIPE_PRICE_90DAY_COACHING",
  },
  {
    id: "membership",
    title: "Ongoing membership",
    priceLabel: "S$12/month",
    mode: "subscription",
    priceEnvVar: "STRIPE_PRICE_MEMBERSHIP",
  },
];

export function planById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function priceIdForPlan(plan: Plan): string {
  const priceId = process.env[plan.priceEnvVar];
  if (!priceId) {
    throw new Error(`Missing env var ${plan.priceEnvVar} for plan ${plan.id}`);
  }
  return priceId;
}
