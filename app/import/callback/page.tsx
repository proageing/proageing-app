"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { sharedSupabase } from "@/lib/sharedSupabase";
import { completeSessionFromUrlHash } from "@/lib/authCallback";
import { importProageingHistory } from "@/lib/importHistory";

type State = "working" | "needs-primary-signin" | "done" | "error";

export default function ImportCallbackPage() {
  const [state, setState] = useState<State>("working");
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage(
        `Imported ${result.imported} result${result.imported === 1 ? "" : "s"}, skipped ${result.skipped} already imported.`
      );
    }

    run();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      {state === "working" && <p className="text-neutral-500">Importing your history…</p>}

      {state === "needs-primary-signin" && (
        <>
          <p className="text-neutral-700">
            Sign in to your ProAgeing account first, then use the import link from your
            dashboard again.
          </p>
          <Link href="/signin" className="mt-4 text-primary underline">
            Sign in
          </Link>
        </>
      )}

      {state === "done" && (
        <>
          <p className="text-neutral-700">{message}</p>
          <Link href="/dashboard" className="mt-4 text-primary underline">
            Back to dashboard
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-red-600">{message}</p>
          <Link href="/import" className="mt-4 text-primary underline">
            Try again
          </Link>
        </>
      )}
    </main>
  );
}
