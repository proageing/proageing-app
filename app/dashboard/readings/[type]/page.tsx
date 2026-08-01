"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { PILLAR_HEX } from "@/lib/pillarHex";
import { TREND_METRICS } from "@/lib/assessments/trendConfig";
import { ASSESSMENT_INTROS } from "@/lib/assessments/intro";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { TrendChart } from "@/components/TrendChart";
import type { AssessmentType } from "@/lib/importHistory";

interface ResultRow {
  entry_data: Record<string, unknown>;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function DeltaBadge({ delta, good, flat, pillClass }: { delta: number; good: boolean; flat: boolean; pillClass: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold ${
        flat ? "bg-border/60 text-ink-soft dark:bg-border-dark dark:text-ink-dark-soft" : good ? pillClass : "bg-red-100 text-red-700"
      }`}
    >
      {flat ? "– steady" : `${delta > 0 ? "▲ +" : "▼ "}${delta}`} since first check
    </span>
  );
}

export default function AssessmentTrendPage() {
  const router = useRouter();
  const params = useParams<{ type: string }>();
  const typeParam = params.type as AssessmentType;
  const meta = ASSESSMENT_TYPES.find((a) => a.type === typeParam);
  const metrics = TREND_METRICS[typeParam] ?? [];

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ResultRow[]>([]);

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
        .select("entry_data, created_at")
        .eq("user_id", user.id)
        .eq("assessment_type", typeParam)
        .order("created_at", { ascending: true })
        .returns<ResultRow[]>();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load assessment history", error);
        setLoading(false);
        return;
      }

      setRows(data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, typeParam]);

  if (!meta) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-28 pt-8">
        <AppHeader />
        <p className="mt-6 text-ink-soft dark:text-ink-dark-soft">Unknown assessment.</p>
        <Link href="/dashboard/readings" className="mt-2 inline-block text-sm text-primary-dark underline">
          ← Back to readings
        </Link>
        <TabBar />
      </main>
    );
  }

  const style = PILLAR_STYLES[meta.color];
  const intro = ASSESSMENT_INTROS[typeParam];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-28 pt-8">
      <AppHeader />

      <Link
        href="/dashboard/readings"
        className="mt-6 inline-block text-sm font-semibold text-ink-faint hover:text-ink-soft dark:text-ink-dark-faint dark:hover:text-ink-dark-soft"
      >
        ← Back to readings
      </Link>

      <p className={`mt-4 text-[0.74rem] font-bold uppercase tracking-[0.13em] ${style.eyebrow}`}>Your progress</p>
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{meta.title} Trend</h1>

      {intro && (
        <div className="mt-3 flex flex-col gap-2">
          {intro.paragraphs.map((p) => (
            <p key={p} className="text-sm text-ink-soft dark:text-ink-dark-soft">
              {p}
            </p>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-white p-4 text-sm text-ink-soft shadow-sm dark:border-border-dark dark:bg-white/5 dark:text-ink-dark-soft">
          No results saved yet. Take this check to start building your trend here.
        </div>
      ) : (
        <>
          {metrics.map((metric, mi) => {
            const points = rows
              .map((r) => ({ date: formatDate(r.created_at), value: r.entry_data[metric.key] }))
              .filter((p): p is { date: string; value: number } => typeof p.value === "number");
            if (points.length === 0) return null;

            const latest = points[points.length - 1];
            const first = points[0];
            const delta = Math.round((latest.value - first.value) * 10) / 10;
            const flat = delta === 0;
            const good = metric.higherIsBetter ? delta > 0 : delta < 0;
            const hex = PILLAR_HEX[metric.pillarColor];
            const metricStyle = PILLAR_STYLES[metric.pillarColor];

            return (
              <div key={metric.key} className={mi === 0 ? "mt-6" : "mt-4"}>
                {mi === 0 ? (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`text-4xl font-bold ${style.eyebrow}`}>{latest.value}</div>
                      <div className="mt-1 text-sm font-medium text-ink-soft dark:text-ink-dark-soft">
                        {metric.label} {metric.unit ? `· ${metric.unit}` : ""} · latest {latest.date}
                      </div>
                    </div>
                    {points.length > 1 && <DeltaBadge delta={delta} good={good} flat={flat} pillClass={style.pill} />}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
                    {metric.label}:
                    <strong className="text-ink dark:text-ink-dark">
                      {latest.value}
                      {metric.unit ? ` ${metric.unit}` : ""}
                    </strong>
                    {points.length > 1 && <DeltaBadge delta={delta} good={good} flat={flat} pillClass={metricStyle.pill} />}
                  </div>
                )}

                {points.length > 1 && (
                  <div className="mt-3 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
                    <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">
                      {metric.label} over time ({metric.higherIsBetter ? "higher is better" : "lower is better"})
                    </h3>
                    <div className="mt-2">
                      <TrendChart rows={points} color={hex.main} dotColor={hex.tint} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">History</p>
          <div className="mt-2 flex flex-col gap-2">
            {rows
              .slice()
              .reverse()
              .map((row) => {
                const primaryValue = row.entry_data[metrics[0]?.key];
                // Passed the whole row: some checks are scored against
                // age- and sex-banded norms, and rows saved before those
                // were persisted return null rather than a guessed band.
                const statusLabel = metrics[0]?.statusLabel ? metrics[0].statusLabel(row.entry_data) : null;
                return (
                  <div
                    key={row.created_at}
                    className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2.5 text-sm shadow-sm dark:border-border-dark dark:bg-white/5"
                  >
                    <span className="font-medium text-ink dark:text-ink-dark">{formatDate(row.created_at)}</span>
                    <span className="flex items-center gap-2.5">
                      {metrics.slice(1).map((metric) => {
                        const v = row.entry_data[metric.key];
                        if (typeof v !== "number") return null;
                        return (
                          <span key={metric.key} className="text-xs font-semibold text-ink-soft dark:text-ink-dark-soft">
                            {v}
                            {metric.unit ? ` ${metric.unit}` : ""}
                          </span>
                        );
                      })}
                      {typeof primaryValue === "number" && (
                        <span className={`text-base font-bold ${style.eyebrow}`}>{primaryValue}</span>
                      )}
                      {statusLabel && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style.pill}`}>{statusLabel}</span>}
                    </span>
                  </div>
                );
              })}
          </div>
        </>
      )}

      <Link
        href={`/assess/${typeParam}?from=readings`}
        className={`mt-8 block w-full rounded-2xl py-4 text-center text-base font-bold text-white ${style.solidButton}`}
      >
        {rows.length === 0 ? "Take this check" : "Retake this check"}
      </Link>

      <TabBar />
    </main>
  );
}
