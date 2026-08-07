// Daily protein target, and a tally to check a day against it.
//
// Deliberately not the 0.8 g/kg general-adult RDA: the PROT-AGE study group
// (Bauer et al., JAMDA 2013) and ESPEN (Deutz et al., Clinical Nutrition
// 2014) both put healthy older adults at 1.0–1.2 g/kg/day, rising to at
// least 1.2 with regular resistance exercise. Using the RDA here would
// undercut the programme's own advice.
//
// A range rather than one number, because body weight alone does not justify
// the precision a single figure would imply.

export const PROTEIN_PER_KG = {
  base: { low: 1.0, high: 1.2 },
  active: { low: 1.2, high: 1.5 },
} as const;

export interface ProteinTarget {
  low: number;
  high: number;
  perMeal: number;
}

export function computeProteinTarget(weightKg: number, doesStrengthWork: boolean): ProteinTarget {
  const band = doesStrengthWork ? PROTEIN_PER_KG.active : PROTEIN_PER_KG.base;
  const low = Math.round(weightKg * band.low);
  const high = Math.round(weightKg * band.high);
  // Three meals is the split the programme already teaches, and lands near
  // the 25–30g per sitting that the muscle-synthesis research points to.
  return { low, high, perMeal: Math.round(low / 3) };
}

// Foods someone here actually eats, with protein rounded to whole grams.
// The grams live in code so both languages cannot drift apart; only the
// labels are translated. Figures are typical servings, not precise ones —
// hawker portions vary between stalls, which the disclaimer says plainly.
export interface ProteinFood {
  key: string;
  grams: number;
  group: "everyday" | "hawker";
}

export const PROTEIN_FOODS: ProteinFood[] = [
  { key: "egg", grams: 7, group: "everyday" },
  { key: "tauKwa", grams: 12, group: "everyday" },
  { key: "softTofu", grams: 8, group: "everyday" },
  { key: "greekYoghurt", grams: 15, group: "everyday" },
  { key: "milk", grams: 8, group: "everyday" },
  { key: "soyaMilk", grams: 7, group: "everyday" },
  { key: "peanuts", grams: 7, group: "everyday" },
  { key: "wholemealBread", grams: 8, group: "everyday" },
  { key: "fishPalm", grams: 22, group: "everyday" },
  { key: "chickenPalm", grams: 30, group: "everyday" },
  { key: "dhal", grams: 9, group: "everyday" },
  { key: "fishSoup", grams: 25, group: "hawker" },
  { key: "chickenRice", grams: 30, group: "hawker" },
  { key: "yongTauFoo", grams: 28, group: "hawker" },
  { key: "fishBeeHoon", grams: 28, group: "hawker" },
  { key: "economyRice", grams: 30, group: "hawker" },
  { key: "leiCha", grams: 20, group: "hawker" },
  { key: "thosaiDhal", grams: 20, group: "hawker" },
  { key: "wantonMee", grams: 22, group: "hawker" },
];

export type TallyCounts = Record<string, number>;

export function tallyTotal(counts: TallyCounts): number {
  return PROTEIN_FOODS.reduce((sum, f) => sum + (counts[f.key] ?? 0) * f.grams, 0);
}

// --- persistence -----------------------------------------------------------
// localStorage rather than the database: the target is a prescription, not a
// measurement of the person, so it does not belong in the Longevity Profile
// alongside nine health readings. The trade-off is that it does not follow
// someone to another device.

const SETTINGS_KEY = "proage-protein-target";
const TALLY_KEY = "proage-protein-tally";

export interface ProteinSettings {
  weightKg: number;
  doesStrengthWork: boolean;
}

export function loadSettings(): ProteinSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProteinSettings;
    if (typeof parsed.weightKg !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSettings(settings: ProteinSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* private browsing, quota — the calculator still works, it just forgets */
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// The tally is about today, so a stored one from a previous date is dropped
// rather than shown — waking up to yesterday's total still counted would be
// worse than starting at zero.
export function loadTally(): TallyCounts {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TALLY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { date: string; counts: TallyCounts };
    return parsed.date === today() ? (parsed.counts ?? {}) : {};
  } catch {
    return {};
  }
}

export function saveTally(counts: TallyCounts): void {
  try {
    window.localStorage.setItem(TALLY_KEY, JSON.stringify({ date: today(), counts }));
  } catch {
    /* as above */
  }
}
