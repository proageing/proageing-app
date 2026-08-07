// Calculators, as distinct from checks.
//
// A check measures something about the person and its result belongs in the
// Longevity Profile. A tool works something out for them — a heart-rate zone,
// a protein target — and stores nothing. Keeping them in separate lists is
// what lets the profile keep saying "9 of 9 checks" and mean it, while these
// still have somewhere to live. Before this, the training zone finder existed
// but was reachable only from day 3 of the programme.
import type { PillarColor } from "./assessmentTypes";

export interface Tool {
  key: string;
  href: string;
  color: PillarColor;
}

export const TOOLS: Tool[] = [
  { key: "training-zone", href: "/assess/training-zone", color: "movement" },
  { key: "protein-calculator", href: "/assess/protein-calculator", color: "nutrition" },
];
