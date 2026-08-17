// Re-derives the protein food table from vendored source data and fails if the
// committed figures no longer follow from it.
//
// The gap this closes: docs/PROAGE_NORMS.md used to *assert* that egg = 7 g had
// been checked against HPB. A sentence in a document is not a check -- it goes
// stale silently the moment someone edits a number, and nothing anywhere
// notices. This script turns the assertion into arithmetic that runs:
//
//   committed grams  ==  round(protein per 100 g  x  serving weight / 100)
//
// with the left side from lib/assessments/proteinCalculator.ts, the density
// from data/hpb-food-insights.csv, and the serving weight from
// lib/assessments/proteinSources.ts. Change any one of the three and this
// fails.
//
// Run: npm run verify:protein
//
// No dev dependency: it runs on Node's own --experimental-strip-types (Node 22+),
// so it works offline and in CI. `npx tsx` also works but pulls a download.
//
// It imports the real modules rather than parsing them, so it cannot drift from
// what the app actually ships, and a renamed key is a *type* error rather than
// a silently skipped row.
//
// Two deliberate design choices, because both were tempting to get wrong:
//
//   1. Unmapped foods are NOT failures. Seventeen of twenty rows have no source
//      yet; failing on them would leave the script permanently red, and a
//      permanently red check is one nobody runs. They are reported as an
//      explicit count instead, so a pass can never be mistaken for "the table
//      is sourced".
//   2. A pass prints HPB's own provenance flag for every verified row. `egg`
//      rests on a value HPB itself marks "Borrowed" -- taken from another
//      country's table, not analysed locally. That is still the best evidence
//      we have for it, but a green tick should not make it look stronger than
//      it is.
//
// Exits non-zero on any failure, so it can gate a commit.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROTEIN_FOODS } from "../lib/assessments/proteinCalculator.ts";
import { PROTEIN_SOURCES, SOURCE_DATA_FILE } from "../lib/assessments/proteinSources.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Minimal RFC4180-ish reader: enough for double-quoted fields containing commas
// and doubled quotes, which is all the notes column needs. Not a general CSV
// parser, and it should stay unambitious -- a clever one here would be a second
// thing that can be wrong.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter(r => r.some(f => f !== ""));
  return body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const failures = [];
const verified = [];

const csvPath = path.join(ROOT, SOURCE_DATA_FILE);
if (!fs.existsSync(csvPath)) {
  console.error(`Source data missing: ${SOURCE_DATA_FILE}`);
  process.exit(1);
}
const records = parseCsv(fs.readFileSync(csvPath, "utf8"));
const byRecord = new Map(records.map(r => [r.record, r]));
if (byRecord.size !== records.length) {
  failures.push(`${SOURCE_DATA_FILE}: duplicate record names -- a mapping would silently pick one.`);
}

const foodByKey = new Map(PROTEIN_FOODS.map(f => [f.key, f]));

for (const [key, src] of Object.entries(PROTEIN_SOURCES)) {
  // Belt and braces: ProteinFoodKey already makes this a type error, but the
  // script has to survive being run against a tree where tsc was not.
  const food = foodByKey.get(key);
  if (!food) {
    failures.push(`${key}: mapped in proteinSources.ts but absent from PROTEIN_FOODS.`);
    continue;
  }
  const rec = byRecord.get(src.record);
  if (!rec) {
    failures.push(`${key}: no record named "${src.record}" in ${SOURCE_DATA_FILE}.`);
    continue;
  }
  const density = Number(rec.protein_g_per_100g);
  if (!Number.isFinite(density) || density <= 0) {
    failures.push(`${key}: "${src.record}" has an unusable protein_g_per_100g (${rec.protein_g_per_100g}).`);
    continue;
  }
  const exact = (density * src.servingG) / 100;
  const expected = Math.round(exact);
  if (expected !== food.grams) {
    failures.push(
      `${key}: table says ${food.grams} g, source data gives ${expected} g ` +
      `(${density} g/100 g x ${src.servingG} g = ${exact.toFixed(2)}). ` +
      `Fix the table, or the serving weight -- never the transcribed value.`,
    );
    continue;
  }
  verified.push({ key, food, src, rec, exact });
}

const unmapped = PROTEIN_FOODS.filter(f => !(f.key in PROTEIN_SOURCES));
const unusedRecords = records.filter(r => !Object.values(PROTEIN_SOURCES).some(s => s.record === r.record));

const pad = (s, n) => String(s).padEnd(n);
console.log(`Protein table: ${PROTEIN_FOODS.length} foods, ${records.length} source records, ${Object.keys(PROTEIN_SOURCES).length} mapped.\n`);

if (verified.length) {
  console.log("Verified against source data:");
  for (const v of verified) {
    const flag = v.rec.source_flag === "Lab Analysis" ? "lab-analysed" : v.rec.source_flag.toLowerCase();
    console.log(
      `  ok   ${pad(v.key, 20)} ${pad(v.food.grams + " g", 6)} = ` +
      `${pad(v.rec.protein_g_per_100g + " g/100 g", 13)} x ${pad(v.src.servingG + " g", 6)} ` +
      `[${flag}, ${v.rec.last_updated}; serving ${v.src.servingSource}]`,
    );
  }
  const assumed = verified.filter(v => v.src.servingSource === "assumed");
  if (assumed.length) {
    console.log(
      `\n  Note: ${assumed.length} of these rest on an assumed serving weight ` +
      `(${assumed.map(v => v.key).join(", ")}).\n  The density is sourced; the weight is ours. Not the same as measured.`,
    );
  }
}

console.log(`\nUnverified: ${unmapped.length} of ${PROTEIN_FOODS.length} foods have no source mapping.`);
if (unmapped.length) {
  const biggest = [...unmapped].sort((a, b) => b.grams - a.grams).slice(0, 4);
  console.log(`  ${unmapped.map(f => f.key).join(", ")}`);
  console.log(`  Worth checking first (largest values, so they move a tally most): ${biggest.map(f => `${f.key} ${f.grams} g`).join(", ")}.`);
}
if (unusedRecords.length) {
  console.log(`\nSource records held but not mapped to any food: ${unusedRecords.length}`);
  for (const r of unusedRecords) console.log(`  ${r.record}${r.notes ? ` -- ${r.notes}` : ""}`);
}

if (failures.length === 0) {
  console.log(`\nverify-protein-table: OK (${verified.length} verified, ${unmapped.length} still unsourced).`);
  process.exit(0);
}
console.log(`\n${failures.length} failure(s):\n`);
for (const f of failures) console.log("  • " + f + "\n");
process.exit(1);
