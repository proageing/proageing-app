// Ported from proageing-site/cognitive-decline.html — the SLAS Risk Index
// (Ng TP, Lee TS, Lim WS, et al. J Prev Alzheimers Dis. 2021;8(3):335–344),
// developed and validated by the Singapore Longitudinal Ageing Study.
// Weighted field checklist: age, sex, education, depression, life
// satisfaction, hearing, and a count of 4 cardio-metabolic factors.

export type CognitiveKey = "age" | "sex" | "education" | "depression" | "lifeSat" | "hearing" | "waist" | "glucose" | "bp" | "lipids";

export const COGNITIVE_QUESTIONS: {
  section: string;
  key: CognitiveKey;
  question: string;
  opts: { value: number; label: string }[];
}[] = [
  {
    section: "About you",
    key: "age",
    question: "What is your age?",
    opts: [
      { value: 0, label: "Under 65" },
      { value: 1, label: "65–74" },
      { value: 2, label: "75 or older" },
    ],
  },
  {
    section: "About you",
    key: "sex",
    question: "What is your sex?",
    opts: [
      { value: 0, label: "Male" },
      { value: 1, label: "Female" },
    ],
  },
  {
    section: "About you",
    key: "education",
    question: "What is your highest level of education?",
    opts: [
      { value: 0, label: "Secondary school or higher" },
      { value: 3, label: "Primary school or no formal schooling" },
    ],
  },
  {
    section: "How you've been feeling",
    key: "depression",
    question:
      "Have you been treated for depression, or do you currently have 5 or more symptoms of depression (such as low mood, loss of interest, poor sleep, low energy, or poor concentration)?",
    opts: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    section: "How you've been feeling",
    key: "lifeSat",
    question: "Overall, would you say you are not very satisfied with your life?",
    opts: [
      { value: 0, label: "No, I'm satisfied" },
      { value: 1, label: "Yes, not very satisfied" },
    ],
  },
  {
    section: "Your senses",
    key: "hearing",
    question: "Do you have problems hearing well?",
    opts: [
      { value: 0, label: "No" },
      { value: 2, label: "Yes" },
    ],
  },
  {
    section: "Health markers (ask your doctor if unsure)",
    key: "waist",
    question: "Is your waist circumference wide? (over 90cm / 35in for men, over 80cm / 31in for women)",
    opts: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    section: "Health markers (ask your doctor if unsure)",
    key: "glucose",
    question: "Do you have pre-diabetes or diabetes, or take medicine for high blood sugar?",
    opts: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    section: "Health markers (ask your doctor if unsure)",
    key: "bp",
    question: "Do you have high blood pressure (130/85mmHg or more), or take medicine for it?",
    opts: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    section: "Health markers (ask your doctor if unsure)",
    key: "lipids",
    question: 'Do you have high triglycerides or low HDL ("good") cholesterol, or take medicine for abnormal blood lipids?',
    opts: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
];

export type CognitiveAnswers = Record<CognitiveKey, number | null>;

export function emptyCognitiveAnswers(): CognitiveAnswers {
  return {
    age: null, sex: null, education: null, depression: null, lifeSat: null,
    hearing: null, waist: null, glucose: null, bp: null, lipids: null,
  };
}

export function isCognitiveComplete(a: CognitiveAnswers): boolean {
  return COGNITIVE_QUESTIONS.every((q) => a[q.key] !== null);
}

export interface SLASScore {
  total: number; // 0-13
  cardioCount: number; // 0-4
  parts: { age: number; sex: number; education: number; depression: number; lifeSat: number; hearing: number; cardio: number };
}

export function computeSLASScore(a: CognitiveAnswers): SLASScore {
  const cardioCount = [a.waist, a.glucose, a.bp, a.lipids].filter((v) => v === 1).length;
  let cardioPts = 0;
  if (cardioCount >= 3) cardioPts = 3;
  else if (cardioCount >= 1) cardioPts = 2;

  const parts = {
    age: a.age ?? 0,
    sex: a.sex ?? 0,
    education: a.education ?? 0,
    depression: a.depression ?? 0,
    lifeSat: a.lifeSat ?? 0,
    hearing: a.hearing ?? 0,
    cardio: cardioPts,
  };
  const total = Object.values(parts).reduce((sum, v) => sum + v, 0);
  return { total, cardioCount, parts };
}

export interface SLASResult {
  status: "good" | "watch" | "elevated";
  label: string;
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretSLASScore(total: number): SLASResult {
  if (total <= 5) {
    return {
      status: "good",
      label: "Below the screening threshold",
      title: "A lower-risk profile right now",
      text: 'In the original research, scores below 6 were associated with a predicted MCI/dementia risk of well under 10% over 3–5 years — the range the study used as its "below threshold" band. Many of these factors (mood, hearing, metabolic health) are also changeable, so this is a good score to protect.',
      nextSteps: [
        "Look at \"What's behind your score\" below — any flagged item is worth addressing even at a lower total score.",
        "Recheck every few months, since scores can shift with health changes.",
        "Keep up whatever is keeping your metabolic health, hearing, and mood in good shape.",
      ],
    };
  }
  if (total <= 7) {
    return {
      status: "watch",
      label: "At the screening threshold",
      title: "Worth a conversation with your doctor",
      text: "A score of 6 or 7 is the exact threshold the original study used to identify people for a 6-month lifestyle support programme — not because dementia is present, but because this range is where early support made a measurable difference to cognitive test scores in that trial.",
      nextSteps: [
        "Share this result with your doctor — ask specifically about the flagged items below.",
        "Multidomain lifestyle programmes (exercise, diet, cognitive and social activity) are what the original study used at this score range.",
        "Recheck in a few months to see whether your score is trending down.",
      ],
    };
  }
  return {
    status: "elevated",
    label: "Above the screening threshold",
    title: "Please discuss this with your doctor soon",
    text: "In the original study, participants scoring 8 or higher had noticeably lower cognitive test scores than those at 6–7 — a large enough gap to matter clinically. This is a screening flag, not a diagnosis, but it's a strong enough signal to act on.",
    nextSteps: [
      "Book a check-up with your doctor and bring this result — ask about a proper cognitive assessment.",
      "Review the flagged items below together; several (blood pressure, hearing, mood) are treatable.",
      "Consider a structured lifestyle programme covering exercise, diet, and social and cognitive activity.",
    ],
  };
}

export function cognitiveComponentMeta(cardioCount: number) {
  return [
    { key: "age" as const, label: "Age", max: 2 },
    { key: "sex" as const, label: "Sex", max: 1 },
    { key: "education" as const, label: "Education", max: 3 },
    { key: "depression" as const, label: "Mood / depression", max: 1 },
    { key: "lifeSat" as const, label: "Life satisfaction", max: 1 },
    { key: "hearing" as const, label: "Hearing", max: 2 },
    { key: "cardio" as const, label: `Metabolic health (${cardioCount} of 4 factors)`, max: 3 },
  ];
}
