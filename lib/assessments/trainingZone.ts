// Zone 2 from age alone, matching proageing.org/training-zone.html exactly.
//
// Max heart rate uses Tanaka, Monahan & Seals (2001) — 208 − 0.7 × age —
// rather than the older 220 − age, which systematically underestimates max
// HR in older adults and so would put Zone 2 too low for the people this is
// aimed at. Same formula the VO2 max check already uses for its own max-HR
// figure, so the two checks can't disagree about the same person.
//
// Zone 2 is 64–76% of max HR: the moderate band in the ACSM's classification,
// and the range the Talk Test lands on.
export interface TrainingZone {
  hrMax: number;
  zoneLow: number;
  zoneHigh: number;
}

export function computeTrainingZone(age: number): TrainingZone {
  const hrMax = Math.round(208 - 0.7 * age);
  return {
    hrMax,
    zoneLow: Math.round(hrMax * 0.64),
    zoneHigh: Math.round(hrMax * 0.76),
  };
}
