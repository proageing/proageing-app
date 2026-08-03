"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { formatEntryData } from "@/lib/formatResult";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { WatermarkSwirl } from "@/components/BrandSwirl";
import type { AssessmentType } from "@/lib/importHistory";

interface ResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function TrendsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyByType, setHistoryByType] = useState<Map<AssessmentType, ResultRow[]>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(signInHrefFor(window.location.pathname + window.location.search));
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
        console.error("Failed to load assessment history", error);
        setLoading(false);
        return;
      }

      const byType = new Map<AssessmentType, ResultRow[]>();
      for (const row of data ?? []) {
        const existing = byType.get(row.assessment_type) ?? [];
        existing.push(row);
        byType.set(row.assessment_type, existing);
      }

      setHistoryByType(byType);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-2xl overflow-x-hidden px-6 pb-28 pt-8">
      <WatermarkSwirl className="pointer-events-none absolute -right-24 -top-20 w-[420px] text-primary opacity-[0.06]" />

      <div className="relative">
        <AppHeader />

        <h1 className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Your Trends</h1>
        <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
          Every check you've ever taken, so you can see how you're changing over time — not just your latest result.
        </p>

      <div className="mt-6 flex flex-col gap-4">
        {ASSESSMENT_TYPES.map(({ type, title, href, color }) => {
          const history = historyByType.get(type) ?? [];
          const style = PILLAR_STYLES[color];
          return (
            <div
              key={type}
              className="rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  {history.length > 0 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-junebud" aria-hidden="true">
                      <circle cx="12" cy="12" r="12" fill="currentColor" />
                      <path d="M7.5 12.5l2.8 2.8L16.5 9" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                  )}
                  <span className="font-semibold text-ink dark:text-ink-dark">{title}</span>
                </span>
                {href && (
                  <Link href={href} className={`text-sm font-semibold underline ${style.eyebrow}`}>
                    {history.length > 0 ? "Retake" : "Start"}
                  </Link>
                )}
              </div>

              {history.length === 0 ? (
                <p className="mt-2 text-sm text-ink-faint dark:text-ink-dark-faint">No checks yet.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 dark:border-border-dark">
                  {history.map((row, i) => (
                    <li
                      key={row.created_at}
                      className="flex items-center justify-between text-sm text-ink-soft dark:text-ink-dark-soft"
                    >
                      <span>{formatDate(row.created_at)}</span>
                      <span className="font-medium text-ink dark:text-ink-dark">
                        {formatEntryData(type, row.entry_data)}
                        {i === 0 && history.length > 1 && (
                          <span className="ml-2 text-xs font-normal text-ink-faint dark:text-ink-dark-faint">latest</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      </div>

      <TabBar />
    </main>
  );
}
