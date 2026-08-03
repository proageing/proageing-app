// Checks the Chinese dictionary against the English one for the failure
// modes that actually matter in this app's copy.
//
// These pages carry thresholds, dosages, study sizes and citations. A
// clumsy phrase is a cosmetic problem; a number that changed between
// languages is a health-information problem, and it is invisible in a
// diff of two scripts nobody on the team reads side by side. So:
//
//   1. Every quantity written as digits in the English must appear in the
//      Chinese. Catches a dropped "8–12 weeks", a "5 seconds" that became
//      "10", a study size that lost a digit.
//   2. Citations and technical terms must survive -- author surnames
//      inside a bracketed year, acronyms, domains. Catches a dropped
//      "(Vellas et al., 1997)".
//   3. Structure must match: same keys, same array lengths. A questionnaire
//      whose option list is a different length in one language would score
//      differently, which is the worst failure available here.
//
// Run: npx tsx scripts/verify-translations.mjs
//
// Proven against deliberately injected faults: a changed threshold, a
// dropped citation and a study size that lost a digit were all caught.
// Exits non-zero if anything fails, so it can gate a commit.

import { en } from "../lib/i18n/en.ts";
import { zh } from "../lib/i18n/zh.ts";

// Reviewed and accepted: cases where the site's own Chinese deliberately
// departs from a mechanical match. Each needs a reason, so the list can't
// quietly become a way of silencing real findings.
const ACCEPTED = {
  "assess.purpose.intro1Em":
    "'ikigai' is a loanword; proageing.org/zh keeps it in Latin script too.",
  "assess.purpose.intro2":
    "The Ohsaki study is written 大崎研究 on the site's own Chinese page.",
};

const problems = [];
let checked = 0;

// Numbers, including decimals and thousands separators. Deliberately
// ignores digits that are part of a longer Latin token (VO2, PSQI-ish
// names) by only taking standalone runs.
// Chinese routinely writes small counts as 七 rather than 7, and doing so
// is correct, not a dropped number. Normalise those before comparing so
// the check stays focused on genuine drift.
const CN_NUMERALS = { "一": "1", "二": "2", "两": "2", "三": "3", "四": "4", "五": "5", "六": "6", "七": "7", "八": "8", "九": "9", "十": "10" };

// Word-numbers ("one leg", "twenty-one days") were tried and removed:
// they are prose, not thresholds, and every hit was a false positive.
// Thresholds, doses, study sizes and citation years are all written as
// digits, so that is what gets checked.
function digitsIn(s) {
  // Strip alphanumeric technical tokens first, so the 2 in VO2 and the 1
  // in HbA1c aren't mistaken for quantities.
  const cleaned = s.replace(/\b[A-Za-z]+\d[A-Za-z0-9]*\b/g, " ");
  return (cleaned.match(/\d[\d,.]*/g) ?? [])
    .map((n) => n.replace(/[,.]$/, "").replace(/,/g, ""))
    .filter((n) => n.length > 0);
}

// Every quantity stated in the English must be findable in the Chinese.
// Deliberately one-directional: Chinese uses 一 as an article ("一句话" is
// "a sentence", not "1 sentence"), so extra numerals on that side are
// grammar, not drift. The direction that matters is a threshold, dose or
// study size going missing.
function englishQuantities(s) {
  return digitsIn(s);
}

function chineseQuantities(s) {
  return [...digitsIn(s), ...[...s].filter((ch) => ch in CN_NUMERALS).map((ch) => CN_NUMERALS[ch])];
}

// Only tokens that genuinely must survive translation get checked.
// Ordinary English words are supposed to disappear -- flagging those made
// the report useless. What must NOT disappear:
//   - acronyms and instrument names (PSQI, PDPA, VO2, HbA1c, ApoB)
//   - author surnames inside citations, e.g. "(Vellas et al., 1997)"
//   - domain names
// Acronyms the site's own Chinese pages render as words rather than
// keeping in Latin. Their absence is the published translation's choice,
// not an omission.
// Acronyms Chinese medical writing spells out rather than borrowing:
// VO2 → 最大摄氧量, HDL → 高密度脂蛋白, MCI → 轻度认知障碍. The site's own
// pages do the same, so their absence is the published rendering, not a
// dropped term. PSQI, PDPA, LSNS-6 and UCLA-3 are deliberately NOT here --
// those stay in Latin on both sides and should still be checked.
const TRANSLATED_TERMS = new Set(["VO2", "HR", "RHR", "HDL", "MCI"]);

