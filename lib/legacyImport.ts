import "server-only";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSiteSupabaseAdmin, hasSiteSupabaseConfig } from "@/lib/siteSupabaseAdmin";
import type { AssessmentType } from "@/lib/importHistory";

export const LEGACY_SOURCE = "proageing_site_import";

export interface LegacyImportResult {
  imported: number;
  skipped: number;
  matched: boolean;
  error: string | null;
}

interface SiteResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
}

// listUsers is the only lookup the admin API offers — there's no
// getUserByEmail — so this pages until it finds a match. Capped so a
// misconfiguration can't turn into an unbounded crawl.
const PAGE_SIZE = 200;
const MAX_PAGES = 50;

// Dedup identity for a result. Deliberately keyed on the parsed instant
// rather than the raw timestamp string: the two projects are separate
// Postgres instances and there is no guarantee they render timestamptz
// identically (proageing.org's table was created by hand in the dashboard
// and its column types aren't in any schema file). A formatting difference
// would make every row look new, and since this runs on every sign-in it
// would quietly duplicate a person's whole history over and over.
function resultKey(assessmentType: string, createdAt: string): string {
  const instant = Date.parse(createdAt);
  return `${assessmentType}::${Number.isNaN(instant) ? createdAt : instant}`;
}

async function findConfirmedSiteUserId(email: string): Promise<string | null> {
  const site = getSiteSupabaseAdmin();
  const wanted = email.trim().toLowerCase();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await site.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw new Error(`site auth.listUsers: ${error.message}`);

    for (const user of data.users) {
      // Both sides must be a confirmed address. An unconfirmed site
      // account can hold any email someone typed, so matching against one
      // would hand that person another user's results.
      if (user.email?.toLowerCase() === wanted && user.email_confirmed_at) {
        return user.id;
      }
    }

    if (data.users.length < PAGE_SIZE) break;
  }
  return null;
}

// Copies a person's proageing.org history into their app account, matched
// on confirmed email — the only key the two projects share, since they have
// entirely separate auth.users.
//
// Idempotent: rows already carrying this source with the same
// (assessment_type, created_at) are left alone, so this is safe to run on
// every sign-in and safe to re-run as a backfill.
export async function importLegacyResultsFor(
  appUserId: string,
  email: string | null | undefined
): Promise<LegacyImportResult> {
  if (!hasSiteSupabaseConfig()) {
    return { imported: 0, skipped: 0, matched: false, error: "Legacy project is not configured" };
  }
  if (!email) {
    return { imported: 0, skipped: 0, matched: false, error: null };
  }

  try {
    const siteUserId = await findConfirmedSiteUserId(email);
    if (!siteUserId) {
      return { imported: 0, skipped: 0, matched: false, error: null };
    }

    const site = getSiteSupabaseAdmin();
    const app = getSupabaseAdmin();

    const { data: siteRows, error: siteError } = await site
      .from("proageing_results")
      .select("assessment_type, entry_data, created_at")
      .eq("user_id", siteUserId)
      .returns<SiteResultRow[]>();

    if (siteError) throw new Error(`proageing_results: ${siteError.message}`);
    if (!siteRows || siteRows.length === 0) {
      return { imported: 0, skipped: 0, matched: true, error: null };
    }

    const { data: existing, error: existingError } = await app
      .from("assessment_results")
      .select("assessment_type, created_at")
      .eq("user_id", appUserId)
      .eq("source", LEGACY_SOURCE);

    if (existingError) throw new Error(`assessment_results: ${existingError.message}`);

    const seen = new Set((existing ?? []).map((r) => resultKey(r.assessment_type, r.created_at)));

    const toInsert = siteRows
      .filter((row) => !seen.has(resultKey(row.assessment_type, row.created_at)))
      .map((row) => ({
        user_id: appUserId,
        assessment_type: row.assessment_type,
        entry_data: row.entry_data,
        // created_at is preserved, not stamped with now(), so imported
        // history keeps its real dates and trends stay truthful.
        created_at: row.created_at,
        source: LEGACY_SOURCE,
      }));

    const skipped = siteRows.length - toInsert.length;
    if (toInsert.length === 0) {
      return { imported: 0, skipped, matched: true, error: null };
    }

    const { error: insertError } = await app.from("assessment_results").insert(toInsert);
    if (insertError) throw new Error(`insert: ${insertError.message}`);

    return { imported: toInsert.length, skipped, matched: true, error: null };
  } catch (err) {
    return { imported: 0, skipped: 0, matched: false, error: (err as Error).message };
  }
}
