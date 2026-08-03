"use client";

import { useState } from "react";
import { sendSharedProjectMagicLink } from "@/lib/importHistory";
import { useT } from "@/lib/i18n/context";

export default function ImportHistoryPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const t = useT();

  async function handleSend() {
    setBusy(true);
    setStatus(null);
    const redirectTo = `${window.location.origin}/import/callback`;
    const { error } = await sendSharedProjectMagicLink(email, redirectTo);
    setBusy(false);
    if (error) {
      setStatus(t.importHistory.failed(String(error)));
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
        {t.importHistory.title}
      </h1>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
        {t.importHistory.blurb}
      </p>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
        {t.importHistory.privacy}
      </p>

      {!sent ? (
        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder={t.signIn.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
          />
          <button
            onClick={handleSend}
            disabled={busy || !email}
            className="rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? t.importHistory.sending : t.importHistory.send}
          </button>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink-soft dark:border-border-dark dark:bg-white/5 dark:text-ink-dark-soft">
          {t.importHistory.sent}
        </p>
      )}

      {status && <p className="mt-4 text-sm text-red-600">{status}</p>}
    </main>
  );
}
