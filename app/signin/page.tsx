"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Step = "email" | "otp";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSendOtp() {
    setBusy(true);
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    if (error) {
      setStatus(`Couldn't send code: ${error.message}`);
      return;
    }
    setStep("otp");
  }

  async function handleVerify() {
    setBusy(true);
    setStatus(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setBusy(false);
    if (error) {
      setStatus(`Couldn't verify code: ${error.message}`);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Sign in to ProAgeing</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We'll email you a one-time code — no password needed.
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
          <p className="text-sm text-neutral-600">Enter the code we just emailed to {email}.</p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          />
          <button
            onClick={handleVerify}
            disabled={busy || !token}
            className="rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify & sign in"}
          </button>
        </div>
      )}

      {status && <p className="mt-4 text-sm text-neutral-700">{status}</p>}
    </main>
  );
}
