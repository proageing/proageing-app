import type { AssessmentType } from "./importHistory";
import { SEVEN_STEPS_ZH } from "./sevenStepsZh";

export interface StepAssessmentLink {
  label: string;
  type: AssessmentType;
}

export interface SevenStep {
  step: number;
  title: string;
  tagline: string;
  photo: string;
  why: string;
  science: string;
  // Optional: the site dropped this list from Step 2's layout, so it's
  // not guaranteed to exist for every step.
  listHeading?: string;
  listItems?: string[];
  closing: string;
  assessments: StepAssessmentLink[];
}

// Verbatim from proageing.org/7-steps.html — copy, section order and
// photos all match the site's own step-by-step layout exactly. Only the
// check links differ: these point at the native in-app assessment
// instead of the site's own legacy check pages.
export const SEVEN_STEPS: SevenStep[] = [
  {
    step: 1,
    title: "Clarify Your Preferred Future",
    tagline: "Know your why",
    photo: "/steps/step-1.jpg",
    why: "Real behaviour change begins with a meaningful reason. People who have a sense of purpose are more likely to stay active, eat better, manage stress and remain socially connected.",
    science:
      "Research has linked a stronger sense of purpose with lower risk of cognitive decline, better mental health and even reduced risk of premature death. Purpose appears to influence health through motivation, resilience and healthier daily choices.",
    listHeading: "Ask yourself",
    listItems: [
      "What do I want my life to look like in 10 or 20 years?",
      "What do I want to be able to do, not just avoid?",
      "Who do I want to be there for?",
    ],
    closing:
      "Keep this vision visible. Healthy longevity becomes much easier when you are moving toward something meaningful, not merely away from disease.",
    assessments: [{ label: "Sense of Purpose", type: "purpose" }],
  },
  {
    step: 2,
    title: "Understand Your Personal Healthspan Risks",
    tagline: "Know your devils",
    photo: "/steps/step-2.jpg",
    why: "Healthspan is the number of years you live in good health. Many problems associated with ageing — heart disease, diabetes, cancer and dementia — can develop as we age.",
    science:
      "The biggest drivers of poor ageing are often modifiable, including inactivity, excess body fat, high blood pressure, poor sleep, smoking, unhealthy diet and social isolation.",
    closing:
      "Awareness is not about fear. It is about understanding which risks are most relevant to you so that you can focus your energy where it matters most.",
    assessments: [
      { label: "Family History", type: "family-history" },
      { label: "Cognitive Decline", type: "cognitive-decline" },
    ],
  },
  {
    step: 3,
    title: "Invest in Daily Movement",
    tagline: "Intensity matters",
    photo: "/steps/step-3.jpg",
    why: "Physical exercise is the one thing that will yield health benefits that will sustain your function and well-being throughout life. Your body was designed for movement throughout the day — and raising the intensity is what pushes your fitness and improves your health.",
    science:
      "Brisk walking and other moderate intensity activities are associated with lowering the risk of health conditions that plague our longevity namely cardiovascular disease, diabetes, dementia, depression and cancer.",
    listHeading: "Move more, and move harder",
    listItems: ["Pick up the pace until you are breathing harder but can still talk", "Build towards 150 minutes of moderate intensity activity a week", "Stand up every 30–60 minutes"],
    closing: "Healthy longevity comes from doing both — keeping the body in motion every day, and lifting the intensity often enough to challenge your heart and lungs.",
    assessments: [{ label: "VO2 Max & Resting HR", type: "vo2max" }],
  },
  {
    step: 4,
    title: "Build Strength and Balance Capacity",
    tagline: "Protect your independence",
    photo: "/steps/step-4.jpg",
    why: "We need strength and balance, without which we lose our mobility and likely cause injurious falls. It is the foundation of our independence: getting up from a chair, climbing the stairs, carrying groceries and staying socially connected.",
    science:
      "By the age of 30 we start to lose 1–2% of muscle mass annually this coupled with age-related muscle loss (sarcopenia) will accelerate it further. Strength training can reverse this trajectory and couple with balance practice improve mobility, reduce falls and keep doing what we love.",
    listHeading: "Focus on functional mobility",
    listItems: ["Resistance training involving major muscle groups", "Focus on movements such as sit to stand, pulling and pushing", "Do activities that intentionally challenge and requires you to maintain your balance"],
    closing: "Maintaining strength and balance is one of the most effective ways to preserve confidence, mobility and independence as we age.",
    assessments: [
      { label: "Sit-to-Stand", type: "sit-to-stand" },
      { label: "Balance", type: "balance" },
    ],
  },
  {
    step: 5,
    title: "Fuel Your Body Healthily",
    tagline: "Feed the change",
    photo: "/steps/step-5.jpg",
    why: "Food is information for your body. It influences energy, blood sugar, blood pressure, inflammation, muscle health and brain function.",
    science:
      "Dietary patterns rich in vegetables, fruits, legumes, whole grains, healthy fats and adequate protein are consistently associated with better cardiovascular, metabolic and cognitive health.",
    listHeading: "Keep it practical",
    listItems: ["Half your plate vegetables", "Include protein at each meal", "Choose whole foods more often", "Drink enough water", "Reduce ultra-processed foods gradually"],
    closing: "Healthy eating is not about perfection or restriction. It is about giving your body the nutrients it needs to repair, adapt and stay resilient over time.",
    assessments: [{ label: "Nutrition & Protein", type: "nutrition-protein" }],
  },
  {
    step: 6,
    title: "Restore Sleep and Stress Rhythm",
    tagline: "Recovery is part of health",
    photo: "/steps/step-6.jpg",
    why: "You do not get healthier only when you exercise or eat well. You also get healthier when your body has time to repair.",
    science: "Poor sleep is linked with higher risk of obesity, diabetes, heart disease, depression and cognitive decline. Chronic stress can affect blood pressure, immunity and long-term health.",
    listHeading: "Support your rhythm",
    listItems: ["Keep a regular sleep time", "Get morning light", "Limit caffeine late in the day", "Reduce screens before bed", "Use slow breathing to calm the nervous system"],
    closing: "Good sleep and stress recovery are not optional extras. They are essential biological processes that allow the body and brain to restore themselves.",
    assessments: [{ label: "Sleep Quality", type: "sleep-quality" }],
  },
  {
    step: 7,
    title: "Strengthen Social and Emotional Connections",
    tagline: "Grow together",
    photo: "/steps/step-7.jpg",
    why: "Human beings are social creatures. Connection protects both mental and physical health.",
    science:
      "Loneliness and social isolation are associated with increased risk of depression, cognitive decline, heart disease and premature mortality. Supportive relationships improve resilience and healthy behaviours.",
    listHeading: "Build connection intentionally",
    listItems: ["Call a friend", "Join a group", "Share meals", "Volunteer", "Ask for help when needed", "Offer help when you can"],
    closing: "Healthy longevity is not only about living longer as an individual. It is also about belonging, contributing and staying emotionally connected to others.",
    assessments: [{ label: "Connection", type: "connection" }],
  },
];

export function stepByNumber(n: number): SevenStep | undefined {
  return SEVEN_STEPS.find((s) => s.step === n);
}

// Locale-aware accessors. The Chinese content is the website's own
// published copy (lib/sevenStepsZh.ts), not a re-translation.
export function stepsForLocale(locale: string): SevenStep[] {
  return locale === "zh" ? SEVEN_STEPS_ZH : SEVEN_STEPS;
}

export function stepByNumberForLocale(n: number, locale: string): SevenStep | undefined {
  return stepsForLocale(locale).find((s) => s.step === n);
}
