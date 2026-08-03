import type { Dictionary } from "@/lib/i18n/en";

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

// The interpretation text here branches on age thresholds, so unlike the
// other checks it can't be a simple status lookup in the page. Instead the
// copy is passed in and the branching stays here, in one place -- the
// thresholds (MOH male <50 / female <60, cancer ≤60, neuro <65, diabetes
// <35) are never duplicated per language.
export type FamilyHistoryCopy = Dictionary["assess"]["familyHistory"];

export interface CategoryResult {
  level: FlagLevel;
  source: string | null;
  text: string;
  steps: string[];
}

export const CANCER_TYPES: CancerType[] = ["breast", "colorectal", "ovarian", "other"];

function computeCvd(d: CategoryAnswer, sex: Sex | null, c: FamilyHistoryCopy): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: c.noneText,
      steps: c.noneSteps.cvd,
    };
  }
  // MOH: male <50, female <60; defaults to the stricter (male) threshold if sex unanswered.
  const threshold = sex === "female" ? 60 : 50;
  const early = d.age != null && d.age < threshold;
  if (early) {
    return {
      level: "elevated",
      source: "🇸🇬 Singapore MOH",
      text: c.cvd.earlyText(sex === "female" ? c.cvd.femaleRelative : c.cvd.maleRelative),
      steps: c.cvd.earlySteps,
    };
  }
  return {
    level: "present",
    source: "🇸🇬 Singapore MOH",
    text: c.cvd.presentText,
    steps: c.cvd.presentSteps,
  };
}

function computeCancer(d: CategoryAnswer & { type: CancerType | null }, c: FamilyHistoryCopy): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: c.noneText,
      steps: c.noneSteps.cancer,
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
      text: early ? c.cancer.colorectalEarly : c.cancer.colorectalLate,
      steps: [c.cancer.colorectalStep(startAge, interval), c.cancer.colorectalStep2],
    };
  }
  if (d.type === "breast") {
    return {
      level,
      source: "🌐 International (mixed evidence)",
      text: early ? c.cancer.breastEarly : c.cancer.breastLate,
      steps: early ? c.cancer.breastEarlySteps : c.cancer.breastLateSteps,
    };
  }
  return {
    level,
    source: "🌐 International (NCCN)",
    text: early ? c.cancer.otherEarly : c.cancer.otherLate,
    steps: early ? c.cancer.otherEarlySteps : c.cancer.otherLateSteps,
  };
}

function computeNeuro(d: CategoryAnswer, c: FamilyHistoryCopy): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: c.noneText,
      steps: c.noneSteps.neuro,
    };
  }
  const early = d.age != null && d.age < 65;
  if (early) {
    return {
      level: "elevated",
      source: "🌐 International",
      text: c.neuro.earlyText,
      steps: c.neuro.earlySteps,
    };
  }
  return {
    level: "present",
    source: "🌐 International",
    text: c.neuro.presentText,
    steps: c.neuro.presentSteps,
  };
}

function computeMetabolic(d: CategoryAnswer, c: FamilyHistoryCopy): CategoryResult {
  if (!d.has) {
    return {
      level: "none",
      source: null,
      text: c.noneText,
      steps: c.noneSteps.metabolic,
    };
  }
  const veryEarly = d.age != null && d.age < 35;
  return {
    level: veryEarly ? "elevated" : "present",
    source: "🇸🇬 Singapore MOH",
    text: veryEarly ? c.metabolic.veryEarlyText : c.metabolic.presentText,
    steps: c.metabolic.steps,
  };
}

export const FAMILY_HISTORY_KEYS = ["cvd", "cancer", "neuro", "metabolic"] as const;
export type FamilyHistoryKey = (typeof FAMILY_HISTORY_KEYS)[number];

export function summarizeFamilyHistory(answers: FamilyHistoryAnswers, c: FamilyHistoryCopy) {
  const results = {
    cvd: computeCvd(answers.cvd, answers.sex, c),
    cancer: computeCancer(answers.cancer, c),
    neuro: computeNeuro(answers.neuro, c),
    metabolic: computeMetabolic(answers.metabolic, c),
  };
  const levels = Object.values(results).map((r) => r.level);
  const flaggedCount = levels.filter((l) => l !== "none").length;
  const elevatedCount = levels.filter((l) => l === "elevated").length;
  return { results, flaggedCount, elevatedCount };
}
