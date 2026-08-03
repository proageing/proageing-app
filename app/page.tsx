"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n/context";

export default function Home() {
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      router.replace(user ? "/dashboard" : "/signin");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-3xl font-semibold text-ink dark:text-ink-dark">{t.landing.tagline}</h1>
      <p className="mt-3 max-w-md text-ink-soft dark:text-ink-dark-soft">{t.common.loading}</p>
    </main>
  );
}
