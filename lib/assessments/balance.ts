// Ported from proageing-site/balance.html — the One-Leg Standing Test
// (eyes open), timed up to a 60-second cap. Norms: Seino S, Shinkai S,
// Fujiwara Y, et al. PLOS ONE. 2014;9(6):e99487 (pooled analysis of 4,683
// community-dwelling older Japanese adults). Fall-risk link: Vellas B, et
// al. J Am Geriatr Soc. 1997;45(6):735–738 — under 5s is flagged.

export type Sex = "m" | "f";
export type AgeBand5 = "65-69" | "70-74" | "75-79" | "80-84" | "85+";

export const TIME_CAP = 60;

interface Norm {
  mean: number;
  sd: number;
}

const BALANCE_NORMS: Record<Sex, Record<AgeBand5, Norm>> = {
  m: {
    "65-69": { mean: 51.0, sd: 9.8 },
    "70-74": { mean: 48.8, sd: 12.2 },
    "75-79": { mean: 42.3, sd: 16.8 },
    "80-84": { mean: 32.5, sd: 20.2 },
    "85+": { mean: 23.6, sd: 21.9 },
  },
  f: {
    "65-69": { mean: 50.1, sd: 10.7 },
    "70-74": { mean: 46.1, sd: 15.0 },
    "75-79": { mean: 38.1, sd: 18.8 },
    "80-84": { mean: 26.9, sd: 20.8 },
    "85+": { mean: 17.3, sd: 19.4 },
  },
};

export function ageBand(age: number): AgeBand5 {
  if (age < 70) return "65-69";
  if (age < 75) return "70-74";
  if (age < 80) return "75-79";
  if (age < 85) return "80-84";
  return "85+";
}

export function getNormRange(sex: Sex, age: number): [number, number] {
  const norm = BALANCE_NORMS[sex][ageBand(age)];
  return [Math.max(0, norm.mean - norm.sd), Math.min(TIME_CAP, norm.mean + norm.sd)];
}

export interface BalanceAnswers {
  hasSupport: boolean | null;
  safe: boolean | null;
  age: number;
  sex: Sex | null;
  time: number; // seconds, one decimal
}

export function emptyBalanceAnswers(): BalanceAnswers {
  return { hasSupport: null, safe: null, age: 65, sex: null, time: 0 };
}

export function isSafetyComplete(a: BalanceAnswers): boolean {
  return a.hasSupport !== null && a.safe !== null && a.sex !== null;
}

export function isUnsafe(a: BalanceAnswers): boolean {
  return a.hasSupport === false || a.safe === false;
}

export interface BalanceResult {
  status: "below" | "typical" | "above";
  label: string;
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretBalance(time: number, sex: Sex, age: number): BalanceResult {
  const [lo, hi] = getNormRange(sex, age);
  if (time < lo) {
    return {
      status: "below",
      label: "Below typical range for your age group",
      title: "A good focus area",
      text: "Balance is one of the most trainable physical abilities at any age — simple daily practice (like standing on one leg while brushing your teeth) can meaningfully improve it within weeks.",
      nextSteps: [
        "Practise standing on one leg near a counter for 10–20 seconds, a few times a day.",
        "Mention this result to your doctor, especially alongside any recent unsteadiness or falls.",
        "Recheck in a few weeks to track progress.",
      ],
    };
  }
  if (time > hi) {
    return {
      status: "above",
      label: "Above typical range for your age group",
      title: "Strong, steady balance",
      text: "Your balance is above typical for your age and sex — one of the most consistent protective factors against falls. Whatever you're doing, it's working.",
      nextSteps: ["Keep up whatever activity is supporting this.", "Recheck every few months to keep tracking your trend."],
    };
  }
  return {
    status: "typical",
    label: "Typical for your age group",
    title: "A solid, typical result",
    text: "You're in the typical range for your age and sex. Balance naturally declines with age, so it's worth keeping an eye on this over time, especially alongside strength.",
    nextSteps: ["Try adding balance practice a few times a week to stay ahead of the typical decline.", "Recheck every few months to track your trend."],
  };
}
