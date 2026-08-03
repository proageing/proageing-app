import { supabase } from "@/lib/supabase";

export interface LegacyImportOutcome {
  imported: number;
  skipped: number;
  matched: boolean;
  configured: boolean;
  error: string | null;
}

const EMPTY: LegacyImportOutcome = { imported: 0, skipped: 0, matched: false, configured: false, error: null };

// Asks the server to copy this user's proageing.org history across. Runs
// on every sign-in — the import is idempotent, so a repeat costs one query
// and imports nothing.
//
// Never throws. On the sign-in path this is a background nicety; a person
// must get into the app whether or not their old results came with them.
export async function runLegacyImport(): Promise<LegacyImportOutcome> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return EMPTY;

    const res = await fetch("/api/import-legacy", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = await res.json();

    if (!res.ok) {
      return { ...EMPTY, error: body.error ?? "Import failed" };
    }
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
