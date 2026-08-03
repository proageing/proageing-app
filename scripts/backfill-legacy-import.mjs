// One-time backfill: brings proageing.org history across for app users who
// already signed up before the automatic import existed.
//
// New sign-ins are handled on the fly by app/api/import-legacy, so this is
// only for the existing pool. It is idempotent — running it twice imports
// nothing the second time — so it's safe to re-run after a partial failure.
//
// Reads from the legacy project, writes only to the app project. Run it
// from a terminal with all four values in the environment; it deliberately
// isn't reachable over HTTP, since nothing in the deployed app should be
// able to trigger a bulk cross-project copy.
//
//   NEXT_PUBLIC_SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   SITE_SUPABASE_URL=... \
//   SITE_SUPABASE_SERVICE_ROLE_KEY=... \
//   node scripts/backfill-legacy-import.mjs [--dry-run]
//
// --dry-run reports exactly what it would copy and writes nothing.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

// Read .env.local the way the Next app does, so the two values that
// already live there don't have to be retyped on the command line. Only
// fills variables that aren't already set, so anything passed explicitly
// still wins. .env.local is gitignored, so nothing here reaches the repo.
function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, "");
    if (value && !process.env[m[1]]) process.env[m[1]] = value;
  }
  return true;
}

const usedEnvFile = loadEnvLocal();

const DRY_RUN = process.argv.includes("--dry-run");
const LEGACY_SOURCE = "proageing_site_import";
const PAGE_SIZE = 200;

// Keyed on the parsed instant, not the raw string — the two projects are
// separate Postgres instances with no guarantee they render timestamptz
// the same way, and a formatting difference would make every row look new.
// Must stay in step with resultKey() in lib/legacyImport.ts.
function resultKey(userId, assessmentType, createdAt) {
  const instant = Date.parse(createdAt);
  return `${userId}::${assessmentType}::${Number.isNaN(instant) ? createdAt : instant}`;
}

// Reports every missing variable at once. Naming them one at a time meant
// re-running four times to discover four requirements -- tedious anywhere,
// and this is a script you run on a machine with two service-role keys
// loaded, so it should ask for everything up front.
const REQUIRED = [
  ["NEXT_PUBLIC_SUPABASE_URL", "app project URL"],
  ["SUPABASE_SERVICE_ROLE_KEY", "app project service_role key"],
  ["SITE_SUPABASE_URL", "legacy proageing.org project URL"],
  ["SITE_SUPABASE_SERVICE_ROLE_KEY", "legacy project service_role key (read-only use)"],
];

const missing = REQUIRED.filter(([name]) => !process.env[name]);
if (missing.length > 0) {
  if (usedEnvFile) console.error("Read .env.local. Still missing:\n");
  else console.error(`Missing ${missing.length} required value${missing.length === 1 ? "" : "s"}:\n`);
  for (const [name, what] of missing) console.error(`  ${name}  — ${what}`);
  console.error(
    "\nPass them on the command line, for example:\n" +
      `\n  ${missing.map(([n]) => `${n}='...'`).join(" \\\n  ")} \\\n  node scripts/backfill-legacy-import.mjs --dry-run\n` +
      "\nThe two SITE_ values are the same ones proageing-admin uses for its" +
      "\n/site-users view, so they can be copied from that deployment's" +
      "\nenvironment rather than created fresh."
  );
  process.exit(1);
}

if (usedEnvFile) console.log("Read .env.local for values not passed on the command line.");

function need(name) {
  return process.env[name];
}

const app = createClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});
const site = createClient(need("SITE_SUPABASE_URL"), need("SITE_SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAllUsers(client, label) {
  const all = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw new Error(`${label} listUsers: ${error.message}`);
    all.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
  }
  return all;
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN — nothing will be written\n" : "Backfilling…\n");

  const [appUsers, siteUsers] = await Promise.all([
    listAllUsers(app, "app"),
    listAllUsers(site, "site"),
  ]);

  // Confirmed addresses only. An unconfirmed site account can hold any
  // email someone typed in, so matching one would hand that person another
  // user's results.
  const siteIdByEmail = new Map();
  for (const u of siteUsers) {
    if (u.email && u.email_confirmed_at) siteIdByEmail.set(u.email.toLowerCase(), u.id);
  }

  const { data: siteRows, error: siteError } = await site
    .from("proageing_results")
    .select("user_id, assessment_type, entry_data, created_at");
  if (siteError) throw new Error(`proageing_results: ${siteError.message}`);

  const rowsBySiteUser = new Map();
  for (const row of siteRows ?? []) {
    const list = rowsBySiteUser.get(row.user_id) ?? [];
    list.push(row);
    rowsBySiteUser.set(row.user_id, list);
  }

  const { data: existingRows, error: existingError } = await app
    .from("assessment_results")
    .select("user_id, assessment_type, created_at")
    .eq("source", LEGACY_SOURCE);
  if (existingError) throw new Error(`assessment_results: ${existingError.message}`);

  const seen = new Set((existingRows ?? []).map((r) => resultKey(r.user_id, r.assessment_type, r.created_at)));

  let matchedUsers = 0;
  let totalImported = 0;
  let totalSkipped = 0;
  let failures = 0;

  for (const appUser of appUsers) {
    if (!appUser.email) continue;
    const siteUserId = siteIdByEmail.get(appUser.email.toLowerCase());
    if (!siteUserId) continue;

    const rows = rowsBySiteUser.get(siteUserId) ?? [];
    if (rows.length === 0) continue;
    matchedUsers++;

    const toInsert = rows
      .filter((r) => !seen.has(resultKey(appUser.id, r.assessment_type, r.created_at)))
      .map((r) => ({
        user_id: appUser.id,
        assessment_type: r.assessment_type,
        entry_data: r.entry_data,
        created_at: r.created_at,
        source: LEGACY_SOURCE,
      }));

    totalSkipped += rows.length - toInsert.length;
    if (toInsert.length === 0) continue;

    console.log(`${appUser.email}: ${toInsert.length} to import (${rows.length - toInsert.length} already there)`);

    if (!DRY_RUN) {
      const { error } = await app.from("assessment_results").insert(toInsert);
      if (error) {
        console.error(`  FAILED: ${error.message}`);
        failures++;
        continue;
      }
    }
    totalImported += toInsert.length;
  }

  console.log(`\nApp users:        ${appUsers.length}`);
  console.log(`Site users:       ${siteUsers.length}`);
  console.log(`Matched by email: ${matchedUsers}`);
  console.log(`Results ${DRY_RUN ? "to import" : "imported"}: ${totalImported}`);
  console.log(`Already present:  ${totalSkipped}`);
  if (failures) console.log(`Failed users:     ${failures}`);
}

main().catch((err) => {
  const msg = String(err?.message ?? err);
  if (/fetch failed|ENOTFOUND|ECONNREFUSED/i.test(msg)) {
    console.error(
      `\nCould not reach one of the projects: ${msg}` +
        "\nCheck the two URLs, and that this machine can reach *.supabase.co." +
        "\nNothing was written."
    );
  } else if (/JWT|Invalid API key|401|403/i.test(msg)) {
    console.error(`\nRejected by Supabase: ${msg}\nCheck the service_role keys. Nothing was written.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
