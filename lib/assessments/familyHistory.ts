// Ported from proageing-site/family-history.html. Wherever Singapore has
// its own MOH Clinical Practice Guideline, this uses it (sometimes
// stricter, or calibrated differently, than international guidance);
// otherwise it falls back to international standards and says so.

export type Sex = "male" | "female";
export type CancerType = "breast" | "colorectal" | "ovarian" | "other";
export type FlagLevel = "none" | "present" | "elevated";

export interface CategoryAnswer {
  has: boolean | null;
  age: number | null;
}

export interface FamilyHistoryAnswers {
  sex: Sex | null;
  cvd: CategoryAnswer;
  cancer: CategoryAnswer & { type: CancerType | null };
  neuro: CategoryAnswer;
  metabolic: CategoryAnswer;
}

export function emptyFamilyHistoryAnswers(): FamilyHistoryAnswers {
  return {
    sex: null,
    cvd: { has: null, age: null },
    cancer: { has: null, age: null, type: null },
    neuro: { has: null, age: null },
    metabolic: { has: null, age: null },
  };
}

export function isFamilyHistoryComplete(a: FamilyHistoryAnswers): boolean {
  return (
    a.sex !== null &&
    a.cvd.has !== null &&
    a.cancer.has !== null &&
    a.neuro.has !== null &&
    a.metabolic.has !== null
  );
}

export interface CategoryResult {
  level: FlagLevel;
  source: string | null;
  text: string;
  steps: string[];
}

export const CANCER_TYPE_OPTIONS: { value: CancerType; label: string }[] = [
  { value: "breast", label: "Breast" },
  { value: "colorectal", label: "Colorectal" },
  { value: "ovarian", label: "Ovarian" },
  { value: "other", label: "Other" },
];

function computeCvd(d: CategoryAnswer, sex: Sex | null): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: "No reported family history in this category.",
      steps: ["Keep up with routine cardiovascular screening as your doctor recommends."],
    };
  }
  // MOH: male <50, female <60; defaults to the stricter (male) threshold if sex unanswered.
  const threshold = sex === "female" ? 60 : 50;
  const early = d.age != null && d.age < threshold;
  if (early) {
    return {
      level: "elevated",
      source: "🇸🇬 Singapore MOH",
      text: `Singapore's MOH Lipids guideline classifies a first-degree ${
        sex === "female" ? "female relative diagnosed before 60" : "male relative diagnosed before 50"
      } as "premature" family heart disease — a recognised risk-enhancing factor.`,
      steps: [
        "Ask your doctor about earlier and more frequent blood pressure and cholesterol checks.",
        "Ask about the Singapore-modified Framingham Risk Score (SG-FRS) to put your own numbers in context.",
      ],
    };
  }
  return {
    level: "present",
    source: "🇸🇬 Singapore MOH",
    text: "Family history of heart disease still matters, even without early onset — it's worth mentioning at your next check-up.",
    steps: ["Bring this up at your next routine check-up.", "Keep your blood pressure and cholesterol checks on schedule."],
  };
}

function computeCancer(d: CategoryAnswer & { type: CancerType | null }): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: "No reported family history in this category.",
      steps: ["Keep up with routine age-appropriate cancer screening."],
    };
  }
  const early = d.age != null && d.age <= 60;
  const level: FlagLevel = early ? "elevated" : "present";

  if (d.type === "colorectal") {
    const startAge = early ? (d.age != null ? Math.min(40, d.age - 10) : 40) : 50;
    const interval = early ? 5 : 10;
    return {
      level,
      source: "🇸🇬 Singapore MOH",
      text: early
        ? "Singapore's MOH guideline classifies a first-degree relative with colorectal cancer at 60 or younger as needing earlier, more frequent screening."
        : "Even with a later diagnosis in the family, MOH guidance still recommends starting colorectal screening earlier than the general population.",
      steps: [
        `MOH guidance: start colonoscopy screening at age ${startAge}, repeated every ${interval} years.`,
        "Share this with your doctor to confirm the right starting point for you.",
      ],
    };
  }
  if (d.type === "breast") {
    return {
      level,
      source: "🌐 International (mixed evidence)",
      text: early
        ? "A first-degree relative with breast cancer at 60 or younger is a recognised reason to consider starting mammography earlier than the general population."
        : "Family history of breast cancer still raises your own risk, even with a later diagnosis.",
      steps: early
        ? [
            "Guidelines commonly suggest starting roughly 10 years before your relative's age at diagnosis — though recent research (BCSC, 2022) questions applying this uniformly, especially for relatives diagnosed 35–45. Discuss the right starting point with your doctor.",
            "Share your relative's exact age and cancer subtype — these details change the recommendation.",
          ]
        : ["Mention it at your next check-up.", "Keep up with age-appropriate mammography screening."],
    };
  }
  return {
    level,
    source: "🌐 International (NCCN)",
    text: early
      ? "Early-onset cancer in a first-degree relative — or certain cancers (breast, ovarian, colorectal) running in the family — can point to an inherited gene mutation such as BRCA1/2 or Lynch syndrome."
      : "Family history of cancer is worth tracking even without early onset.",
    steps: early
      ? [
          "Consider asking your doctor for a referral to genetic counselling.",
          "Share exactly which relative, which cancer, and their age at diagnosis — these details change the recommendation.",
        ]
      : ["Mention it at your next check-up.", "Keep up with age-appropriate cancer screening."],
  };
}

