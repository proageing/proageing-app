"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { formatEntryData } from "@/lib/formatResult";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import type { AssessmentType } from "@/lib/importHistory";

interface ResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
}

export default function ReadingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [latestByType, setLatestByType] = useState<Map<AssessmentType, ResultRow>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      const { data, error } = await supabase
        .from("assessment_results")
        .select("assessment_type, entry_data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<ResultRow[]>();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load assessment results", error);
        setLoading(false);
        return;
      }

      // Rows are ordered newest-first, so the first row seen per type is the latest.
      const latest = new Map<AssessmentType, ResultRow>();
      for (const row of data ?? []) {
        if (!latest.has(row.assessment_type)) {
          latest.set(row.assessment_type, row);
        }
      }

      setLatestByType(latest);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  const completedCount = latestByType.size;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-28 pt-8">
      <AppHeader onSignOut={handleSignOut} />

      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm font-semibold text-ink-faint hover:text-ink-soft dark:text-ink-dark-faint dark:hover:text-ink-dark-soft"
      >
        ← Back to dashboard
      </Link>

      <p className="mt-4 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Your Longevity Readings</p>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">Every check you&apos;ve taken, and your latest result for each.</p>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Your 9 checks</p>
      <div className="mt-2 h-2 w-full rounded-full bg-border/60 dark:bg-border-dark">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${(completedCount / ASSESSMENT_TYPES.length) * 100}%` }}
        />
      </div>

      <ul className="mt-4 divide-y divide-border dark:divide-border-dark">
        {ASSESSMENT_TYPES.map(({ type, title, href, color }) => {
          const row = latestByType.get(type);
          const style = PILLAR_STYLES[color];
          return (
            <li key={type} className="flex items-center justify-between py-4">
              <span className="flex items-center gap-3">
                {row ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-junebud" aria-hidden="true">
                    <circle cx="12" cy="12" r="12" fill="currentColor" />
                    <path d="M7.5 12.5l2.8 2.8L16.5 9" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                )}
                <span className="font-medium text-ink dark:text-ink-dark">{title}</span>
              </span>
              {href ? (
                <Link href={`${href}?from=readings`} className={`text-sm font-semibold underline ${style.eyebrow}`}>
                  {row ? `${formatEntryData(type, row.entry_data)} · Retake` : "Start"}
                </Link>
              ) : (
                <span className="text-sm text-ink-soft dark:text-ink-dark-soft">
                  {row ? formatEntryData(type, row.entry_data) : "Not started"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <Link href="/import" className="mt-6 inline-block text-sm text-primary-dark underline">
        Import your ProAgeing Steps history from proageing.org
      </Link>

      <TabBar />
    </main>
  );
}
