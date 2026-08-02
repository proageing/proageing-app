"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { greetingNameFromEmail } from "@/lib/formatResult";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { HomeCards } from "@/components/HomeCards";
import { AffirmationCarousel } from "@/components/AffirmationCarousel";
import { SevenStepsSection } from "@/components/SevenStepsSection";
import { WatermarkSwirl } from "@/components/BrandSwirl";
import type { AssessmentType } from "@/lib/importHistory";

const AFFIRMATIONS = [
  "Healthy longevity starts today!",
  "ProAgeing, a step at a time.",
  "Small steps, longer years.",
  "Your decision today, shapes your tomorrow.",
  "Invest in your future self.",
];

interface ResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
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
  const [greetingName, setGreetingName] = useState("there");
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

      setGreetingName(greetingNameFromEmail(user.email));

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
    <main className="relative mx-auto max-w-2xl overflow-x-hidden px-6 pb-28 pt-8">
      <WatermarkSwirl className="pointer-events-none absolute -right-24 -top-20 w-[420px] text-primary opacity-[0.06]" />

      <div className="relative">
        <AppHeader onSignOut={handleSignOut} />

        <p className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Hello, {greetingName}!</p>
      {isFirstVisit ? (
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">Here&apos;s how ProAge works.</p>
      ) : (
        <AffirmationCarousel quotes={AFFIRMATIONS} />
      )}

      <HomeCards completedCount={completedCount} totalCount={ASSESSMENT_TYPES.length} />

      {isFirstVisit && (
        <>
          <div className="mt-8 flex flex-col gap-4">
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
        </>
      )}

        <SevenStepsSection />
      </div>

      <TabBar />
    </main>
  );
}
