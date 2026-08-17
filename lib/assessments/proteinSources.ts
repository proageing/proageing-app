// Where the protein figures in proteinCalculator.ts actually come from.
//
// The problem this file exists to solve: PROTEIN_FOODS holds grams of protein
// **per serving**, because that is the only unit someone standing at a hawker
// stall can use. Every food composition database in the world, HPB's included,
// publishes grams **per 100 g of food**. Neither can be converted into the
// other without a third number -- what the serving weighs -- and that number
// was recorded nowhere at all until this file.
//
// So a row here has two halves with very different standing:
//
//   * `record` points at a transcribed value in data/hpb-food-insights.csv.
//     That half is evidence. It is not ours and must not be adjusted.
//   * `servingG` is ours. HPB does not supply it in the fields we transcribe,
//     so every entry has to declare how much weight its serving figure can
//     bear -- see `servingSource`. An assumed serving weight is still a real
//     assumption even when the density it multiplies is lab-analysed, and
//     pretending otherwise would make this file worse than no file.
//
// Only foods that appear here are checked by scripts/verify-protein-table.mjs.
// The rest of PROTEIN_FOODS is unverified, and the script says so out loud on
// every run rather than reporting a cheerful pass over three rows out of
// twenty. Adding an entry is how a row stops being unsourced; the way to add
// one is in data/README.md.

import type { ProteinFoodKey } from "./proteinCalculator";

/** Relative to the repository root. */
export const SOURCE_DATA_FILE = "data/hpb-food-insights.csv";

/**
 * How much confidence the serving weight carries. Deliberately not a boolean:
 * "a large egg weighs about 56 g" and "a plate of chicken rice weighs about
 * 350 g" are both unsourced here, but they are not remotely the same claim,
 * and flattening them would hide exactly the distinction that matters when
 * deciding which row to go and check next.
 */
export type ServingSource =
  /** Given by the source data itself. Nothing here yet -- the fields we
   *  transcribe from HPB do not include a serving size. */
  | "measured"
  /** A standard, widely published figure for the item, even though it is not
   *  in our CSV. Checkable by anyone with a kitchen scale. */
  | "conventional"
  /** Our estimate. The weakest link in any row that has one. */
  | "assumed";

export interface ProteinSource {
  /** Must match `record` in the CSV exactly, including capitalisation. */
  record: string;
  /** Grams of food in the serving our PROTEIN_FOODS figure describes. */
  servingG: number;
  servingSource: ServingSource;
  /** Why this weight. Required -- an unexplained serving weight is the thing
   *  this whole file was written to stop happening again. */
  basis: string;
}

export const PROTEIN_SOURCES: Partial<Record<ProteinFoodKey, ProteinSource>> = {
  egg: {
    record: "Chicken egg, whole, raw",
    servingG: 56,
    servingSource: "conventional",
    basis:
      "A large hen's egg without shell is about 50-58 g; 56 g sits inside that. " +
      "12.56 g/100 g x 0.56 = 7.03, which rounds to the 7 g the app has always " +
      "shown -- the first figure in the food table confirmed against anything.",
  },

  // The pair that forced the split. HPB measures these as two dishes and they
  // differ by 38%, which no single row could carry.
  chickenRiceSteamed: {
    record: "Steamed chicken rice",
    servingG: 350,
    servingSource: "assumed",
    basis:
      "350 g plate, edible portion. Assumed, not sourced: roughly 200 g cooked " +
      "rice, ~85 g edible chicken, cucumber. The same plate weight is applied to " +
      "the roasted row, which is the questionable part -- see the caveat in " +
      "docs/PROAGE_NORMS.md §11.3a about roasting driving off water.",
  },
  chickenRiceRoasted: {
    record: "Roasted chicken rice",
    servingG: 350,
    servingSource: "assumed",
    basis:
      "Same 350 g plate as the steamed row, so the two stay comparable. Note " +
      "this makes the 8 g gap between them a function of our assumption as much " +
      "as of HPB's densities: if a roasted plate is genuinely lighter, the real " +
      "gap is smaller. HPB's own per-serving figures, if the database carries " +
      "them, should replace this arithmetic outright.",
  },

  // Seventeen rows have no entry. That is the honest state of the table, not an
  // oversight in this file, and the verifier prints the list on every run.
  // Worth knowing which ones are hardest: `fishPalm`, `chickenPalm`, `peanuts`
  // ("small handful") and `greekYoghurt` ("small tub") are vague by design --
  // the labels avoid weighing scales on purpose -- so those need a serving
  // weight decided before any density can be applied to them. `tauKwa` is a
  // different case: HPB's "Tau kwa pau" is in the CSV and does NOT fit it,
  // because a stuffed beancurd parcel is not a plain piece of tau kwa.
};