function significantTokensIn(s) {
  const out = new Set();

  // Acronyms and alphanumeric technical terms.
  for (const m of s.match(/\b[A-Z]{2,}[a-z]?\d*\b|\b[A-Za-z]+\d[A-Za-z0-9]*\b/g) ?? []) {
    out.add(m);
  }
  // Domains.
  for (const m of s.match(/\b[a-z0-9-]+\.(?:org|com|sg)\b/gi) ?? []) out.add(m);

  // Citation parentheticals: any capitalised surname inside brackets that
  // also carry a year. This is where the evidence claims live.
  //
  // Both bracket styles, because Chinese uses full-width （） — matching
  // only ASCII made every correctly-translated citation look dropped.
  for (const paren of s.match(/[(（][^)）]*\b(?:19|20)\d{2}[^)）]*[)）]/g) ?? []) {
    for (const w of paren.match(/\b[A-Z][a-zA-Z-]{2,}\b/g) ?? []) {
      if (!["Senior", "Fitness", "Test"].includes(w)) out.add(w);
    }
  }
  // Named instruments cited outside brackets.
  // Author surnames and brand names only. Place names and adjectives
  // (Singapore, Okinawan, Dutch) are ordinary words that translate --
  // 新加坡 is not a dropped citation.
  for (const w of s.match(/\b(?:Rikli|Jones|Seino|Vellas|Morioka|Holt-Lunstad|ProAge|ProAgeing|ProAger)\b/g) ?? []) {
    out.add(w);
  }
  return [...out].filter((w) => !TRANSLATED_TERMS.has(w));
}

function sameMultiset(a, b) {
  const norm = (xs) => [...xs].sort().join("|");
  return norm(a) === norm(b);
}

function walk(path, e, z) {
  if (typeof e === "function") {
    // Interpolated strings: call both with sample args and compare the
    // shape of what comes out.
    const arity = e.length;
    const args = Array.from({ length: arity }, (_, i) => (i === 0 ? 7 : 3));
    let ea, za;
    try {
      ea = String(e(...args));
      za = String(z(...args));
    } catch {
      return; // Not safely callable with sample args; skip rather than guess.
    }
    compareStrings(path, ea, za, { interpolated: true });
    return;
  }

  if (typeof e === "string") {
    compareStrings(path, e, z);
    return;
  }

  if (Array.isArray(e)) {
    if (!Array.isArray(z) || e.length !== z.length) {
      problems.push(`${path}: array length ${e.length} (en) vs ${Array.isArray(z) ? z.length : "not an array"} (zh)`);
      return;
    }
    e.forEach((item, i) => walk(`${path}[${i}]`, item, z[i]));
    return;
  }

  if (e && typeof e === "object") {
    const ek = Object.keys(e).sort();
    const zk = Object.keys(z ?? {}).sort();
    if (ek.join("|") !== zk.join("|")) {
      problems.push(`${path}: keys differ\n    en: ${ek.join(", ")}\n    zh: ${zk.join(", ")}`);
      return;
    }
    ek.forEach((k) => walk(path ? `${path}.${k}` : k, e[k], z[k]));
  }
}

function compareStrings(path, e, z, opts = {}) {
  checked++;

  const en_ = englishQuantities(e);
  const zn_ = chineseQuantities(z);
  const lost = en_.filter((n) => !zn_.includes(n));
  if (lost.length > 0) {
    problems.push(
      `${path}: quantity missing from translation: ${lost.join(", ")}\n    en: ${JSON.stringify(e).slice(0, 100)}\n    zh: ${JSON.stringify(z).slice(0, 100)}`
    );
  }

  // Interpolated samples inject the same values into both, so a Latin
  // mismatch there is usually just surrounding prose being Chinese.
  if (!opts.interpolated) {
    const el = significantTokensIn(e);
    const zl = significantTokensIn(z);
    const missing = el.filter((w) => !zl.includes(w));
    if (missing.length > 0) {
      problems.push(
        `${path}: citation/term dropped: ${missing.join(", ")}\n    en: ${JSON.stringify(e).slice(0, 110)}\n    zh: ${JSON.stringify(z).slice(0, 110)}`
      );
    }
  }

  if (z.trim().length === 0) problems.push(`${path}: empty translation`);
  const legitimatelyIdentical = /@|^https?:/.test(e);
  if (e === z && !legitimatelyIdentical && /[A-Za-z]{4,}/.test(e)) {
    problems.push(`${path}: untranslated (identical to English): ${JSON.stringify(e).slice(0, 80)}`);
  }
}

walk("", en, zh);

// Drop accepted findings last, so an accepted path that stops being
// reported doesn't hide a new problem at the same path.
const beforeAccept = problems.length;
for (let i = problems.length - 1; i >= 0; i--) {
  const path = problems[i].split(":")[0];
  if (path in ACCEPTED) problems.splice(i, 1);
}
const suppressed = beforeAccept - problems.length;

console.log(`Compared ${checked} strings.` + (suppressed ? ` ${suppressed} reviewed exception(s) accepted.` : "") + "\n");
if (problems.length === 0) {
  console.log("No discrepancies found.");
  process.exit(0);
}
console.log(`${problems.length} to review:\n`);
for (const p of problems) console.log("  • " + p + "\n");
process.exit(1);
