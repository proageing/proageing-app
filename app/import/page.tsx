"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { sendSharedProjectOtp, verifySharedProjectOtp, importProageingHistory } from "@/lib/importHistory";

type Step = "email" | "otp" | "done";

export default function ImportHistoryPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSendOtp() {
    setBusy(true);
    setStatus(null);
    const { error } = await sendSharedProjectOtp(email);
    setBusy(false);
    if (error) {
      setStatus(`Couldn't send code: ${error}`);
      return;
    }
    setStep("otp");
  }

  async function handleVerifyAndImport() {
    setBusy(true);
    setStatus(null);

    const { error: verifyError } = await verifySharedProjectOtp(email, token);
    if (verifyError) {
      setBusy(false);
      setStatus(`Couldn't verify code: ${verifyError}`);
      return;
    }

    const {
      data: { user: primaryUser },
    } = await supabase.auth.getUser();

    if (!primaryUser) {
      setBusy(false);
      setStatus("Sign in to your ProAgeing account first, then try importing again.");
      return;
    }

    const result = await importProageingHistory(primaryUser.id);
    setBusy(false);

    if (result.error) {
      setStatus(`Import failed: ${result.error}`);
      return;
    }

    setStatus(`Imported ${result.imported} result${result.imported === 1 ? "" : "s"}, skipped ${result.skipped} already imported.`);
    setStep("done");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Import your ProAgeing Steps history
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Pull your existing assessment results from proageing.org into your ProAgeing account.
        We only ever read your own data, using a one-time code sent to your email — nothing
        is shared with anyone else.
      </p>

      {step === "email" && (
        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          />
          <button
            onClick={handleSendOtp}
            disabled={busy || !email}
            className="rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send code"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-sm text-neutral-600">
            Enter the code we just emailed to {email}.
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          />
          <button
            onClick={handleVerifyAndImport}
            disabled={busy || !token}
            className="rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {busy ? "Importing…" : "Verify & import"}
          </button>
        </div>
      )}

      {status && <p className="mt-4 text-sm text-neutral-700">{status}</p>}
    </main>
  );
}
