import type { AssessmentType } from "./importHistory";

// The 7 ProAgeing Steps → 9 assessment types (docs/PLAN.md §3).
// `href` is only set once an in-app assessment page exists for that type —
// the rest are still import-only until ported from proageing-site.
export const ASSESSMENT_TYPES: { type: AssessmentType; step: number; title: string; href?: string }[] = [
  { type: "purpose", step: 1, title: "Sense of Purpose" },
  { type: "family-history", step: 2, title: "Family History", href: "/assess/family-history" },
  { type: "cognitive-decline", step: 2, title: "Cognitive Decline" },
  { type: "vo2max", step: 3, title: "VO2 Max & Resting HR" },
  { type: "sit-to-stand", step: 4, title: "Sit-to-Stand" },
  { type: "balance", step: 4, title: "Balance" },
  { type: "nutrition-protein", step: 5, title: "Nutrition & Protein", href: "/assess/nutrition-protein" },
  { type: "sleep-quality", step: 6, title: "Sleep Quality" },
  { type: "connection", step: 7, title: "Connection" },
];
