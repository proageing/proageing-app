// Step-by-step instruction for the daily Action.
//
// The programme's actions name techniques a beginner has no way to look up —
// "a strength snack", "the Singapore Longevity Plate", "Finger Breathing" —
// and several are physical movements where form matters. This maps each day
// to the techniques it needs, so the copy can name a thing and explain it in
// the same breath, the way day 1 already does for the Three Sources of
// Purpose.
//
// Keyed by slug rather than written per day because the moves repeat: the
// strength snack recurs on days 4, 11, 14 and 17, so improving the chair
// squat wording fixes it in four places at once. The wording itself lives in
// the i18n dictionaries, so a missing Chinese how-to fails the build.

export type HowToSlug =
  | "brisk-walk"
  | "chair-squat"
  | "wall-push-up"
  | "band-row"
  | "one-leg-stand"
  | "longevity-plate"
  | "finger-breathing"
  | "sunday-afternoon-test";

export interface HowTo {
  name: string;
  whatIs: string;
  steps: string[];
  easier?: string;
  stopIf?: string;
}

// Which techniques each day needs. Days not listed here either explain
// themselves already (day 1 defines its own terms) or ask for something with
// nothing to teach (day 13's "take the stairs").
export const HOW_TO_BY_DAY: Record<number, HowToSlug[]> = {
  3: ["brisk-walk"],
  4: ["chair-squat", "wall-push-up", "band-row"],
  8: ["brisk-walk"],
  9: ["one-leg-stand"],
  10: ["brisk-walk"],
  11: ["chair-squat", "band-row"],
  12: ["longevity-plate"],
  14: ["chair-squat"],
  15: ["finger-breathing"],
  16: ["brisk-walk"],
  17: ["chair-squat"],
  19: ["sunday-afternoon-test"],
};

export function howToSlugsForDay(day: number): HowToSlug[] {
  return HOW_TO_BY_DAY[day] ?? [];
}

// The first day a technique is asked for. Used to open its panel by default
// that day and leave it collapsed afterwards — a beginner meets the full
// instructions, someone on their fourth strength snack is not made to scroll
// past them again.
export function isFirstAppearance(slug: HowToSlug, day: number): boolean {
  for (let d = 1; d < day; d++) {
    if (howToSlugsForDay(d).includes(slug)) return false;
  }
  return howToSlugsForDay(day).includes(slug);
}
