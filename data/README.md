# `data/` — vendored source data

Files here are **transcribed or bulk-downloaded evidence**, not code and not
our interpretation of it. They exist so the numbers the app shows can be
re-checked mechanically by `npm run verify:protein` instead of being taken on
trust from a sentence in a document.

## Why the data is vendored rather than fetched

Nothing food-related is reachable from the Claude Code sandbox. Checked
2026-08-17: `hpb.gov.sg`, `www.hpb.gov.sg`, `sfa.gov.sg`, `data.gov.sg`,
`fdc.nal.usda.gov`, `api.nal.usda.gov` (USDA FoodData Central) and
`world.openfoodfacts.org` all fail to connect — `EGRESS_BLOCKED`, an
organisation policy denial, not a dead link. `focos.hpb.gov.sg` does not even
resolve. Also checked and worth recording: Singapore's Health Sciences
Authority (HSA) is not an alternative — food composition duties moved from HSA
to the Singapore Food Agency (SFA) in 2019, so HSA would not have helped even
if it were reachable.

So a live lookup is not an option, and a verifier that depended on one would
be permanently red here. Once a file is committed, verification needs no
network at all — which is also what makes it work in CI and on any machine,
not just one with a browser open on the right page.

## Two datasets, and why both

`proteinSources.ts` picks a dataset per row via a `dataset` field. They are
**not interchangeable**, and mixing them within a single row (averaging an HPB
figure with an AFCD one, say) would be worse than picking either alone — it
would manufacture a number nobody actually measured. One authority per row.

| Dataset | What it is | Right for | Wrong for |
|---|---|---|---|
| `hpb` — `hpb-food-insights.csv` | Singapore's Food Insights Database, transcribed by hand from record pages in a browser | Anything Singaporean — hawker dishes, local preparations | Nothing it covers is wrong; the problem is coverage, not accuracy — only 4 records exist so far |
| `afcd` — `afcd-food-composition.csv` | Australia's AFCD Release 3 (FSANZ), supplied as a bulk download | Foods that are not particularly Singaporean — a plain chicken breast, wholemeal bread, milk, a peanut | Any Singapore hawker dish. AFCD has no yong tau foo, no lei cha, no thosai. Do not reach for it there. |

### `hpb-food-insights.csv`

Values are **per 100 g of food**, which is the single most important thing to
remember about every file here: `lib/assessments/proteinCalculator.ts` holds
grams **per serving**. Converting between the two needs a serving weight, and
neither source supplies one in the fields transcribed. Those weights are ours,
and they live in `proteinSources.ts` where each one has to state whether it is
known or assumed.

| Column | Meaning |
|---|---|
| `record` | The dish name **exactly** as HPB writes it. `proteinSources.ts` matches on this string, so do not tidy it up. |
| `kcal_per_100g` | Energy per 100 g. Not used by the verifier; kept because a transcription error usually shows up in both numbers, so it is a cheap cross-check. |
| `protein_g_per_100g` | The value the verifier uses. |
| `source_flag` | **HPB's own provenance flag**, not our assessment. `Lab Analysis` means HPB analysed it locally; `Borrowed` means HPB took it from another country's table. Transcribe it as given — a borrowed value is weaker evidence and the verifier prints the flag so that stays visible. |
| `last_updated` | HPB's own year. A 2010 record next to a 2025 one is worth knowing about. |
| `retrieved` | When *we* transcribed it, which is a different fact from HPB's own vintage. |
| `notes` | Free text. Used most importantly to say why a record is kept but deliberately **not** mapped to any of our foods. |

### `afcd-food-composition.csv`

A small, hand-picked slice of AFCD Release 3 (the full release runs to
~1,600 food entries across several workbooks) — only the rows that were
actually searched for a match, kept **whether or not they were used**. A
rejected candidate — softTofu, Greek yoghurt, dhal — is recorded with a note
explaining why it was rejected, the same convention as `Tau kwa pau` in the
HPB file: knowing what was checked and rejected is worth as much as knowing
what matched.

| Column | Meaning |
|---|---|
| `record` | The food name **exactly** as AFCD writes it. |
| `public_food_key` | AFCD's own row identifier (e.g. `F002593`), so a specific record can be found again in the source workbook without re-searching. |
| `kcal_or_kj` | Not populated (`n/a`) — AFCD's energy units differ by sheet and weren't needed for this pass. Add if a future check wants the cross-check `hpb-food-insights.csv`'s kcal column provides. |
| `protein_g_per_100g` | The value the verifier uses. |
| `derivation` | AFCD's own method flag — `Analysed` (measured directly) or `Recipe` (calculated from a recipe's ingredients and a cooking-loss factor, not measured on the finished dish). Transcribe as given, same discipline as HPB's `source_flag`. |
| `retrieved` | When *we* pulled this row from the workbook. |
| `notes` | Same purpose as the HPB file's notes column. |

## Adding records

Anyone with a browser can extend `hpb-food-insights.csv`: look the food up,
add one row, `npm run verify:protein`. `afcd-food-composition.csv` can be
extended the same way from the bulk-downloaded workbook — search it, add the
row, whether it ends up mapped or rejected.

If a food maps onto one of our rows, add the mapping in `proteinSources.ts`
too and the verifier will start checking it. Adding a record with **no**
mapping is fine and sometimes the correct outcome.

**A record existing is not the same as it being the right match.** Before
mapping, check it is the same food, not merely a keyword hit — AFCD's only
tofu entry is `firm`, which is the wrong texture for `softTofu`; its lentil
entries are dry or boiled-and-drained, a different preparation from a bowl of
dhal curry. Using either would have manufactured agreement rather than found
it. When in doubt, leave it unmapped and note why — that is not a smaller
contribution than a match.

Do not edit a transcribed value, or a serving weight, to make the verifier
pass. If a source and our table disagree, our table is what is wrong — see
`soyaMilk` in `proteinSources.ts` for a disagreement recorded rather than
quietly resolved.
