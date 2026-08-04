// Ported from proageing-site/purpose-in-life.html — the Ikigai-9 (Imai,
// Osada & Nishimura, 2012), a validated Japanese scale across three
// 3-item subscales. No reverse-scored items.

export const IKIGAI_QUESTIONS = [
  { key: "q1", text: "I often feel that I am happy.", sub: "feelings" },
  { key: "q2", text: "My life is mentally rich and fulfilled.", sub: "feelings" },
  { key: "q3", text: "I am interested in many things.", sub: "feelings" },
  { key: "q4", text: "I would like to develop myself.", sub: "future" },
  { key: "q5", text: "I would like to learn something new or start something.", sub: "future" },
  { key: "q6", text: "I have room in my mind.", sub: "future" },
  { key: "q7", text: "I believe that I have some impact on someone.", sub: "meaning" },
  { key: "q8", text: "I feel that I am contributing to someone or to society.", sub: "meaning" },
  { key: "q9", text: "I think that my existence is needed by something or someone.", sub: "meaning" },
] as const;

export type IkigaiKey = (typeof IKIGAI_QUESTIONS)[number]["key"];
export type IkigaiSub = "feelings" | "future" | "meaning";

export const AGREEMENT_OPTIONS = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

export type IkigaiAnswers = Record<IkigaiKey, number | null>;

export function emptyIkigaiAnswers(): IkigaiAnswers {
  return { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null, q8: null, q9: null };
}

export function isIkigaiComplete(a: IkigaiAnswers): boolean {
  return IKIGAI_QUESTIONS.every((q) => a[q.key] !== null);
}

export const SUBSCALE_META: { key: IkigaiSub; label: string }[] = [
  { key: "feelings", label: "Positive feelings towards life" },
  { key: "future", label: "Active attitude towards the future" },
  { key: "meaning", label: "Sense that your existence matters" },
];

export interface IkigaiScore {
  total: number; // 9-45
  subs: Record<IkigaiSub, number>; // each 3-15
}

export function computeIkigaiScore(a: IkigaiAnswers): IkigaiScore {
  const subs: Record<IkigaiSub, number> = { feelings: 0, future: 0, meaning: 0 };
  let total = 0;
  for (const q of IKIGAI_QUESTIONS) {
    const v = a[q.key] ?? 0;
    total += v;
    subs[q.sub as IkigaiSub] += v;
  }
  return { total, subs };
}

export interface IkigaiResult {
  status: "low" | "mid" | "high";
  label: string;
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretIkigaiScore(total: number): IkigaiResult {
  if (total <= 20) {
    return {
      status: "low",
      label: "Lower sense of ikigai right now",
      title: "This is worth paying attention to",
      text: 'Your answers suggest your sense of "reason for being" feels thin right now. That\'s a common, changeable state — not a diagnosis — and often shifts when you reconnect with activities, people, or goals that matter to you.',
      nextSteps: [
        "Look at your lowest-scoring theme below — that's the most useful place to start.",
        "Pick one small activity this week that feels meaningful, not just necessary.",
        "If low motivation or low mood has lasted more than two weeks, mention it to your doctor.",
      ],
    };
  }
  if (total <= 32) {
    return {
      status: "mid",
      label: "Moderate sense of ikigai",
      title: "A fairly typical, mixed picture",
      text: "Some parts of your life feel purposeful, others less so — which is normal. Research links even modest gains in purpose-related measures with better health outcomes over time, so small changes can still be worthwhile.",
      nextSteps: [
        "Notice which theme below scores lowest, and try one small step towards it this week.",
        "Consider a small goal or role (volunteering, a hobby, family involvement) that gives structure to your week.",
        "Retake this check in a few weeks to track any shift.",
      ],
    };
  }
  return {
    status: "high",
    label: "Strong sense of ikigai",
    title: "A real protective factor",
    text: "Your answers reflect a strong, consistent sense of purpose across all three themes — one of the more robust psychological correlates of healthy ageing in the research literature. Whatever is giving your days meaning right now, it's worth protecting.",
    nextSteps: [
      "Keep investing time in the activities and relationships driving this.",
      "Retake this check every few months — ikigai can shift with life changes like retirement or loss.",
      "Share what's working with someone else — purpose is often contagious.",
    ],
  };
}
