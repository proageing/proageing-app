"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
      <h1 className="text-2xl font-semibold text-neutral-900">Sign in to ProAgeing</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We&apos;ll email you a sign-in link — no password needed.
      </p>

      {!sent ? (
        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          />
          <button
            onClick={handleSend}
            disabled={busy || !email}
            className="rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send sign-in link"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-700">
          Check your email for a sign-in link — tap it to continue. You can close this tab.
        </p>
      )}

      {status && <p className="mt-4 text-sm text-red-600">{status}</p>}
    </main>
  );
}
