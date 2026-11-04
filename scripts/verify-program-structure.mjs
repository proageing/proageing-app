// Fails if lib/program21Structure.ts (shipped to every browser) has drifted
// from the real programme content (server-only, EN and ZH). Run with
// `npm run verify:program`. Needs no dependencies: it reads the content
// files as text, strips the server-only guard, and imports them with Node's
// built-in TypeScript stripping.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const lib = join(dirname(fileURLToPath(import.meta.url)), "..", "lib");
const tmp = mkdtempSync(join(tmpdir(), "program-verify-"));
try {
  for (const f of ["program21Content", "program21ContentZh", "program21Structure"]) {
    let src = readFileSync(join(lib, `${f}.ts`), "utf8");
    src = src.replace(/^import "server-only";\n/m, "");
    src = src.replace(/from "\.\/(program21\w+)"/g, 'from "./$1.ts"');
    writeFileSync(join(tmp, `${f}.ts`), src);
  }
  const load = (f) => import(pathToFileURL(join(tmp, `${f}.ts`)).href);
  const { PROGRAM21_DAYS } = await load("program21Content");
  const { PROGRAM21_DAYS_ZH } = await load("program21ContentZh");
  const { PROGRAM21_STRUCTURE } = await load("program21Structure");

  const shape = (d) => ({
    day: d.day,
    hrefs: (d.assessments ?? d.assessmentHrefs ?? []).map((a) => (typeof a === "string" ? a : a.href)),
    reveal: Boolean(d.isProfileReveal),
    close: Boolean(d.isClose),
  });
  const want = PROGRAM21_STRUCTURE.map(shape);
  let bad = 0;
  for (const [name, days] of [["English", PROGRAM21_DAYS], ["Chinese", PROGRAM21_DAYS_ZH]]) {
    if (days.length !== want.length) {
      console.error(`FAIL ${name}: ${days.length} days, structure has ${want.length}`);
      bad++;
      continue;
    }
    days.map(shape).forEach((d, i) => {
      if (JSON.stringify(d) !== JSON.stringify(want[i])) {
        console.error(`FAIL ${name} day ${d.day}: content ${JSON.stringify(d)} != structure ${JSON.stringify(want[i])}`);
        bad++;
      }
    });
  }
  if (bad) process.exit(1);
  console.log(`OK: structure matches English and Chinese content (${want.length} days).`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
