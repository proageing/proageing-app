// Where the protein figures in proteinCalculator.ts actually come from.
//
// The problem this file exists to solve: PROTEIN_FOODS holds grams of protein
// **per serving**, because that is the only unit someone standing at a hawker
// stall can use. Every food composition database in the world, HPB's and
// AFCD's included, publishes grams **per 100 g of food**. Neither can be
// converted into the other without a third number -- what the serving weighs
// -- and that number was recorded nowhere at all until this file.
//
// So a row here has two halves with very different standing:
//
//   * `record` points at a transcribed value in one of the files in
//     SOURCE_DATA_FILES, chosen by `dataset`. That half is evidence. It is not
//     ours and must not be adjusted.
//   * `servingG` is ours. Neither source supplies it in the fields we
//     transcribe, so every entry has to declare how much weight its serving
//     figure can bear -- see `servingSource`. An assumed serving weight is
//     still a real assumption even when the density it multiplies is
//     lab-analysed, and pretending otherwise would make this file worse than
//     no file.
//
// Only foods that appear here are checked by scripts/verify-protein-table.mjs.
// The rest of PROTEIN_FOODS is unverified, and the script says so out loud on
// every run rather than reporting a cheerful pass over a handful of rows.
// Adding an entry is how a row stops being unsourced; the way to add one is in
// data/README.md.
//
// Two sources so far, and they are not interchangeable:
//
//   hpb  -- Singapore Food Insights Database. The right authority for
//           anything Singaporean: hawker dishes, local preparations. Four
//           records, transcribed by hand from a browser -- the domain is
//           blocked from this sandbox.
//   afcd -- Australia's AFCD Release 3 (FSANZ), supplied as a bulk download.
//           A real national table with documented derivation, but the WRONG
//           authority for a Singapore hawker dish -- it has no yong tau foo,
//           no lei cha, no thosai. It is the RIGHT authority for foods that
//           are not particularly Singaporean: chicken breast, wholemeal
//           bread, a peanut, a glass of milk. Used only for those, and only
//           where the AFCD record is genuinely the same food, not merely a
//           keyword match -- see the rejected candidates in
//           data/afcd-food-composition.csv for the cases where it was not
//           (soft tofu, Greek yoghurt, dhal).
//
// One authority per row is the property worth protecting. Mixing sources
// *within* a row -- averaging an HPB figure with an AFCD one, say -- would be
// worse than picking either alone, because it manufactures a number nobody
// actually measured.

import type { ProteinFoodKey } from "./proteinCalculator";

/** Relative to the repository root, keyed by the `dataset` a source uses. */
export const SOURCE_DATA_FILES = {
  hpb: "data/hpb-food-insights.csv",
  afcd: "data/afcd-food-composition.csv",
} as const;

export type Dataset = keyof typeof SOURCE_DATA_FILES;

/**
 * How much confidence the serving weight carries. Deliberately not a boolean:
 * "a large egg weighs about 56 g" and "a plate of chicken rice weighs about
 * 350 g" are both unsourced here, but they are not remotely the same claim,
 * and flattening them would hide exactly the distinction that matters when
 * deciding which row to go and check next.
 */
export type ServingSource =
  /** Given by the source data itself. Nothing here yet -- neither source's
   *  fields include a serving size. */
  | "measured"
  /** A standard, widely published figure for the item, even though it is not
   *  in either CSV. Checkable by anyone with a kitchen scale, or in this
   *  file's case, a well-established convention like "1 oz of nuts" or
   *  "1 glass = 250 mL". */
  | "conventional"
  /** Our estimate. The weakest link in any row that has one. */
  | "assumed";

