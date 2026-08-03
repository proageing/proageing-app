import type { AssessmentType } from "@/lib/importHistory";
import type { Dictionary } from "@/lib/i18n/en";

export interface AssessmentIntro {
  eyebrow: string;
  paragraphs: string[];
}

// Same copy as each assessment's own welcome screen — surfaced again on the
// trend page so it also explains what the check measures and why it matters
// for longevity, not just the raw numbers.
//
// Derived from the dictionary rather than kept as a second copy. It used to
// duplicate the English welcome text, which meant translating the checks
// would have left this page quietly showing English while the check itself
// showed Chinese — and any future edit to a welcome screen would have had
// to be made in two places to stay honest.
export function introsFor(t: Dictionary): Record<AssessmentType, AssessmentIntro> {
  const a = t.assess;
  return {
    purpose: {
      eyebrow: a.purpose.eyebrow,
      paragraphs: [`${a.purpose.intro1Pre}${a.purpose.intro1Em}${a.purpose.intro1Post}`, a.purpose.intro2],
    },
    "family-history": {
      eyebrow: a.familyHistory.eyebrow,
      paragraphs: [a.familyHistory.intro1, a.familyHistory.intro2],
    },
    "cognitive-decline": {
      eyebrow: a.cognitiveDecline.eyebrow,
      paragraphs: [a.cognitiveDecline.intro1, a.cognitiveDecline.intro2],
    },
    vo2max: {
      eyebrow: a.vo2max.eyebrow,
      paragraphs: [a.vo2max.intro1, a.vo2max.intro2],
    },
    "sit-to-stand": {
      eyebrow: a.sitToStand.eyebrow,
      paragraphs: [a.sitToStand.intro1, a.sitToStand.intro2],
    },
    balance: {
      eyebrow: a.balance.eyebrow,
      paragraphs: [a.balance.intro1, a.balance.intro2],
    },
    "nutrition-protein": {
      eyebrow: a.nutritionProtein.eyebrow,
      paragraphs: [a.nutritionProtein.intro1, a.nutritionProtein.intro2],
    },
    "sleep-quality": {
      eyebrow: a.sleepQuality.eyebrow,
      paragraphs: [a.sleepQuality.intro1, a.sleepQuality.intro2],
    },
    connection: {
      eyebrow: a.connection.eyebrow,
      paragraphs: [a.connection.intro1, a.connection.intro2],
    },
  };
}
