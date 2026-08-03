// Plan catalog for the Stripe paywall — mirrors docs/PLAN.md §5. Price IDs
// come from env vars (set once the products/prices exist in the Stripe
// Singapore account, Phase 0 manual step) rather than being hardcoded, since
// Stripe price IDs are account-specific.
//
// Both the 21-day and 90-day programmes are paid, one-time purchases.
// Ongoing membership is free — every signed-in user gets it automatically
// (it's just continued access + trend history across assessments they've
// taken), so it isn't a Stripe product and doesn't appear here.
export type PlanId = "21-day" | "90-day";

export interface Plan {
  id: PlanId;
  title: string;
  priceLabel: string;
  mode: "payment" | "subscription";
  priceEnvVar: string;
  // 90-day programme content doesn't exist yet (lib/program21.ts only
  // covers the 21-day track) — greyed out on /upgrade so nobody can pay
  // for something that isn't there to deliver.
  comingSoon?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "21-day",
    title: "21-Day ProAgeing Challenge",
    priceLabel: "S$39 one-time",
    mode: "payment",
    priceEnvVar: "STRIPE_PRICE_21DAY",
  },
  {
    id: "90-day",
    title: "90-Day Transformation",
    priceLabel: "S$129 one-time",
    mode: "payment",
    priceEnvVar: "STRIPE_PRICE_90DAY",
    comingSoon: true,
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
