import type { PillarColor } from "./assessmentTypes";
import type { AssessmentType } from "./importHistory";

export interface StepAssessmentLink {
  label: string;
  type: AssessmentType;
}

export interface SevenStep {
  step: number;
  pillarColor: PillarColor;
  title: string;
  tagline: string;
  why: string;
  assessments: StepAssessmentLink[];
  // Anchor on the site's own 7 Steps page, for the fuller write-up
  // (What the science shows / Ask yourself) that doesn't fit a card here.
  learnMoreHref: string;
}

// Verbatim from proageing.org/7-steps.html ("Why it matters" copy per
// step), so this reads as the same framework wherever someone meets it —
// only the call to action changes: the site links to its own legacy
// check pages, this links to the native in-app assessment instead.
export const SEVEN_STEPS: SevenStep[] = [
  {
    step: 1,
    pillarColor: "purpose",
    title: "Clarify Your Preferred Future",
    tagline: "Know your why",
    why: "Real behaviour change begins with a meaningful reason. People who have a sense of purpose are more likely to stay active, eat better, manage stress and remain socially connected.",
    assessments: [{ label: "Sense of Purpose", type: "purpose" }],
    learnMoreHref: "https://proageing.org/7-steps.html#step-1",
  },
  {
    step: 2,
    pillarColor: "healthrisk",
    title: "Understand Your Personal Healthspan Risks",
    tagline: "Know your devils",
    why: "Healthspan is the number of years you live in good health. Many problems associated with ageing — heart disease, diabetes, falls, frailty, poor sleep and cognitive decline — develop gradually.",
    assessments: [
      { label: "Family History", type: "family-history" },
      { label: "Cognitive Decline", type: "cognitive-decline" },
    ],
    learnMoreHref: "https://proageing.org/7-steps.html#step-2",
  },
  {
    step: 3,
    pillarColor: "movement",
    title: "Invest in Daily Movement",
    tagline: "Move often, not just intensely",
    why: "Your body was designed for movement throughout the day. Daily movement supports the heart, lungs, brain, joints and mood.",
    assessments: [{ label: "VO2 Max & Resting HR", type: "vo2max" }],
    learnMoreHref: "https://proageing.org/7-steps.html#step-3",
  },
  {
    step: 4,
    pillarColor: "strength",
    title: "Build Strength and Balance Capacity",
    tagline: "Protect your independence",
    why: "Strength is not just for athletes. It is the foundation of independence: getting up from a chair, climbing stairs, carrying groceries and preventing falls.",
    assessments: [
      { label: "Sit-to-Stand", type: "sit-to-stand" },
      { label: "Balance", type: "balance" },
    ],
    learnMoreHref: "https://proageing.org/7-steps.html#step-4",
  },
  {
    step: 5,
    pillarColor: "nutrition",
    title: "Fuel Your Body Healthily",
    tagline: "Feed the change",
    why: "Food is information for your body. It influences energy, blood sugar, blood pressure, inflammation, muscle health and brain function.",
    assessments: [{ label: "Nutrition & Protein", type: "nutrition-protein" }],
    learnMoreHref: "https://proageing.org/7-steps.html#step-5",
  },
  {
    step: 6,
    pillarColor: "sleep",
    title: "Restore Sleep and Stress Rhythm",
    tagline: "Recovery is part of health",
    why: "You do not get healthier only when you exercise or eat well. You also get healthier when your body has time to repair.",
    assessments: [{ label: "Sleep Quality", type: "sleep-quality" }],
    learnMoreHref: "https://proageing.org/7-steps.html#step-6",
  },
  {
    step: 7,
    pillarColor: "connection",
    title: "Strengthen Social and Emotional Connections",
    tagline: "Grow together",
    why: "Human beings are social creatures. Connection protects both mental and physical health.",
    assessments: [{ label: "Connection", type: "connection" }],
    learnMoreHref: "https://proageing.org/7-steps.html#step-7",
  },
];
