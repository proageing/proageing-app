// The SHAPE of the 21-Day Challenge, safe to ship to every browser: which day
// introduces which checks, where the profile reveal and the close fall. It
// carries no lesson text. The text lives in lib/program21Content.ts
// (server-only) and reaches a browser one day at a time via
// /api/program/day, after a paid-plan check.
//
// This must stay in step with the content files. `npm run verify:program`
// compares them and fails on any drift, so moving a check to another day in
// the content means updating this table too.

export interface AssessmentLink {
  label: string;
  href: string;
}

// The full text of one day, as served by /api/program/day.
export interface Program21Day {
  day: number;
  pillar: string;
  learn: string;
  assessments?: AssessmentLink[];
  action: string;
  reflect: string;
  reflectExamples?: string[];
  isProfileReveal?: boolean;
  isClose?: boolean;
}

export interface Program21Structure {
  day: number;
  /** Check hrefs the day links to, e.g. "/assess/purpose". Empty when none. */
  assessmentHrefs: string[];
  isProfileReveal?: boolean;
  isClose?: boolean;
}

export const PROGRAM21_STRUCTURE: Program21Structure[] = [
  { day: 1, assessmentHrefs: ["/assess/purpose"] },
  { day: 2, assessmentHrefs: ["/assess/family-history", "/assess/cognitive-decline"] },
  { day: 3, assessmentHrefs: ["/assess/training-zone"] },
  { day: 4, assessmentHrefs: ["/assess/sit-to-stand", "/assess/balance"] },
  { day: 5, assessmentHrefs: ["/assess/nutrition-protein"] },
  { day: 6, assessmentHrefs: ["/assess/sleep-quality"] },
  { day: 7, assessmentHrefs: ["/assess/connection"], isProfileReveal: true },
  { day: 8, assessmentHrefs: [] },
  { day: 9, assessmentHrefs: [] },
  { day: 10, assessmentHrefs: [] },
  { day: 11, assessmentHrefs: [] },
  { day: 12, assessmentHrefs: [] },
  { day: 13, assessmentHrefs: [] },
  { day: 14, assessmentHrefs: [] },
  { day: 15, assessmentHrefs: [] },
  { day: 16, assessmentHrefs: ["/assess/vo2max"] },
  { day: 17, assessmentHrefs: [] },
  { day: 18, assessmentHrefs: [] },
  { day: 19, assessmentHrefs: [] },
  { day: 20, assessmentHrefs: [] },
  { day: 21, assessmentHrefs: ["/assess/sit-to-stand", "/assess/balance", "/assess/nutrition-protein", "/assess/sleep-quality", "/assess/connection"], isClose: true },
];

export function structureForDay(day: number): Program21Structure {
  return PROGRAM21_STRUCTURE.find((d) => d.day === day) ?? PROGRAM21_STRUCTURE[PROGRAM21_STRUCTURE.length - 1];
}
