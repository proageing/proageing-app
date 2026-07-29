"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    setBusy(true);
    setStatus(null);
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
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
          <button
            onClick={handleSend}
            disabled={busy || !email}
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
