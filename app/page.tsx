"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      router.replace(user ? "/dashboard" : "/signin");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-3xl font-semibold text-ink dark:text-ink-dark">Add life to your years.</h1>
      <p className="mt-3 max-w-md text-ink-soft dark:text-ink-dark-soft">Loading…</p>
    </main>
  );
}
