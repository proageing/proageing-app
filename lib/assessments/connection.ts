// Ported from proageing-site/connection.html — combines the Lubben Social
// Network Scale (LSNS-6; Lubben et al., The Gerontologist, 2006) with the
// UCLA-3 Loneliness Scale. Thresholds (family/friends subscale <6,
// loneliness >=6) are the Singapore-sample values reported in Ge, Yap &
// Heng, BMC Geriatrics 2022 (606 community-dwelling older adults), not the
// original Western norms — that study found loneliness, not network size
// alone, predicted frailty risk.

export const FREQUENCY_OPTIONS = [
  { value: 0, label: "None" },
  { value: 1, label: "One" },
  { value: 2, label: "Two" },
  { value: 3, label: "Three or four" },
  { value: 4, label: "Five to eight" },
  { value: 5, label: "Nine or more" },
];

export const LONELINESS_OPTIONS = [
  { value: 1, label: "Hardly ever" },
  { value: 2, label: "Some of the time" },
  { value: 3, label: "Often" },
];

export const CONNECTION_QUESTIONS = [
  { section: "Your family", key: "fam1", label: "How many relatives do you see or hear from at least once a month?", opts: FREQUENCY_OPTIONS },
  { section: "Your family", key: "fam2", label: "How many relatives do you feel at ease with that you can talk about private matters?", opts: FREQUENCY_OPTIONS },
  { section: "Your family", key: "fam3", label: "How many relatives do you feel close to, such that you could call on them for help?", opts: FREQUENCY_OPTIONS },
  { section: "Your friends", key: "fri1", label: "How many friends do you see or hear from at least once a month?", opts: FREQUENCY_OPTIONS },
  { section: "Your friends", key: "fri2", label: "How many friends do you feel at ease with that you can talk about private matters?", opts: FREQUENCY_OPTIONS },
  { section: "Your friends", key: "fri3", label: "How many friends do you feel close to, such that you could call on them for help?", opts: FREQUENCY_OPTIONS },
  { section: "How you've been feeling", key: "lon1", label: "How often do you feel that you lack companionship?", opts: LONELINESS_OPTIONS },
  { section: "How you've been feeling", key: "lon2", label: "How often do you feel left out?", opts: LONELINESS_OPTIONS },
  { section: "How you've been feeling", key: "lon3", label: "How often do you feel isolated from others?", opts: LONELINESS_OPTIONS },
] as const;

export type ConnectionKey = (typeof CONNECTION_QUESTIONS)[number]["key"];
export type ConnectionAnswers = Record<ConnectionKey, number | null>;

export function emptyConnectionAnswers(): ConnectionAnswers {
  return {
    fam1: null, fam2: null, fam3: null,
    fri1: null, fri2: null, fri3: null,
    lon1: null, lon2: null, lon3: null,
  };
}

export function isConnectionComplete(a: ConnectionAnswers): boolean {
  return CONNECTION_QUESTIONS.every((q) => a[q.key] !== null);
}

export interface ConnectionScore {
  family: number; // 0-15
  friends: number; // 0-15
  loneliness: number; // 3-9
}

export function computeConnectionScore(a: ConnectionAnswers): ConnectionScore {
  return {
    family: (a.fam1 ?? 0) + (a.fam2 ?? 0) + (a.fam3 ?? 0),
    friends: (a.fri1 ?? 0) + (a.fri2 ?? 0) + (a.fri3 ?? 0),
    loneliness: (a.lon1 ?? 0) + (a.lon2 ?? 0) + (a.lon3 ?? 0),
  };
}

export function networkFlag(v: number): "isolated" | "connected" {
  return v < 6 ? "isolated" : "connected";
}

export interface ConnectionResult {
  status: "good" | "watch" | "elevated";
  label: string;
  title: string;
  text: string;
  nextSteps: string[];
}

export function interpretLonelinessScore(total: number): ConnectionResult {
  if (total <= 3) {
    return {
      status: "good",
      label: "Not lonely",
      title: "A well-connected picture, going by how you feel",
      text: "In the Singapore study this check is based on, this is the range linked to lower frailty risk — feeling connected mattered more than network size alone.",
      nextSteps: [
        "Keep up whatever social participation is supporting this — it was independently linked to lower frailty in the same study.",
        "Recheck every few months, since this can shift with life changes.",
      ],
    };
  }
  if (total <= 5) {
    return {
      status: "watch",
      label: "Somewhat lonely",
      title: "Worth paying attention to",
      text: "This is the middle band — not the highest-risk range, but the Singapore study found loneliness at this level is worth taking seriously rather than waiting for it to become more pronounced.",
      nextSteps: [
        "Regular social participation (classes, clubs, volunteering) was linked to lower frailty in the same study, independent of network size.",
        "Recheck in a few months to see which direction this is moving.",
      ],
    };
  }
  return {
    status: "elevated",
    label: "Lonely",
    title: "Please take this seriously",
    text: 'A score of 6 or higher is the range the Singapore study classified as "lonely" — the one factor, among those measured, that was directly linked to higher frailty risk.',
    nextSteps: [
      "Consider talking to your doctor or a counsellor if this feeling has been persistent.",
      "Regular social participation (classes, clubs, volunteering) was linked to lower frailty independent of network size — even small, regular activities can help.",
    ],
  };
}
