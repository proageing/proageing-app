import type { PillarColor } from "./assessmentTypes";

// Tailwind's JIT scanner needs full literal class strings somewhere in
// scanned source — it can't resolve `bg-${color}` at runtime. This is that
// literal source, one static branch per pillar color.
export interface PillarStyle {
  selected: string; // a chosen choice/option button
  unselected: string;
  solidButton: string; // primary CTA in this pillar's color
  outlineLink: string; // e.g. "take this assessment" link
  eyebrow: string; // small caps label above a heading
  pill: string; // result/status pill background+text
  dot: string; // small color swatch (dashboard rows)
  card: string; // tinted card background+border, body text stays neutral
}

export const PILLAR_STYLES: Record<PillarColor, PillarStyle> = {
  primary: {
    selected: "border-primary bg-primary-light text-primary-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-primary text-white hover:bg-primary-dark",
    outlineLink: "border-primary text-primary-dark",
    eyebrow: "text-primary-dark",
    pill: "bg-primary-light text-primary-dark",
    dot: "bg-primary",
    card: "border-primary/25 bg-primary-light dark:bg-primary-light-dark",
  },
  purpose: {
    selected: "border-purpose bg-purpose-tint text-purpose-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-purpose text-white hover:bg-purpose-dark",
    outlineLink: "border-purpose text-purpose-dark",
    eyebrow: "text-purpose-dark",
    pill: "bg-purpose-tint text-purpose-dark",
    dot: "bg-purpose",
    card: "border-purpose/25 bg-purpose-tint",
  },
  healthrisk: {
    selected: "border-healthrisk bg-healthrisk-tint text-healthrisk-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-healthrisk text-white hover:bg-healthrisk-dark",
    outlineLink: "border-healthrisk text-healthrisk-dark",
    eyebrow: "text-healthrisk-dark",
    pill: "bg-healthrisk-tint text-healthrisk-dark",
    dot: "bg-healthrisk",
    card: "border-healthrisk/25 bg-healthrisk-tint",
  },
  cognitive: {
    selected: "border-cognitive bg-cognitive-tint text-cognitive-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-cognitive text-white hover:bg-cognitive-dark",
    outlineLink: "border-cognitive text-cognitive-dark",
    eyebrow: "text-cognitive-dark",
    pill: "bg-cognitive-tint text-cognitive-dark",
    dot: "bg-cognitive",
    card: "border-cognitive/25 bg-cognitive-tint",
  },
  movement: {
    selected: "border-movement bg-movement-tint text-movement-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-movement text-white hover:bg-movement-dark",
    outlineLink: "border-movement text-movement-dark",
    eyebrow: "text-movement-dark",
    pill: "bg-movement-tint text-movement-dark",
    dot: "bg-movement",
    card: "border-movement/25 bg-movement-tint",
  },
  strength: {
    selected: "border-strength bg-strength-tint text-strength-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-strength text-white hover:bg-strength-dark",
    outlineLink: "border-strength text-strength-dark",
    eyebrow: "text-strength-dark",
    pill: "bg-strength-tint text-strength-dark",
    dot: "bg-strength",
    card: "border-strength/25 bg-strength-tint",
  },
  nutrition: {
    selected: "border-nutrition bg-nutrition-tint text-nutrition-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-nutrition text-white hover:bg-nutrition-dark",
    outlineLink: "border-nutrition text-nutrition-dark",
    eyebrow: "text-nutrition-dark",
    pill: "bg-nutrition-tint text-nutrition-dark",
    dot: "bg-nutrition",
    card: "border-nutrition/25 bg-nutrition-tint",
  },
  sleep: {
    selected: "border-sleep bg-sleep-tint text-sleep-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-sleep text-white hover:bg-sleep-dark",
    outlineLink: "border-sleep text-sleep-dark",
    eyebrow: "text-sleep-dark",
    pill: "bg-sleep-tint text-sleep-dark",
    dot: "bg-sleep",
    card: "border-sleep/25 bg-sleep-tint",
  },
  connection: {
    selected: "border-connection bg-connection-tint text-connection-dark",
    unselected: "border-border text-ink-soft",
    solidButton: "bg-connection text-white hover:bg-connection-dark",
    outlineLink: "border-connection text-connection-dark",
    eyebrow: "text-connection-dark",
    pill: "bg-connection-tint text-connection-dark",
    dot: "bg-connection",
    card: "border-connection/25 bg-connection-tint",
  },
};
