"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { rememberNextPath } from "@/lib/nextPath";
import { CONSENT_CLAUSES, CONSENT_HEADING, markConsentPending } from "@/lib/consent";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    setBusy(true);
    setStatus(null);

    // Read at submit time rather than through useSearchParams, which would
    // force this page behind a Suspense boundary for no benefit.
    const requested = new URLSearchParams(window.location.search).get("next");
    rememberNextPath(requested);
    markConsentPending();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) {
      setStatus(`Couldn't send the link: ${error.message}`);
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Logo size={48} />
      <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
        Sign in to ProAgeing
      </h1>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
        We&apos;ll email you a sign-in link — no password needed.
      </p>

      {!sent ? (
        <div className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white p-3 text-left dark:border-border-dark dark:bg-white/5">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-primary"
            />
            <span className="text-xs leading-relaxed text-ink-soft dark:text-ink-dark-soft">
              <strong className="text-ink dark:text-ink-dark">{CONSENT_HEADING}</strong>
              <br />
              {CONSENT_CLAUSES.map((clause, i) => (
                <span key={i}>
                  {i + 1}. {clause}
                  {i < CONSENT_CLAUSES.length - 1 && <br />}
                </span>
              ))}
            </span>
          </label>

          <button
            onClick={handleSend}
            disabled={busy || !email || !consented}
            className="rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send sign-in link"}
          </button>
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink-soft dark:border-border-dark dark:bg-white/5 dark:text-ink-dark-soft">
          Check your email for a sign-in link — tap it to continue. You can close this tab.
        </p>
      )}

      {status && <p className="mt-4 text-sm text-red-600">{status}</p>}
    </main>
  );
}
