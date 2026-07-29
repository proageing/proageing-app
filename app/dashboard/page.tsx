"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
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
        <p className="text-neutral-500">Loading…</p>
      </main>
    );
  }

  const completedCount = latestByType.size;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Your longevity dashboard</h1>
        <button onClick={handleSignOut} className="text-sm text-neutral-500 underline">
          Sign out
        </button>
      </div>

      <p className="mt-2 text-sm text-neutral-600">
        {completedCount} of {ASSESSMENT_TYPES.length} checks completed
      </p>
      <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${(completedCount / ASSESSMENT_TYPES.length) * 100}%` }}
        />
      </div>

      <ul className="mt-8 divide-y divide-neutral-200">
        {ASSESSMENT_TYPES.map(({ type, title, href }) => {
          const row = latestByType.get(type);
          return (
            <li key={type} className="flex items-center justify-between py-4">
              <span className="font-medium text-neutral-900">{title}</span>
              {href ? (
                <Link href={href} className="text-primary underline">
                  {row ? `${formatEntryData(type, row.entry_data)} · Retake` : "Start"}
                </Link>
              ) : (
                <span className="text-neutral-600">
                  {row ? formatEntryData(type, row.entry_data) : "Not started"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <Link href="/import" className="mt-8 inline-block text-sm text-primary underline">
        Import your ProAgeing Steps history from proageing.org
      </Link>
    </main>
  );
}
