"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import type { AssessmentType } from "@/lib/importHistory";

interface ResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
}

function formatEntryData(type: AssessmentType, entryData: Record<string, unknown>): string {
  if (type === "family-history") {
    const flagged = entryData.elevated_count;
    return typeof flagged === "number" ? `${flagged} area${flagged === 1 ? "" : "s"} flagged` : "—";
  }
  return typeof entryData.score === "number" ? String(entryData.score) : "—";
}

const WELCOME_STEPS = [
  {
    title: "Take your free checks",
    body: "9 quick, guided checks across the 7 ProAgeing Steps — no clinic, no needles.",
  },
  {
    title: "See your Healthy Longevity Profile",
    body: "Your results build into a profile below, always up to date as you retake checks.",
  },
  {
    title: "Build the habit",
    body: "Ready to act on what you find? The 21-Day ProAgeing Challenge turns it into a daily plan.",
  },
];

export default function DashboardPage() {
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
  const isFirstVisit = completedCount === 0;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-28 pt-8">
      <AppHeader onSignOut={handleSignOut} />

      {isFirstVisit ? (
        <>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary-dark">Welcome to ProAge</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
            Let&apos;s find out how you&apos;re really ageing.
          </h1>
          <p className="mt-2 text-ink-soft dark:text-ink-dark-soft">
            Healthy longevity isn&apos;t one number — it&apos;s 7 steps working together. Here&apos;s how this app
            works.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {WELCOME_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink dark:text-ink-dark">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            Your 9 checks
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
            {completedCount} of {ASSESSMENT_TYPES.length} checks completed
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-border/60 dark:bg-border-dark">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(completedCount / ASSESSMENT_TYPES.length) * 100}%` }}
            />
          </div>
        </>
      )}

      <ul className="mt-4 divide-y divide-border dark:divide-border-dark">
        {ASSESSMENT_TYPES.map(({ type, title, href, color }) => {
          const row = latestByType.get(type);
          const style = PILLAR_STYLES[color];
          return (
            <li key={type} className="flex items-center justify-between py-4">
              <span className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                <span className="font-medium text-ink dark:text-ink-dark">{title}</span>
              </span>
              {href ? (
                <Link href={href} className={`text-sm font-semibold underline ${style.eyebrow}`}>
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

      <Link
        href="/program"
        className="mt-8 block rounded-xl bg-primary-light px-4 py-3 text-center font-semibold text-primary-dark transition hover:brightness-95 dark:bg-primary-light-dark"
      >
        Go to your 21-Day ProAgeing Challenge
      </Link>

      <Link href="/import" className="mt-4 inline-block text-sm text-primary-dark underline">
        Import your ProAgeing Steps history from proageing.org
      </Link>

      <TabBar />
    </main>
  );
}
