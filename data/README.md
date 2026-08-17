# `data/` — vendored source data

Files here are **transcribed evidence**, not code and not our interpretation of
it. They exist so the numbers the app shows can be re-checked mechanically by
`scripts/verify-protein-table.mjs` instead of being taken on trust from a
sentence in a document.

## Why the data is vendored rather than fetched

Nothing food-related is reachable from the Claude Code sandbox. Checked
2026-08-17, all four fail to connect: `hpb.gov.sg`, `fdc.nal.usda.gov`,
`api.nal.usda.gov` (USDA FoodData Central) and `world.openfoodfacts.org`.
`focos.hpb.gov.sg` does not resolve. So a live lookup is not an option, and a
verifier that depended on one would be permanently red here.

Once a file is committed, verification needs no network at all — which is also
what makes it work in CI and on any machine, not just one with a browser open
on the right page.

## `hpb-food-insights.csv`

Records from HPB's **Singapore Food Insights Database** (formerly FOCOS
*Energy & Nutrient Composition of Food*), transcribed by hand from the
database's own record pages.

Values are **per 100 g of food**, which is the single most important thing to
remember about this file: `lib/assessments/proteinCalculator.ts` holds grams
**per serving**. Converting between the two needs a serving weight, and HPB
does not supply one in the fields transcribed here. Those weights are ours, and
they live in `lib/assessments/proteinSources.ts` where each one has to state
whether it is known or assumed.

Columns:

| Column | Meaning |
|---|---|
| `record` | The dish name **exactly** as HPB writes it. `proteinSources.ts` matches on this string, so do not tidy it up. |
| `kcal_per_100g` | Energy per 100 g. Not used by the verifier; kept because a transcription error usually shows up in both numbers, so it is a cheap cross-check. |
| `protein_g_per_100g` | The value the verifier uses. |
| `source_flag` | **HPB's own provenance flag**, not our assessment. `Lab Analysis` means HPB analysed it locally; `Borrowed` means HPB took it from another country's table. Transcribe it as given — a borrowed value is weaker evidence and the verifier prints the flag so that stays visible. |
| `last_updated` | HPB's own year. A 2010 record next to a 2025 one is worth knowing about. |
| `retrieved` | When *we* transcribed it, which is a different fact from HPB's own vintage. |
| `notes` | Free text. Used most importantly to say why a record is kept but deliberately **not** mapped to any of our foods. |

### Adding records

Anyone with a browser can extend this: look the food up, add one row,
`npx tsx scripts/verify-protein-table.mjs`. If the food maps onto one of our
rows, add the mapping in `proteinSources.ts` too and the verifier will start
checking it. Adding a record with no mapping is fine and sometimes the correct
outcome — see the `Tau kwa pau` row, which is kept precisely because it does
*not* match our plain tau kwa.

Do not edit a transcribed value to make the verifier pass. If HPB and our table
disagree, our table is the thing that is wrong.
