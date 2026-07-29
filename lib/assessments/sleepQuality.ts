// Ported from proageing-site/sleep-quality.html — the Pittsburgh Sleep
// Quality Index (PSQI; Buysse et al., 1989), scored per the official
// University of Pittsburgh scoring guide. Q5j (write-in "other" disturbance)
// is intentionally omitted from C5, matching the source's rule of treating
// a blank/no-comment item as 0.

export const DISTURBANCE_ITEMS = [
  { key: "q5a", text: "Cannot get to sleep within 30 minutes" },
  { key: "q5b", text: "Wake up in the middle of the night or early morning" },
  { key: "q5c", text: "Have to get up to use the bathroom" },
  { key: "q5d", text: "Cannot breathe comfortably" },
  { key: "q5e", text: "Cough or snore loudly" },
  { key: "q5f", text: "Feel too cold" },
  { key: "q5g", text: "Feel too hot" },
  { key: "q5h", text: "Had bad dreams" },
  { key: "q5i", text: "Have pain" },
] as const;

export type DisturbanceKey = (typeof DISTURBANCE_ITEMS)[number]["key"];

export const FREQUENCY_PILL_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "<1x/wk" },
  { value: 2, label: "1–2x/wk" },
  { value: 3, label: "3+/wk" },
];

export const QUALITY_OPTIONS = [
  { value: 0, label: "Very good" },
  { value: 1, label: "Fairly good" },
  { value: 2, label: "Fairly bad" },
  { value: 3, label: "Very bad" },
];

export const MEDS_OPTIONS = [
  { value: 0, label: "Not during the past month" },
  { value: 1, label: "Less than once a week" },
  { value: 2, label: "Once or twice a week" },
  { value: 3, label: "Three or more times a week" },
];

export const DAYTIME_TROUBLE_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "<1x/wk" },
  { value: 2, label: "1–2x/wk" },
  { value: 3, label: "3+/wk" },
];

export const ENTHUSIASM_OPTIONS = [
  { value: 0, label: "No problem" },
  { value: 1, label: "Slight" },
  { value: 2, label: "Somewhat" },
  { value: 3, label: "A big problem" },
];

export interface SleepAnswers {
  bedTime: string; // "HH:MM"
  wakeTime: string; // "HH:MM"
  latency: number; // minutes to fall asleep
  sleepHours: number;
  q5a: number | null;
  q5b: number | null;
  q5c: number | null;
  q5d: number | null;
  q5e: number | null;
  q5f: number | null;
  q5g: number | null;
  q5h: number | null;
  q5i: number | null;
  q6: number | null; // overall quality
  q7: number | null; // medication use
  q8: number | null; // daytime trouble staying awake
  q9: number | null; // enthusiasm problem
}

export function emptySleepAnswers(): SleepAnswers {
  return {
    bedTime: "22:30",
    wakeTime: "07:00",
    latency: 15,
    sleepHours: 7,
    q5a: null, q5b: null, q5c: null, q5d: null, q5e: null, q5f: null, q5g: null, q5h: null, q5i: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
  };
}

export function isDisturbancesComplete(a: SleepAnswers): boolean {
  return DISTURBANCE_ITEMS.every((item) => a[item.key as DisturbanceKey] !== null);
}

export interface PSQIResult {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
  c7: number;
  total: number;
  efficiency: number;
  hoursInBed: number;
}

