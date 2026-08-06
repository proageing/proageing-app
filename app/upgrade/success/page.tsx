"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { rememberNextPath } from "@/lib/nextPath";
import { markConsentPending } from "@/lib/consent";
import { useT } from "@/lib/i18n/context";

type Phase = "checking" | "signedIn" | "linkSent" | "linkFailed";

export default function UpgradeSuccessPage() {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("checking");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      // Someone who bought while signed in still has their session — there's
      // nothing to do but point them at the dashboard.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setPhase("signedIn");
        return;
      }

      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      if (!sessionId) {
        setPhase("linkFailed");
        return;
      }

      const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.paid || !data.email) {
        setPhase("linkFailed");
        return;
      }
      setEmail(data.email);

      // Send the sign-in link to the address they paid with. Deliberately
      // not gated on the webhook having landed: signInWithOtp creates the
      // account if it doesn't exist yet, and the webhook attaches the
      // purchase whenever it arrives. Routing through the normal callback
      // matters — that's where consent is recorded and where their
      // proageing.org check history gets imported.
      rememberNextPath("/dashboard");
      markConsentPending();
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setPhase(error ? "linkFailed" : "linkSent");
    }
    run().catch(() => setPhase("linkFailed"));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo size={48} />
      <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{t.upgradeSuccess.title}</h1>

      {phase === "checking" && <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">{t.upgradeSuccess.checking}</p>}

      {phase === "signedIn" && (
        <>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">{t.upgradeSuccess.body}</p>
          <Link
            href="/dashboard"
            className="mt-6 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            {t.upgradeSuccess.backToDashboard}
          </Link>
        </>
      )}

      {phase === "linkSent" && (
        <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">{t.upgradeSuccess.linkSent(email ?? "")}</p>
      )}

      {phase === "linkFailed" && (
        <>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">{t.upgradeSuccess.linkFailed}</p>
          <Link
            href="/signin"
            className="mt-6 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            {t.upgradeSuccess.goToSignIn}
          </Link>
        </>
      )}
    </main>
  );
}
