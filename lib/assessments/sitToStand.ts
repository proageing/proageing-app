// Ported from proageing-site/sit-to-stand.html — the 30-second chair
// stand test. Norms: Rikli RE, Jones CJ. Functional Fitness Normative
// Scores for Community-Residing Older Adults, Ages 60-94. J Aging Phys
// Act. 1999;7:162-181 (N=7,183). All seven of the study's published
// 5-year bands are used below.
//
// The study population starts at 60 — there is no published 50-59 band
// for this test, in this source or any other reference found. Rather than
// extrapolate invented numbers, ages 50-59 are deliberately scored against
// the 60-64 band: it's the youngest real data available, applying it
// downward is conservative (a 50-something scoring below it is a stronger
// signal, not a weaker one), and this is a 50+ product, so the UI floors
// age input at 50, not 60.
//
// The live camera mirror and demo video from the source are intentionally
// not ported — they're a self-view aid and a form demonstration, not part
// of the measurement itself. The 30-second timer and manual rep count
// (the actual test) are ported faithfully.

export type AgeBand = "60-64" | "65-69" | "70-74" | "75-79" | "80-84" | "85-89" | "90-94";
export type Sex = "m" | "f";

export interface SitToStandAnswers {
  chairReady: boolean | null;
  safe: boolean | null;
  age: number;
  sex: Sex | null;
  reps: number;
}

export function emptySitToStandAnswers(): SitToStandAnswers {
  return { chairReady: null, safe: null, age: 65, sex: null, reps: 0 };
}

export function isSafetyComplete(a: SitToStandAnswers): boolean {
  return a.chairReady !== null && a.safe !== null && a.sex !== null;
}

export function isUnsafe(a: SitToStandAnswers): boolean {
  return a.chairReady === false || a.safe === false;
}

// The published bands top out at 90-94; ages beyond that are scored
// against the 90-94 band rather than extrapolated further, same
// end-of-table convention used in vo2max.ts.
export function ageBand(age: number): AgeBand {
  if (age < 65) return "60-64";
  if (age < 70) return "65-69";
  if (age < 75) return "70-74";
  if (age < 80) return "75-79";
  if (age < 85) return "80-84";
  if (age < 90) return "85-89";
  return "90-94";
}

// Rikli & Jones (1999), Table 2 — normal range (middle 50%) per 5-year
// band, in stands per 30 seconds.
const NORMS: Record<Sex, Record<AgeBand, [number, number]>> = {
  f: {
    "60-64": [12, 17],
    "65-69": [11, 16],
    "70-74": [10, 15],
    "75-79": [10, 15],
    "80-84": [9, 14],
    "85-89": [8, 13],
    "90-94": [4, 11],
  },
  m: {
    "60-64": [14, 19],
    "65-69": [12, 18],
    "70-74": [12, 17],
    "75-79": [11, 17],
    "80-84": [10, 15],
    "85-89": [8, 14],
    "90-94": [7, 12],
  },
};

export function getNormRange(sex: Sex, age: number): [number, number] {
  return NORMS[sex][ageBand(age)];
}

export interface SitToStandResult {
  status: "below" | "within" | "above";
  label: string;
  title: string;
  text: string;
}

export function interpretSitToStand(score: number, sex: Sex, age: number): SitToStandResult {
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