export function computePSQI(a: SleepAnswers): PSQIResult {
  // C1: Subjective sleep quality
  const c1 = a.q6 ?? 0;

  // C2: Sleep latency
  let q2new: number;
  if (a.latency <= 15) q2new = 0;
  else if (a.latency <= 30) q2new = 1;
  else if (a.latency <= 60) q2new = 2;
  else q2new = 3;
  const latenSum = q2new + (a.q5a ?? 0);
  let c2: number;
  if (latenSum === 0) c2 = 0;
  else if (latenSum <= 2) c2 = 1;
  else if (latenSum <= 4) c2 = 2;
  else c2 = 3;

  // C3: Sleep duration
  let c3: number;
  if (a.sleepHours >= 7) c3 = 0;
  else if (a.sleepHours >= 6) c3 = 1;
  else if (a.sleepHours >= 5) c3 = 2;
  else c3 = 3;

  // C4: Habitual sleep efficiency
  const [bh, bm] = a.bedTime.split(":").map(Number);
  const [wh, wm] = a.wakeTime.split(":").map(Number);
  let diffMin = wh * 60 + wm - (bh * 60 + bm);
  if (diffMin <= 0) diffMin += 24 * 60;
  const hoursInBed = diffMin / 60;
  const efficiency = Math.min(100, (a.sleepHours / hoursInBed) * 100);
  let c4: number;
  if (efficiency >= 85) c4 = 0;
  else if (efficiency >= 75) c4 = 1;
  else if (efficiency >= 65) c4 = 2;
  else c4 = 3;

  // C5: Sleep disturbances (Q5b..Q5i; Q5j omitted, per official rule for blank/no comment)
  const distbSum =
    (a.q5b ?? 0) + (a.q5c ?? 0) + (a.q5d ?? 0) + (a.q5e ?? 0) + (a.q5f ?? 0) + (a.q5g ?? 0) + (a.q5h ?? 0) + (a.q5i ?? 0);
  let c5: number;
  if (distbSum === 0) c5 = 0;
  else if (distbSum <= 9) c5 = 1;
  else if (distbSum <= 18) c5 = 2;
  else c5 = 3;

  // C6: Use of sleep medication
  const c6 = a.q7 ?? 0;

  // C7: Daytime dysfunction
  const daydysSum = (a.q8 ?? 0) + (a.q9 ?? 0);
  let c7: number;
  if (daydysSum === 0) c7 = 0;
  else if (daydysSum <= 2) c7 = 1;
  else if (daydysSum <= 4) c7 = 2;
  else c7 = 3;

  const total = c1 + c2 + c3 + c4 + c5 + c6 + c7;
  return { c1, c2, c3, c4, c5, c6, c7, total, efficiency, hoursInBed };
}

export const PSQI_COMPONENTS: { key: keyof Pick<PSQIResult, "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7">; label: string }[] = [
  { key: "c1", label: "Sleep quality (your own rating)" },
  { key: "c2", label: "Sleep latency (time to fall asleep)" },
  { key: "c3", label: "Sleep duration" },
  { key: "c4", label: "Sleep efficiency" },
  { key: "c5", label: "Sleep disturbances" },
  { key: "c6", label: "Use of sleep medication" },
  { key: "c7", label: "Daytime dysfunction" },
];

export interface SleepResult {
  status: "good" | "poor";
  label: string;
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretPSQI(total: number): SleepResult {
  if (total <= 5) {
    return {
      status: "good",
      label: "Good sleep quality",
      title: "Your sleep looks solid overall",
      text: "A score of 5 or below is associated with good sleep quality in the research this check is based on. Keep doing what's working — consistent sleep habits are one of the most protective things for healthy ageing.",
      nextSteps: [
        "Keep a consistent bed and wake time, even on weekends.",
        "Retake this check in a few weeks if anything in your routine changes.",
        "Mention any new sleep issues at your next check-up.",
      ],
    };
  }
  return {
    status: "poor",
    label: "Poor sleep quality",
    title: "This is a signal worth acting on",
    text: "A score above 5 is associated with poor sleep quality in the research this check is based on. Sleep problems are common and very treatable — the breakdown below shows which parts of your sleep are affected most.",
    nextSteps: [
      "Look at your highest-scoring components below — that's the most useful place to start.",
      "Keep a consistent bed and wake time, and limit screens before bed.",
      "Bring this result to your doctor, especially if it continues for more than a few weeks.",
    ],
  };
}