function computeNeuro(d: CategoryAnswer): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: "No reported family history in this category.",
      steps: ["Our Cognitive Decline Risk check is still a good baseline to establish, regardless of family history."],
    };
  }
  const early = d.age != null && d.age < 65;
  if (early) {
    return {
      level: "elevated",
      source: "🌐 International",
      text: "A first-degree relative diagnosed before 65 is classed as early-onset — rarer, and in a small share of cases linked to an inherited form (genes such as PSEN1 or APP) rather than just raising general risk.",
      steps: [
        "Discuss your family history with your doctor, especially the early age of onset.",
        "Ask about a referral to genetic counselling if you want to explore this further — this is where testing is most likely to be informative.",
        "Our Cognitive Decline Risk check is a good next step to establish your own baseline.",
      ],
    };
  }
  return {
    level: "present",
    source: "🌐 International",
    text: "Family history of dementia or Parkinson's after 65 is a well-documented risk factor, though routine genetic testing generally isn't recommended at this stage — it's a risk modifier, not a diagnosis.",
    steps: ["Mention it at your next check-up.", "Our Cognitive Decline Risk check is a good next step to establish your own baseline."],
  };
}

function computeMetabolic(d: CategoryAnswer): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: "No reported family history in this category.",
      steps: ["Keep up with routine metabolic screening (blood sugar, weight) as your doctor recommends."],
    };
  }
  const veryEarly = d.age != null && d.age < 35;
  return {
    level: veryEarly ? "elevated" : "present",
    source: "🇸🇬 Singapore MOH",
    text: veryEarly
      ? "A relative diagnosed with diabetes quite young (under 35) is worth specifically mentioning to your doctor — very early-onset diabetes in a family sometimes follows a stronger genetic pattern."
      : "Singapore's MOH guideline treats any first-degree relative with diabetes as a screening risk factor, regardless of the age they were diagnosed — this is also one of the most modifiable categories here.",
    steps: [
      "Ask about screening — MOH recommends it for adults with a family history of diabetes at any age.",
      "For Asians, the BMI threshold for increased risk is lower than Western guidelines (≥23, vs ≥25) — worth knowing your own number.",
      "Lifestyle changes meaningfully reduce this risk — see our Daily Movement and Nutrition checks.",
    ],
  };
}

export const FAMILY_HISTORY_CATEGORIES = [
  { key: "cvd" as const, title: "Cardiovascular Disease", sub: "Heart attack, stroke, or heart disease in a parent, sibling, or child.", compute: computeCvd },
  { key: "cancer" as const, title: "Cancer", sub: "Breast, ovarian, colorectal, or other cancer in a parent, sibling, or child.", compute: computeCancer },
  { key: "neuro" as const, title: "Alzheimer's / Neurological Disease", sub: "Dementia, Parkinson's, or another neurological condition in a parent, sibling, or child.", compute: computeNeuro },
  { key: "metabolic" as const, title: "Metabolic Disease", sub: "Diabetes, obesity, or metabolic syndrome in a parent, sibling, or child.", compute: computeMetabolic },
];

export function summarizeFamilyHistory(answers: FamilyHistoryAnswers) {
  const results = {
    cvd: computeCvd(answers.cvd, answers.sex),
    cancer: computeCancer(answers.cancer),
    neuro: computeNeuro(answers.neuro),
    metabolic: computeMetabolic(answers.metabolic),
  };
  const levels = Object.values(results).map((r) => r.level);
  const flaggedCount = levels.filter((l) => l !== "none").length;
  const elevatedCount = levels.filter((l) => l === "elevated").length;
  return { results, flaggedCount, elevatedCount };
}
