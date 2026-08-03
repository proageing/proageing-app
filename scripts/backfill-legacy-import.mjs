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

function need(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return value;
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
  console.error(err);
  process.exit(1);
});
