// Ported from proageing-site/sit-to-stand.html — the 30-second chair
// stand test (Rikli & Jones Senior Fitness Test). Reference ranges are
// illustrative, per the source's own comment: "verify against primary
// source before production use."
//
// The live camera mirror and demo video from the source are intentionally
// not ported — they're a self-view aid and a form demonstration, not part
// of the measurement itself. The 30-second timer and manual rep count
// (the actual test) are ported faithfully.

export type AgeBand = 60 | 70 | 80;
export type Sex = "m" | "f";

export interface SitToStandAnswers {
  chairReady: boolean | null;
  safe: boolean | null;
  age: AgeBand | null;
  sex: Sex | null;
  reps: number;
}

export function emptySitToStandAnswers(): SitToStandAnswers {
  return { chairReady: null, safe: null, age: null, sex: null, reps: 0 };
}

export function isSafetyComplete(a: SitToStandAnswers): boolean {
  return a.chairReady !== null && a.safe !== null && a.age !== null && a.sex !== null;
}

export function isUnsafe(a: SitToStandAnswers): boolean {
  return a.chairReady === false || a.safe === false;
}

// Illustrative reference ranges (Rikli & Jones, Senior Fitness Test).
const NORMS: Record<Sex, Record<AgeBand, [number, number]>> = {
  f: { 60: [12, 17], 70: [10, 15], 80: [9, 14] },
  m: { 60: [14, 19], 70: [12, 17], 80: [10, 15] },
};

export function getNormRange(sex: Sex, age: AgeBand): [number, number] {
  return NORMS[sex][age];
}

export interface SitToStandResult {
  status: "below" | "within" | "above";
  label: string;
  title: string;
  text: string;
}

export function interpretSitToStand(score: number, sex: Sex, age: AgeBand): SitToStandResult {
  const [lo, hi] = getNormRange(sex, age);
  if (score < lo) {
    return {
      status: "below",
      label: "Below typical range for your age group",
      title: "This is a signal, not a diagnosis",
      text: "Lower-body strength is one of the most trainable aspects of ageing — research shows meaningful improvement is possible within 8–12 weeks of consistent, simple exercise. Worth mentioning at your next doctor visit, especially alongside any recent changes in balance or stair-climbing.",
    };
  }
  if (score > hi) {
    return {
      status: "above",
      label: "Above typical range for your age group",
      title: "Stronger than most peers your age",
      text: "This is strongly associated with staying independent and lowering fall risk as you age. Whatever you're doing for activity, it's working — keep it up.",
    };
  }
  return {
    status: "within",
    label: "Within typical range for your age group",
    title: "Holding steady",
    text: "Your lower-body strength is where we'd expect for your age. This is exactly the kind of measure that quietly declines if it isn't used — regular movement helps you stay right here.",
  };
}
