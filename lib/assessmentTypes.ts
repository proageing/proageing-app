import type { AssessmentType } from "./importHistory";

// The 7 ProAgeing Steps → 9 assessment types (docs/PLAN.md §3). All 9 now
// have an in-app assessment page.
export const ASSESSMENT_TYPES: { type: AssessmentType; step: number; title: string; href?: string }[] = [
  { type: "purpose", step: 1, title: "Sense of Purpose", href: "/assess/purpose" },
  { type: "family-history", step: 2, title: "Family History", href: "/assess/family-history" },
  { type: "cognitive-decline", step: 2, title: "Cognitive Decline", href: "/assess/cognitive-decline" },
  { type: "vo2max", step: 3, title: "VO2 Max & Resting HR", href: "/assess/vo2max" },
  { type: "sit-to-stand", step: 4, title: "Sit-to-Stand", href: "/assess/sit-to-stand" },
  { type: "balance", step: 4, title: "Balance", href: "/assess/balance" },
  { type: "nutrition-protein", step: 5, title: "Nutrition & Protein", href: "/assess/nutrition-protein" },
  { type: "sleep-quality", step: 6, title: "Sleep Quality", href: "/assess/sleep-quality" },
  { type: "connection", step: 7, title: "Connection", href: "/assess/connection" },
];
