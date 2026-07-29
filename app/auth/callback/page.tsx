"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { completeSessionFromUrlHash } from "@/lib/authCallback";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeSessionFromUrlHash(supabase).then((result) => {
      if (result.error) {
        setError(result.error);
        return;
      }
      router.replace("/dashboard");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {error ? (
        <>
          <p className="text-red-600">{error}</p>
          <a href="/signin" className="mt-4 text-primary underline">
            Back to sign in
          </a>
        </>
      ) : (
        <p className="text-neutral-500">Signing you in…</p>
      )}
    </main>
  );
}
