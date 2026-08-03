"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { formatEntryData } from "@/lib/formatResult";
import { readingsTierFor } from "@/lib/assessments/readingsTier";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { ReadingsStatusIcon } from "@/components/ReadingsStatusIcon";
import { WatermarkSwirl } from "@/components/BrandSwirl";
import { useT } from "@/lib/i18n/context";
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
  const t = useT();

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">{t.common.loading}</p>
      </main>
    );
  }

  const completedCount = latestByType.size;

  return (
    <main className="relative mx-auto max-w-2xl overflow-x-hidden px-6 pb-28 pt-8">
      <WatermarkSwirl className="pointer-events-none absolute -right-24 -top-20 w-[420px] text-primary opacity-[0.06]" />

      <div className="relative">
        <AppHeader />

        <p className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{t.readings.title}</p>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{t.readings.blurb}</p>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{t.readings.yourChecks}</p>
      <div className="mt-2 h-2 w-full rounded-full bg-border/60 dark:bg-border-dark">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${(completedCount / ASSESSMENT_TYPES.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint dark:text-ink-dark-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-junebud" aria-hidden="true" /> {t.readings.legend.typical}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" /> {t.readings.legend.worthALook}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" /> {t.readings.legend.seeDoctor}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {ASSESSMENT_TYPES.map(({ type }) => {
          const row = latestByType.get(type);
          const tier = row ? readingsTierFor(type, row.entry_data) : null;
          return (
            <Link
              key={type}
              href={`/dashboard/readings/${type}`}
              className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition ${
                row
                  ? "border-border bg-white hover:border-primary dark:border-border-dark dark:bg-white/5"
                  : "border-primary/25 bg-primary-light hover:border-primary dark:border-primary/20 dark:bg-primary-light-dark"
              }`}
              style={{ minHeight: "104px" }}
            >
              <div className="flex items-center gap-2">
                {row ? (
                  <ReadingsStatusIcon tier={tier} />
                ) : (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                )}
                <span className="text-xs font-bold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">{t.checks[type]}</span>
              </div>
              <div className={`mt-2 text-lg font-bold ${row ? "text-ink dark:text-ink-dark" : "text-primary-dark"}`}>
                {row ? formatEntryData(type, row.entry_data) : t.readings.notStarted}
              </div>
            </Link>
          );
        })}
      </div>

        <Link href="/import" className="mt-6 inline-block text-sm text-primary-dark underline">
          {t.readings.missingHistory}
        </Link>
      </div>

      <TabBar />
    </main>
  );
}