export interface ProteinSource {
  /** Which file in SOURCE_DATA_FILES to look `record` up in. */
  dataset: Dataset;
  /** Must match `record` in that CSV exactly, including capitalisation. */
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
    dataset: "hpb",
    record: "Chicken egg, whole, raw",
    servingG: 56,
    servingSource: "conventional",
    basis:
      "A large hen's egg without shell is about 50-58 g; 56 g sits inside that. " +
      "12.56 g/100 g x 0.56 = 7.03, which rounds to the 7 g the app has always " +
      "shown -- the first figure in the food table confirmed against anything. " +
      "Independently confirmed 2026-08-17 by AFCD's own analysed egg record, " +
      "12.6 g/100 g -- agrees with HPB's borrowed figure to within 0.04 g, the " +
      "strongest cross-check any row here has. Still points at the HPB record: " +
      "it was the one already verified and shipped, and switching the pointer " +
      "for no reason would just be churn.",
  },

  // The pair that forced the split. HPB measures these as two dishes and they
  // differ by 38%, which no single row could carry.
  chickenRiceSteamed: {
    dataset: "hpb",
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
    dataset: "hpb",
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

  // Everyday, not-particularly-Singaporean foods, checked against AFCD. Each
  // is chosen because it is the same food, not because the name matched --
  // see the CSV for what was searched and rejected along the way.
  chickenPalm: {
    dataset: "afcd",
    record: "Chicken, breast, lean flesh, grilled, no added fat",
    servingG: 100,
    servingSource: "conventional",
    basis:
      "100 g cooked, the standard 'palm-sized' cooked-meat convention (roughly " +
      "3.5 oz -- inside the usual dietitian guidance of a palm's size and " +
      "thickness). 29.8 g/100 g x 100 g = 29.8, rounds to the 30 g the app " +
      "already showed -- an exact match, not an adjustment.",
  },
  fishPalm: {
    dataset: "afcd",
    record: "Barramundi, aquacultured, fillet, steamed with no added fat",
    servingG: 100,
    servingSource: "conventional",
    basis:
      "Barramundi is the species Singapore calls sea bass (Lates calcarifer) -- " +
      "a genuine species match, not an Australian stand-in for a different " +
      "fish. Same 100 g cooked convention as chickenPalm above. 22.9 g/100 g x " +
      "100 g = 22.9, rounds to 23 -- one gram above the app's previous 22 g, " +
      "which is why PROTEIN_FOODS changed. See the commit for the correction.",
  },
  wholemealBread: {
    dataset: "afcd",
    record: "Bread, from wholemeal flour",
    servingG: 75,
    servingSource: "conventional",
    basis:
      "2 slices at ~37-38 g each, inside the commonly labelled 70-80 g range " +
      "for 2 slices of wholemeal bread. 10.4 g/100 g x 75 g = 7.8, rounds to " +
      "the 8 g the app already showed.",
  },
  peanuts: {
    dataset: "afcd",
    record: "Nut, peanut, with skin, raw, unsalted",
    servingG: 28,
    servingSource: "conventional",
    basis:
      "28 g is the standard international 'one serving of nuts' unit (1 oz, " +
      "28.35 g) -- not chosen to fit, it is the convention. 24.7 g/100 g x " +
      "28 g = 6.92, rounds to the 7 g the app already showed.",
  },
  milk: {
    dataset: "afcd",
    record: "Milk, cow, fluid, regular fat (~3.5%)",
    servingG: 250,
    servingSource: "conventional",
    basis:
      "250 mL is the standard 'glass of milk' convention. 3.3 g/100 g x 250 g " +
      "= 8.25, rounds to the 8 g the app already showed. Worth reading " +
      "alongside soyaMilk below, which the same convention does NOT confirm.",
  },
  tauKwa: {
    dataset: "afcd",
    record: "Tofu (soy bean curd), firm, as purchased",
    servingG: 90,
    servingSource: "assumed",
    basis:
      "Weakest of the AFCD mappings -- flagged 'assumed' rather than " +
      "'conventional' because the density match itself carries real " +
      "uncertainty, not just the weight. AFCD carries exactly one tofu entry " +
      "and does not identify it as Singapore-style pressed beancurd, so this " +
      "is the closest available proxy, not a confirmed match. 90 g is a " +
      "commonly cited weight for one commercial tau kwa piece. " +
      "12.8 g/100 g x 90 g = 11.52, rounds to the 12 g the app already showed.",
  },

  // Looked up in AFCD and deliberately NOT mapped, because the closest-named
  // record is a different food, not because nothing was found. Recording the
  // near-miss and why it was rejected is worth as much as recording a match --
  // see data/afcd-food-composition.csv for each one's notes.
  //
  //   softTofu     -- AFCD's only tofu entry is FIRM. Soft/silken tofu is a
  //                   genuinely different product with less protein per 100 g;
  //                   using the firm figure would overstate it.
  //   greekYoghurt -- AFCD's yoghurt entries are natural or flavoured, not
  //                   Greek-style. Greek yoghurt is strained and runs
  //                   noticeably higher in protein; the natural-yoghurt figure
  //                   would understate it.
  //   dhal         -- AFCD's lentil entries are dry or plainly boiled and
  //                   drained. A bowl of dhal curry is diluted with liquid and
  //                   oil; applying the drained-lentil density would overstate
  //                   the figure.
  //   soyaMilk     -- This is a real finding, not a missing lookup. AFCD's
  //                   unfortified soy beverage is 3.7 g/100 g, DENSER than
  //                   the milk record above (3.3). At the same 250 mL glass
  //                   convention that confirms milk's 8 g, soya milk would
  //                   compute to 9 g -- yet the app's soyaMilk (7 g) is LOWER
  //                   than milk (8 g), the opposite ordering. Either the
  //                   glass sizes are meant to differ, or 7 g deserves a
  //                   second look. Not silently "fixed" here -- see
  //                   docs/PROAGE_NORMS.md §11.
  //
  // Nine rows remain untouched by this pass and are still hawker dishes AFCD
  // has no equivalent for: fishSoup, yongTauFoo, fishBeeHoon, economyRice,
  // leiCha, thosaiDhal, wantonMee. Those need a Singapore-specific source,
  // which remains unreachable from this sandbox.
};
