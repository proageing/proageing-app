import { supabase } from "@/lib/supabase";

// Bump this whenever the wording below changes. consent_records is an
// append-only log (schema.sql §consent_records), so a new version means a
// new row rather than an edit — the record of what someone agreed to, and
// when, has to stay accurate after the copy moves on.
export const CONSENT_VERSION = "2026-08-pdpa-v1";
export const CONSENT_SCOPE = "assessment_data";

// Same two clauses proageing.org shows before it saves a result. Kept
// verbatim so a person who consented on the website and a person who
// consented in the app have agreed to the same thing.
export const CONSENT_HEADING = "Consent of data usage & PDPA";
export const CONSENT_CLAUSES = [
  "Purpose of Collection — I consent to ProAge collecting, using, and storing my personal data and assessment results for the purposes of conducting the assessment, providing post-session advice, and for internal quality assurance.",
  "Compliance of PDPA — I acknowledge that ProAge will protect my data in accordance with the Personal Data Protection Act (PDPA). I understand that my data will not be sold or disclosed to unauthorised third parties.",
];

// Consent is given before the account exists — there is no user_id to
// attach it to until the magic link comes back. This carries the fact of
// it across that gap.
const PENDING_KEY = "proage-consent-pending";

export function markConsentPending() {
  try {
    window.localStorage.setItem(PENDING_KEY, CONSENT_VERSION);
  } catch {
    // Private browsing or storage disabled — the consent row is skipped
    // rather than the sign-in being blocked.
  }
}

function readPendingConsent(): string | null {
  try {
    return window.localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

function clearPendingConsent() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // Nothing to do — a stale flag only ever causes a duplicate-check that
    // finds an existing row and does nothing.
  }
}

// Writes the consent row once the user actually exists. Idempotent: a
// second sign-in on the same consent version finds the existing row and
// leaves the log alone. Never throws — a failure here must not be able to
// block someone from getting into the app.
export async function recordPendingConsent(userId: string): Promise<void> {
  const pending = readPendingConsent();
  if (!pending) return;

  try {
    const { data: existing } = await supabase
      .from("consent_records")
      .select("id")
      .eq("user_id", userId)
      .eq("consent_version", pending)
      .eq("scope", CONSENT_SCOPE)
      .maybeSingle();

    if (!existing) {
      await supabase.from("consent_records").insert({
        user_id: userId,
        consent_version: pending,
        scope: CONSENT_SCOPE,
      });
    }
    clearPendingConsent();
  } catch (err) {
    console.error("Failed to record consent", err);
  }
}
