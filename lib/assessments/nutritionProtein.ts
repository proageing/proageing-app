// Ported from proageing-site/nutrition.html — adapted from the Protein
// Screener 55+ (Wijnhoven et al., PLOS ONE, 2018), a validated Dutch tool,
// using Singapore-relevant food items per Whitton, Ho, Rebello & van Dam
// (Public Health Nutrition, 2018). This is a transparent frequency count,
// NOT Pro55+'s original regression-based probability score — a directional
// screen, not a validated clinical measurement.

export const FREQUENCY_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "1–2x/week" },
  { value: 2, label: "3–4x/week" },
  { value: 3, label: "5–6x/week" },
  { value: 4, label: "Daily+" },
];

export const PORTION_OPTIONS = [
  { value: 0, label: "A small amount" },
  { value: 1, label: "About a palm-sized portion" },
  { value: 2, label: "More than a palm-sized portion" },
  { value: 3, label: "Not sure" },
];

export const PROTEIN_FOOD_QUESTIONS = [
  { key: "fish", label: "Fish or seafood" },
  { key: "poultry", label: "Chicken or other poultry" },
  { key: "redmeat", label: "Red meat (beef, pork, lamb)" },
  { key: "eggs", label: "Eggs" },
  { key: "tofu", label: "Tofu, tempeh, or other soy products" },
  { key: "dairy", label: "Milk, soy milk, or yoghurt" },
  { key: "legumes", label: "Beans, lentils, or other legumes" },
  { key: "nuts", label: "Nuts or peanuts" },
] as const;

export type ProteinFoodKey = (typeof PROTEIN_FOOD_QUESTIONS)[number]["key"];

export type NutritionAnswers = Record<ProteinFoodKey, number | null> & {
  portion: number | null;
};

export function emptyNutritionAnswers(): NutritionAnswers {
  return {
    fish: null,
    poultry: null,
    redmeat: null,
    eggs: null,
    tofu: null,
    dairy: null,
    legumes: null,
    nuts: null,
    portion: null,
  };
}

export function isNutritionComplete(answers: NutritionAnswers): boolean {
  return (
    PROTEIN_FOOD_QUESTIONS.every((q) => answers[q.key] !== null) && answers.portion !== null
  );
}

// Score is the sum of the 8 frequency items only (0-32); portion is shown
// separately, not included in the score.
export function computeProteinScore(answers: NutritionAnswers): number {
  return PROTEIN_FOOD_QUESTIONS.reduce((sum, q) => sum + (answers[q.key] ?? 0), 0);
}

export interface NutritionResult {
  status: "elevated" | "watch" | "good";
  label: string;
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretProteinScore(score: number): NutritionResult {
  if (score <= 10) {
    return {
      status: "elevated",
      label: "Low frequency",
      title: "Worth a closer look",
      text: "Protein-rich foods seem to be showing up infrequently across your week. Since older adults need more protein per kg of body weight than younger adults to maintain muscle, this is worth actively addressing.",
      nextSteps: [
        "Try adding a protein source to each meal, not just one meal a day.",
        "Tofu, eggs, and canned fish are inexpensive, low-effort ways to add protein at home.",
        "Consider asking your doctor for a referral to a dietitian for a precise assessment.",
      ],
    };
  }
  if (score <= 20) {
    return {
      status: "watch",
      label: "Moderate frequency",
      title: "A reasonable base, with room to build",
      text: "You're getting protein-rich foods regularly, but there may be room to spread them more evenly across meals, or increase portion size at meals where it's currently small.",
      nextSteps: [
        "Aim for a protein source at breakfast too, not just lunch and dinner.",
        "Frequency and portion size both matter — check your usual portion below.",
      ],
    };
  }
  return {
    status: "good",
    label: "Good frequency",
    title: "A strong protein-source pattern",
    text: "Protein-rich foods are showing up often across your week — a good foundation for maintaining muscle as you age, especially alongside regular strength activity.",
    nextSteps: [
      "Keep this pattern going — it pairs well with the Build Strength & Balance checks.",
      "Recheck every few months to make sure this holds steady.",
    ],
  };
}
