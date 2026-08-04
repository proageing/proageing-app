// Ported from proageing-site/vo2max.html — HRmax via Tanaka, Monahan &
// Seals (2001); VO2max via the Heart Rate Ratio Method (Uth et al., Eur J
// Appl Physiol, 2004): VO2max ≈ 15.3 × (HRmax ÷ resting HR). Fitness
// categories from the Cooper Institute's Aerobics Center Longitudinal
// Study (reproduced in ACSM's Guidelines for Exercise Testing and
// Prescription, 11th ed.).

export type Sex = "m" | "f";

interface VO2Norm {
  poorMax: number;
  fairMax: number;
  avgMax: number;
  goodMax: number;
  excMax: number;
}

const VO2_NORMS: Record<Sex, Record<"50-59" | "60-69" | "70-79", VO2Norm>> = {
  m: {
    "50-59": { poorMax: 20.9, fairMax: 27.1, avgMax: 39.7, goodMax: 45.6, excMax: 50.7 },
    "60-69": { poorMax: 17.4, fairMax: 23.7, avgMax: 34.5, goodMax: 40.3, excMax: 43.0 },
    "70-79": { poorMax: 16.3, fairMax: 20.4, avgMax: 30.4, goodMax: 36.6, excMax: 39.7 },
  },
  f: {
    "50-59": { poorMax: 16.0, fairMax: 19.9, avgMax: 27.6, goodMax: 32.0, excMax: 35.9 },
    "60-69": { poorMax: 13.4, fairMax: 17.2, avgMax: 23.8, goodMax: 27.0, excMax: 29.4 },
    "70-79": { poorMax: 13.1, fairMax: 15.6, avgMax: 20.8, goodMax: 23.1, excMax: 24.1 },
  },
};

// Matches the source exactly: only three age bands exist, so anyone 70+
// maps to 70-79 — not fixing this, faithfulness to the original
// instrument is the point. The under-60 branch is exactly the 50-59 band
// the UI's age input is floored to (this is a 50+ product), so it's no
// longer a catch-all for arbitrarily younger ages.
function ageBand(age: number): "50-59" | "60-69" | "70-79" {
  if (age < 60) return "50-59";
  if (age < 70) return "60-69";
  return "70-79";
}

export interface VO2Category {
  status: "poor" | "fair" | "average" | "good" | "excellent" | "superior";
  label: string;
}

export function classifyVO2(vo2: number, sex: Sex, age: number): VO2Category {
  const n = VO2_NORMS[sex][ageBand(age)];
  if (vo2 < n.poorMax) return { status: "poor", label: "Poor for your age & sex" };
  if (vo2 < n.fairMax) return { status: "fair", label: "Fair for your age & sex" };
  if (vo2 < n.avgMax) return { status: "average", label: "Average for your age & sex" };
  if (vo2 < n.goodMax) return { status: "good", label: "Good for your age & sex" };
  if (vo2 < n.excMax) return { status: "excellent", label: "Excellent for your age & sex" };
  return { status: "superior", label: "Superior for your age & sex" };
}

export interface VO2Answers {
  age: number;
  sex: Sex | null;
  rhr: number; // resting heart rate, bpm
}

export function emptyVO2Answers(): VO2Answers {
  return { age: 65, sex: null, rhr: 70 };
}

export interface VO2Score {
  hrMax: number;
  vo2max: number;
}

export function computeVO2Max(a: VO2Answers): VO2Score {
  const hrMax = Math.round(208 - 0.7 * a.age);
  const vo2max = Math.round(15.3 * (hrMax / a.rhr) * 10) / 10;
  return { hrMax, vo2max };
}

export interface VO2Result {
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretVO2Category(status: VO2Category["status"]): VO2Result {
  if (status === "poor" || status === "fair") {
    return {
      title: "There is real room to improve",
      text: "Cardiorespiratory fitness responds well to regular moderate exercise at any age — even modest gains are linked to meaningfully lower long-term mortality risk in research. Zone 2 training (see the Training Zone Finder) is a good place to start.",
      nextSteps: [
        "Aim for 20–30 minutes of moderate activity most days — walking counts.",
        "Try a Training Zone Finder to find your ideal effort level.",
        "Recheck in a few months as your resting heart rate improves.",
      ],
    };
  }
  if (status === "average") {
    return {
      title: "A solid, typical fitness level",
      text: "You're in the typical range for your age and sex. Research shows that moving from average to good fitness is linked to a meaningful further drop in long-term health risk — worth the effort.",
      nextSteps: [
        "Add one more session of moderate cardio activity per week.",
        "Track your resting heart rate over time — a falling trend is a good sign of improving fitness.",
        "Recheck every few months.",
      ],
    };
  }
  return {
    title: "A strong protective factor",
    text: "Your estimated fitness is above typical for your age and sex — one of the most consistent markers linked to healthy, independent ageing in the research. Whatever you're doing, it's working.",
    nextSteps: [
      "Keep up your current activity routine.",
      "Recheck every few months to keep tracking your trend.",
      "Consider mixing in some higher-intensity intervals if your doctor is comfortable with that.",
    ],
  };
}
