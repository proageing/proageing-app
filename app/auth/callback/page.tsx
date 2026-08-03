"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { completeSessionFromUrlHash } from "@/lib/authCallback";
import { recordSignInConsent } from "@/lib/consent";
import { takeNextPath } from "@/lib/nextPath";
import { runLegacyImport } from "@/lib/runLegacyImport";
import { useT } from "@/lib/i18n/context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    async function complete() {
      const result = await completeSessionFromUrlHash(supabase);
      if (result.error) {
        setError(result.error);
        return;
      }

      // The consent ticked before the link was sent can only be attributed
      // now that there's a user to attach it to. Deliberately awaited, but
      // it never throws — a consent-log failure must not strand someone on
      // this screen.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await recordSignInConsent(user.id);
      }

      // Bring across anything this person saved on proageing.org before
      // the app existed. Idempotent, and it swallows its own failures —
      // sign-in must not hinge on the legacy project being reachable.
      await runLegacyImport();

      router.replace(takeNextPath());
    }

    complete();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {error ? (
        <>
          <p className="text-red-600">{error}</p>
          <a href="/signin" className="mt-4 text-primary underline">
            {t.signIn.backToSignIn}
          </a>
        </>
      ) : (
        <p className="text-ink-soft dark:text-ink-dark-soft">{t.signIn.signingYouIn}</p>
      )}
    </main>
  );
}
