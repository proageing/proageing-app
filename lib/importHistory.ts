import { supabase } from "./supabase";
import { sharedSupabase } from "./sharedSupabase";

// The 9 ProAgeing Steps assessment types (docs/PLAN.md §3).
export type AssessmentType =
  | "purpose"
  | "family-history"
  | "cognitive-decline"
  | "vo2max"
  | "sit-to-stand"
  | "balance"
  | "nutrition-protein"
  | "sleep-quality"
  | "connection";

interface SharedResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
}

// Step 1: send a one-time passcode to the user's email against the shared
// project. Client-side only — no service-role key involved (docs/PLAN.md
// §Open decisions item 6).
export async function sendSharedProjectOtp(email: string): Promise<{ error: string | null }> {
  const { error } = await sharedSupabase.auth.signInWithOtp({ email });
  return { error: error?.message ?? null };
}

// Step 2: verify the emailed code, establishing a session against the
// shared project.
export async function verifySharedProjectOtp(
  email: string,
  token: string
): Promise<{ error: string | null }> {
  const { error } = await sharedSupabase.auth.verifyOtp({ email, token, type: "email" });
  return { error: error?.message ?? null };
}

// Step 3: pull the signed-in user's own rows from the shared project
// (RLS-scoped to their auth.uid() there) and copy any not already imported
// into this app's own assessment_results table, tagged
// source='proageing_site_import'. Idempotent — safe to re-run.
export async function importProageingHistory(
  primaryUserId: string
): Promise<{ imported: number; skipped: number; error: string | null }> {
  const {
    data: { user: sharedUser },
  } = await sharedSupabase.auth.getUser();

  if (!sharedUser) {
    return { imported: 0, skipped: 0, error: "Not signed in to the shared project — run the OTP flow first." };
  }

  const { data: sharedRows, error: fetchError } = await sharedSupabase
    .from("proageing_results")
    .select("assessment_type, entry_data, created_at")
    .returns<SharedResultRow[]>();

  if (fetchError) {
    return { imported: 0, skipped: 0, error: fetchError.message };
  }

  const { data: alreadyImported, error: existingError } = await supabase
    .from("assessment_results")
    .select("assessment_type, created_at")
    .eq("user_id", primaryUserId)
    .eq("source", "proageing_site_import");

  if (existingError) {
    return { imported: 0, skipped: 0, error: existingError.message };
  }

  const alreadyImportedKeys = new Set(
    (alreadyImported ?? []).map((row) => `${row.assessment_type}::${row.created_at}`)
  );

  const rowsToInsert = (sharedRows ?? [])
    .filter((row) => !alreadyImportedKeys.has(`${row.assessment_type}::${row.created_at}`))
    .map((row) => ({
      user_id: primaryUserId,
      assessment_type: row.assessment_type,
      entry_data: row.entry_data,
      created_at: row.created_at,
      source: "proageing_site_import" as const,
    }));

  const skipped = (sharedRows?.length ?? 0) - rowsToInsert.length;

  if (rowsToInsert.length === 0) {
    await sharedSupabase.auth.signOut();
    return { imported: 0, skipped, error: null };
  }

  const { error: insertError } = await supabase.from("assessment_results").insert(rowsToInsert);

  // The shared-project session is only needed for the duration of the
  // import — drop it once we're done with it either way.
  await sharedSupabase.auth.signOut();

  if (insertError) {
    return { imported: 0, skipped, error: insertError.message };
  }

  return { imported: rowsToInsert.length, skipped, error: null };
}
