import { supabase } from "@/lib/supabase";

export interface LegacyImportOutcome {
  imported: number;
  skipped: number;
  matched: boolean;
  configured: boolean;
  error: string | null;
}

const EMPTY: LegacyImportOutcome = { imported: 0, skipped: 0, matched: false, configured: false, error: null };

// Marks that this user has already been through the import on this device.
//
// The server has no cheap way to answer "does this email exist over
// there?" — the admin API offers no lookup by address, so a match means
// paging the legacy user list. That is fine once and wasteful on every
// sign-in thereafter, particularly for the majority who never had a
// website account and so never match. Keyed by user id so a shared device
// doesn't skip the import for the next person.
const RAN_KEY_PREFIX = "proage-legacy-import-ran:";

function alreadyRan(userId: string): boolean {
  try {
    return window.localStorage.getItem(RAN_KEY_PREFIX + userId) === "1";
  } catch {
    return false;
  }
}

function markRan(userId: string) {
  try {
    window.localStorage.setItem(RAN_KEY_PREFIX + userId, "1");
  } catch {
    // Storage unavailable — the import simply runs again next time.
  }
}

// Asks the server to copy this user's proageing.org history across. The
// import itself is idempotent, so re-running is safe; this just avoids
// paying for it repeatedly.
//
// Never throws. On the sign-in path this is a background nicety; a person
// must get into the app whether or not their old results came with them.
export async function runLegacyImport(options?: { force?: boolean }): Promise<LegacyImportOutcome> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return EMPTY;

    const userId = session.user.id;
    if (!options?.force && alreadyRan(userId)) return EMPTY;

    const res = await fetch("/api/import-legacy", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = await res.json();

    if (!res.ok) {
      // Not marked as run — a failure should be retried on the next
      // sign-in rather than silently written off.
      return { ...EMPTY, error: body.error ?? "Import failed" };
    }

    markRan(userId);
    return {
      imported: body.imported ?? 0,
      skipped: body.skipped ?? 0,
      matched: Boolean(body.matched),
      configured: Boolean(body.configured),
      error: null,
    };
  } catch (err) {
    console.error("Legacy import failed", err);
    return { ...EMPTY, error: (err as Error).message };
  }
}
