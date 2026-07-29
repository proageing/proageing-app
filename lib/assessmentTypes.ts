import type { AssessmentType } from "./importHistory";

// Tailwind color token (tailwind.config.ts) per type, matching the accent
// each assessment already uses on proageing.org 1:1. sit-to-stand has no
// distinct accent there — it uses the core brand orange, same as here.
export type PillarColor =
  | "purpose"
  | "healthrisk"
  | "cognitive"
  | "movement"
  | "strength"
  | "nutrition"
  | "sleep"
  | "connection"
  | "primary";

// The 7 ProAgeing Steps → 9 assessment types (docs/PLAN.md §3). All 9 now
// have an in-app assessment page.
export const ASSESSMENT_TYPES: { type: AssessmentType; step: number; title: string; href?: string; color: PillarColor }[] = [
  { type: "purpose", step: 1, title: "Sense of Purpose", href: "/assess/purpose", color: "purpose" },
  { type: "family-history", step: 2, title: "Family History", href: "/assess/family-history", color: "healthrisk" },
  { type: "cognitive-decline", step: 2, title: "Cognitive Decline", href: "/assess/cognitive-decline", color: "cognitive" },
  { type: "vo2max", step: 3, title: "VO2 Max & Resting HR", href: "/assess/vo2max", color: "movement" },
  { type: "sit-to-stand", step: 4, title: "Sit-to-Stand", href: "/assess/sit-to-stand", color: "primary" },
  { type: "balance", step: 4, title: "Balance", href: "/assess/balance", color: "strength" },
  { type: "nutrition-protein", step: 5, title: "Nutrition & Protein", href: "/assess/nutrition-protein", color: "nutrition" },
  { type: "sleep-quality", step: 6, title: "Sleep Quality", href: "/assess/sleep-quality", color: "sleep" },
  { type: "connection", step: 7, title: "Connection", href: "/assess/connection", color: "connection" },
];

export function colorForType(type: AssessmentType): PillarColor {
  return ASSESSMENT_TYPES.find((a) => a.type === type)?.color ?? "primary";
}
