"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { Logo } from "@/components/Logo";
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <Logo size={36} />
        <button onClick={handleSignOut} className="text-sm text-ink-faint underline dark:text-ink-dark-faint">
          Sign out
        </button>
      </div>

      <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
        Your longevity dashboard
      </h1>

      <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
        {completedCount} of {ASSESSMENT_TYPES.length} checks completed
      </p>
      <div className="mt-2 h-2 w-full rounded-full bg-border/60 dark:bg-border-dark">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${(completedCount / ASSESSMENT_TYPES.length) * 100}%` }}
        />
      </div>

      <ul className="mt-8 divide-y divide-border dark:divide-border-dark">
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
    </main>
  );
}
