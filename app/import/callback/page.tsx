"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { sharedSupabase } from "@/lib/sharedSupabase";
import { completeSessionFromUrlHash } from "@/lib/authCallback";
import { importProageingHistory } from "@/lib/importHistory";
import { useT } from "@/lib/i18n/context";

type State = "working" | "needs-primary-signin" | "done" | "error";

export default function ImportCallbackPage() {
  const [state, setState] = useState<State>("working");
  const [message, setMessage] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    async function run() {
      const sessionResult = await completeSessionFromUrlHash(sharedSupabase);
      if (sessionResult.error) {
        setState("error");
        setMessage(sessionResult.error);
        return;
      }

      const {
        data: { user: primaryUser },
      } = await supabase.auth.getUser();

      if (!primaryUser) {
        setState("needs-primary-signin");
        return;
      }

      const result = await importProageingHistory(primaryUser.id);
      if (result.error) {
        setState("error");
        setMessage(result.error);
        return;
      }

      setState("done");
      setMessage(t.importHistory.done(result.imported, result.skipped));
    }

    run();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      {state === "working" && <p className="text-ink-soft dark:text-ink-dark-soft">{t.importHistory.working}</p>}

      {state === "needs-primary-signin" && (
        <>
          <p className="text-ink-soft dark:text-ink-dark-soft">
            {t.importHistory.needsPrimary}
          </p>
          <Link href="/signin" className="mt-4 text-primary underline">
            {t.signIn.title}
          </Link>
        </>
      )}

      {state === "done" && (
        <>
          <p className="text-ink-soft dark:text-ink-dark-soft">{message}</p>
          <Link href="/dashboard" className="mt-4 text-primary underline">
            {t.importHistory.backToDashboard}
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-red-600">{message}</p>
          <Link href="/import" className="mt-4 text-primary underline">
            {t.importHistory.tryAgain}
          </Link>
        </>
      )}
    </main>
  );
}
