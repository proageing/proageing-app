"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import {
  completeEnrollment,
  computeCurrentDay,
  computeHabitStreak,
  countCompletedAssessments,
  getDayProgress,
  getLatestEnrollment,
  hasCompletedAssessments,
  saveDayProgress,
  startEnrollment,
  type ProgramEnrollment,
} from "@/lib/program";
import { getCompletionSummary, type CompletionSummary, type MovementDirection } from "@/lib/programCompletion";
import { contentForDay } from "@/lib/program21";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { computeWeeklyMomentum, getDayCompletions, type WeeklyMomentum } from "@/lib/momentum";
import { getActiveSubscription } from "@/lib/subscription";
import { planById } from "@/lib/plans";
import {
  emptyTestimonial,
  getTestimonial,
  saveTestimonial,
  IMPROVED_MOST_OPTIONS,
  type TestimonialFields,
} from "@/lib/testimonials";
import { Logo } from "@/components/Logo";
import { TabBar } from "@/components/TabBar";
import { HeroSwirl } from "@/components/BrandSwirl";
import { useLocale } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/en";

type LoadState = "loading" | "no-access" | "no-enrollment" | "completed" | "ready";

const PROGRAM_LENGTH_DAYS = 21;

// Gates the 21-Day Challenge behind a purchase (docs/PLAN.md §5). Was
// temporarily disabled for preview (2026-07-29); re-enabled once the
// no-access screen became a real showcase worth gating behind. Only
// enforced when arriving via the home dashboard's Challenge card
// (?gate=1) — the bottom-nav Programme tab bypasses it for now so the
// built programme can be reviewed directly (Isaiah, 2026-08-04).
const PAYWALL_ENABLED = true;

// The linked assessment(s) for a day, so the Act card's Done checkbox can
// default to checked when someone returns having taken them. Excludes the
// closing day, which asks for a retake of 5 checks plus a Keystone Habit
// declaration — one check being done there doesn't mean the day is done.
function assessmentTypesForDay(day: number): string[] {
  const content = contentForDay(day);
  if (content.isClose || !content.assessments) return [];
  return content.assessments.map((a) => a.href.split("/").pop()!);
}

// Deliberately understated. A check that didn't move, or moved the wrong
// way, still gets a neutral label rather than being hidden or dressed up —
// the point of the retake is an honest read, not a guaranteed win.
function MovementPill({ direction, t }: { direction: MovementDirection; t: Dictionary }) {
  if (direction === "unrated") return null;

  const style: Record<Exclude<MovementDirection, "unrated">, { label: string; className: string }> = {
    // These name the band a reading falls in, not the raw number. 11 reps
    // and 15 reps are both "typical", so "Same range" is true where "Held"
    // would read as though nothing had changed at all. Saying which way a
    // raw score moved would need a per-check direction map — more reps is
    // better, a lower PSQI is better — and one entry backwards would tell
    // someone they improved when they declined.
    better: { label: t.programme.complete.betterRange, className: "bg-junebud/25 text-cognitive dark:text-junebud" },
    held: { label: t.programme.complete.sameRange, className: "bg-border/50 text-ink-faint dark:bg-border-dark dark:text-ink-dark-faint" },
    lower: { label: t.programme.complete.lowerRange, className: "bg-primary-light text-primary-dark dark:bg-primary-light-dark" },
    "first-time": {
      label: t.programme.complete.firstTime,
      className: "bg-border/50 text-ink-faint dark:bg-border-dark dark:text-ink-dark-faint",
    },
    "not-retaken": {
      label: t.programme.complete.notRetaken,
      className: "bg-border/50 text-ink-faint dark:bg-border-dark dark:text-ink-dark-faint",
    },
  };

  const { label, className } = style[direction];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${className}`}>{label}</span>
  );
}

export default function ProgramPage() {
  return (
    <Suspense fallback={null}>
      <ProgramPageInner />
    </Suspense>
  );
}

function ProgramPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [viewedDay, setViewedDay] = useState(1);
  const [dayLoading, setDayLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [learned, setLearned] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [reflection, setReflection] = useState("");
  const [testimonial, setTestimonial] = useState<TestimonialFields>(emptyTestimonial());
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [starting, setStarting] = useState(false);
  const [summary, setSummary] = useState<CompletionSummary | null>(null);
  const [completedChecksCount, setCompletedChecksCount] = useState(0);
  const [weeklyMomentum, setWeeklyMomentum] = useState<WeeklyMomentum | null>(null);
  const { locale, t } = useLocale();

  async function refreshMomentum(enrollmentId: string, viewedDayNum: number, currentDayNum: number) {
    const rows = await getDayCompletions(enrollmentId);
    setWeeklyMomentum(computeWeeklyMomentum(viewedDayNum, currentDayNum, rows));
  }

  // Real weekday labels (not a fixed Mon-Sun) since a 21-day programme can
  // start on any day of the week.
  function weekdayLabel(startedAt: string, dayNumber: number): string {
    const date = new Date(startedAt + "T00:00:00");
    date.setDate(date.getDate() + (dayNumber - 1));
    return date.toLocaleDateString(locale === "zh" ? "zh-Hans-SG" : "en-SG", { weekday: "short" });
  }

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(signInHrefFor(window.location.pathname + window.location.search));
        return;
      }
      setUserId(user.id);

      // The 21-Day Challenge and 90-Day Transformation are both paid,
      // one-time purchases (docs/PLAN.md §5) — either grants access to the
      // programme content that exists today, which is the 21-day track
      // (lib/program21.ts). 90-day-specific content hasn't been built yet.
      if (PAYWALL_ENABLED && searchParams.get("gate") === "1") {
        const subscription = await getActiveSubscription(user.id);
        if (!subscription || (subscription.plan !== "21-day" && subscription.plan !== "90-day")) {
          setLoadState("no-access");
          return;
        }
      }

      const active = await getLatestEnrollment(user.id);
      if (!active) {
        setLoadState("no-enrollment");
        return;
      }

      setEnrollment(active);
      const today = computeCurrentDay(active.started_at, active.program_length_days);
      setCurrentDay(today);

      // A finished programme opens on its summary rather than dropping the
      // user back onto the last day with nothing left to do.
      if (active.status === "completed") {
        setViewedDay(active.program_length_days);
        setSummary(await getCompletionSummary(user.id, active.id, active.program_length_days, active.started_at, t));
        setLoadState("completed");
        return;
      }

      // Returning from a check taken via a day's Act card (?day=) should
      // land back on that day, not reset to whatever day it is today.
      const requestedDay = Number(searchParams.get("day"));
      const day = requestedDay >= 1 && requestedDay <= today ? requestedDay : today;
      setViewedDay(day);

      const [progress, habitStreak] = await Promise.all([
        getDayProgress(active.id, day),
        computeHabitStreak(active.id, today),
      ]);

      if (progress?.habit_completed) {
        setActionDone(true);
      } else {
        setActionDone(await hasCompletedAssessments(user.id, assessmentTypesForDay(day)));
      }
      setCompletedChecksCount(await countCompletedAssessments(user.id, ASSESSMENT_TYPES.map((a) => a.type)));
      if (progress) {
        setLearned(progress.video_watched);
        setReflection(progress.checkin_note ?? "");
      }
      await refreshMomentum(active.id, day, today);
      if (contentForDay(day).isClose) {
        setTestimonial((await getTestimonial(active.id, day)) ?? emptyTestimonial());
      }
      setStreak(habitStreak);
      setLoadState("ready");
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function goToDay(day: number) {
    if (!enrollment || !userId || day < 1 || day > currentDay) return;
    setViewedDay(day);
    setJustSaved(false);
    setSaveStatus(null);
    setDayLoading(true);
    const progress = await getDayProgress(enrollment.id, day);
    setLearned(progress?.video_watched ?? false);
    if (progress?.habit_completed) {
      setActionDone(true);
    } else {
      setActionDone(await hasCompletedAssessments(userId, assessmentTypesForDay(day)));
    }
    setCompletedChecksCount(await countCompletedAssessments(userId, ASSESSMENT_TYPES.map((a) => a.type)));
    setReflection(progress?.checkin_note ?? "");
    await refreshMomentum(enrollment.id, day, currentDay);
    if (contentForDay(day).isClose) {
      setTestimonial((await getTestimonial(enrollment.id, day)) ?? emptyTestimonial());
    } else {
      setTestimonial(emptyTestimonial());
    }
    setDayLoading(false);
  }

  async function handleStart() {
    if (!userId) return;
    setStarting(true);
    const { enrollment: newEnrollment, error } = await startEnrollment(userId, PROGRAM_LENGTH_DAYS);
    setStarting(false);
    if (error || !newEnrollment) {
      setSaveStatus(t.programme.notStarted.couldntStart(String(error)));
      return;
    }
    setEnrollment(newEnrollment);
    setCurrentDay(1);
    setViewedDay(1);
    setLoadState("ready");
  }

  async function handleSave() {
    if (!enrollment || !userId) return;
    setSaving(true);
    setSaveStatus(null);
    setJustSaved(false);
    const { error } = await saveDayProgress(enrollment.id, viewedDay, {
      videoWatched: learned,
      habitCompleted: actionDone,
      checkinNote: reflection,
    });
    if (error) {
      setSaving(false);
      setSaveStatus(t.common.couldntSave(error));
      return;
    }
    await refreshMomentum(enrollment.id, viewedDay, currentDay);
    if (contentForDay(viewedDay).isClose) {
      const { error: testimonialError } = await saveTestimonial(userId, enrollment.id, viewedDay, testimonial);
      if (testimonialError) {
        setSaving(false);
        setSaveStatus(t.common.couldntSave(testimonialError));
        return;
      }
    }
    // Ticking the closing day's action is what finishes the programme —
    // the retakes are done and the Keystone Habit has been declared.
    // Everything above has already been saved by this point, so a failure
    // here costs the summary screen, not the user's work.
    if (viewedDay === enrollment.program_length_days && actionDone && enrollment.status !== "completed") {
      const { error: completeError } = await completeEnrollment(enrollment.id);
      if (!completeError) {
        setEnrollment({ ...enrollment, status: "completed" });
        setSummary(await getCompletionSummary(userId, enrollment.id, enrollment.program_length_days, enrollment.started_at, t));
        setSaving(false);
        setLoadState("completed");
        return;
      }
    }

    setSaving(false);
    // Streak is always anchored to today, even when saving a backfilled
    // past day — completing a missed day can extend it.
    const newStreak = await computeHabitStreak(enrollment.id, currentDay);
    setStreak(newStreak);
    setJustSaved(true);
  }

  // Lets someone who has finished step back into the daily view (and,
  // from there, back to the summary) without restarting anything.
  async function revisitDays() {
    await goToDay(currentDay);
    setLoadState("ready");
  }

  async function backToSummary() {
    if (!enrollment || !userId) return;
    setSummary(await getCompletionSummary(userId, enrollment.id, enrollment.program_length_days, enrollment.started_at, t));
    setLoadState("completed");
  }

  if (loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">{t.common.loading}</p>
      </main>
    );
  }

  if (loadState === "no-access") {
    const plan = planById("21-day");
    return (
      <main className="mx-auto max-w-xl overflow-x-hidden px-6 pb-28 pt-8">
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-primary-dark">
          {t.programme.noAccess.eyebrow}
        </p>
        <h1 className="mt-1 text-balance text-center font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
          {t.programme.noAccess.title}
        </h1>
        {plan && (
          <p className="mt-4 text-center font-serif text-3xl font-bold text-ink dark:text-ink-dark">{plan.priceLabel}</p>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-border shadow-card dark:border-border-dark">
          <Image src="/programme-preview.png" alt="" width={880} height={1050} className="block h-auto w-full" />
        </div>
        <p className="mt-2 text-center text-xs font-semibold text-ink-faint dark:text-ink-dark-faint">
          {t.programme.noAccess.previewCaption}
        </p>

        <div className="mt-7 flex flex-col gap-5">
          {t.programme.noAccess.features.map((f) => (
            <div key={f.strong} className="flex gap-3">
              <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-junebud">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4.5 4.5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-sm leading-relaxed text-ink-soft dark:text-ink-dark-soft">
                <strong className="text-ink dark:text-ink-dark">{f.strong}</strong> {f.rest}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/upgrade?plan=21-day"
          className="mt-8 block w-full rounded-2xl bg-primary py-4 text-center text-base font-bold text-white transition hover:bg-primary-dark"
        >
          {t.programme.noAccess.cta}
        </Link>
        <p className="mt-3 text-center text-xs text-ink-faint dark:text-ink-dark-faint">{t.programme.noAccess.fine}</p>

        <TabBar />
      </main>
    );
  }

  if (loadState === "no-enrollment") {
    return (
      <main className="mx-auto max-w-xl overflow-x-hidden px-6 pb-28 pt-4">
        <div className="relative -mx-6 -mt-4 overflow-hidden border-b border-primary/25 bg-primary-light px-6 pb-6 pt-6 dark:bg-primary-light-dark">
          <HeroSwirl className="pointer-events-none absolute -top-3 right-2 w-32 text-primary opacity-25" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">{t.programme.notStarted.eyebrow}</p>
            <h1 className="mt-2 text-balance font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
              {t.programme.notStarted.title}
            </h1>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
              {t.programme.notStarted.blurb}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.notStarted.whatYoullDo}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {t.programme.notStarted.items.map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm text-ink-soft dark:text-ink-dark-soft">
                <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-dark dark:bg-primary-light-dark">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>
                  <span className="font-semibold text-ink dark:text-ink-dark">{item.label}</span> — {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.notStarted.onDay21}</p>
          <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
            {t.programme.notStarted.onDay21Body}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {starting ? t.programme.notStarted.starting : t.programme.notStarted.begin}
        </button>
        {saveStatus && <p className="mt-3 text-center text-sm text-red-600">{saveStatus}</p>}

        <TabBar />
      </main>
    );
  }

  if (loadState === "completed" && summary) {
    return (
      <main className="mx-auto max-w-xl overflow-x-hidden px-6 pb-28 pt-4">
        <div className="relative -mx-6 -mt-4 overflow-hidden border-b border-primary/25 bg-primary-light px-6 pb-6 pt-6 dark:bg-primary-light-dark">
          <HeroSwirl className="pointer-events-none absolute -top-3 right-2 w-32 text-primary opacity-25" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wide text-cognitive dark:text-junebud">
              {t.programme.complete.eyebrow(PROGRAM_LENGTH_DAYS)}
            </p>
            <h1 className="mt-2 text-balance font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{t.programme.complete.title}</h1>
            {summary.finishedOn && (
              <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
                {t.programme.complete.finishedOn(
                  new Date(summary.finishedOn).toLocaleDateString(locale === "zh" ? "zh-Hans-SG" : "en-SG", {
                    day: "numeric",
                    month: "long",
                  })
                )}
              </p>
            )}
          </div>
        </div>

        {summary.keystoneHabit && (
          <div className="mt-6 rounded-xl border-[1.5px] border-junebud bg-junebud/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-cognitive dark:text-junebud">{t.programme.complete.keystone}</p>
            <p className="mt-2 font-serif text-lg leading-snug text-ink dark:text-ink-dark">
              &ldquo;{summary.keystoneHabit}&rdquo;
            </p>
            <p className="mt-2 text-xs text-cognitive dark:text-junebud">{t.programme.complete.keystoneFooter(PROGRAM_LENGTH_DAYS)}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { n: summary.daysCompleted, l: t.programme.complete.daysDone },
            { n: summary.bestStreak, l: t.programme.complete.bestStreak },
            { n: summary.retakenCount, l: t.programme.complete.retaken },
          ].map((stat) => (
            <div
              key={stat.l}
              className="rounded-xl border border-border bg-white p-3 text-center shadow-sm dark:border-border-dark dark:bg-white/5"
            >
              <p className="font-serif text-xl font-bold tabular-nums text-ink dark:text-ink-dark">{stat.n}</p>
              <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
                {stat.l}
              </p>
            </div>
          ))}
        </div>

        {summary.movements.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.complete.whatMoved}</p>
            <p className="mt-1 text-xs text-ink-faint dark:text-ink-dark-faint">{t.programme.complete.whatMovedRange}</p>
            <div className="mt-2 flex flex-col">
              {summary.movements.map((m) => (
                <div
                  key={m.type}
                  className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 dark:border-border-dark"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-soft dark:text-ink-dark-soft">{m.title}</span>
                  <span className="whitespace-nowrap text-sm tabular-nums text-ink-faint dark:text-ink-dark-faint">
                    {m.firstLabel && <>{m.firstLabel} → </>}
                    <span className="font-bold text-ink dark:text-ink-dark">{m.latestLabel}</span>
                  </span>
                  <MovementPill direction={m.direction} t={t} />
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-ink-soft dark:border-border-dark dark:text-ink-dark-soft">
          {t.programme.complete.readingsSaved}
        </p>

        <Link
          href="/dashboard/readings"
          className="mt-6 block w-full rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white transition hover:bg-primary-dark"
        >
          {t.programme.complete.seeReadings}
        </Link>
        <button
          onClick={revisitDays}
          className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-semibold text-ink transition hover:border-primary dark:border-border-dark dark:text-ink-dark"
        >
          {t.programme.complete.revisitDays}
        </button>

        <TabBar />
      </main>
    );
  }

  const content = contentForDay(viewedDay, locale);
  const isToday = viewedDay === currentDay;

  return (
    <main className="mx-auto max-w-xl overflow-x-hidden px-6 pb-28 pt-4">
      <div className="relative -mx-6 -mt-4 overflow-hidden border-b border-primary/25 bg-primary-light px-6 pb-6 pt-6 dark:bg-primary-light-dark">
        <HeroSwirl className="pointer-events-none absolute -top-3 right-2 w-32 text-primary opacity-25" />

        <div className="relative flex items-center justify-between">
          <button
            onClick={() => goToDay(viewedDay - 1)}
            disabled={viewedDay <= 1 || dayLoading}
            aria-label={t.programme.day.previousDay}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-dark/40 bg-white/70 text-primary-dark shadow-sm transition hover:border-primary hover:bg-white disabled:opacity-30 disabled:hover:border-primary-dark/40 dark:border-white/20 dark:bg-black/30 dark:hover:bg-black/45"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              {t.programme.day.dayOf(viewedDay, PROGRAM_LENGTH_DAYS)}
            </p>
            {viewedDay !== currentDay && (
              <button onClick={() => goToDay(currentDay)} className="text-xs font-semibold text-ink-faint underline">
                {t.programme.day.backToToday(currentDay)}
              </button>
            )}
          </div>

          <button
            onClick={() => goToDay(viewedDay + 1)}
            disabled={viewedDay >= currentDay || dayLoading}
            aria-label={t.programme.day.nextDay}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-dark/40 bg-white/70 text-primary-dark shadow-sm transition hover:border-primary hover:bg-white disabled:opacity-30 disabled:hover:border-primary-dark/40 dark:border-white/20 dark:bg-black/30 dark:hover:bg-black/45"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <h1 className="relative mt-3 text-balance font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{content.pillar}</h1>
      </div>

      {enrollment?.status === "completed" && (
        <button
          onClick={backToSummary}
          className="mt-3 text-sm font-semibold text-primary-dark underline"
        >
          {t.programme.day.backToSummary}
        </button>
      )}

      {streak > 0 && (
        <p className="mt-3 inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-dark dark:bg-primary-light-dark">
          {t.programme.day.streak(streak)}
        </p>
      )}

      {weeklyMomentum && (
        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.momentum.title}</p>
          <p className="mt-1 font-serif text-2xl font-bold text-ink dark:text-ink-dark">
            {weeklyMomentum.completedCount}
            <span className="ml-1 font-sans text-base font-medium text-ink-faint dark:text-ink-dark-faint">
              {t.programme.momentum.countSuffix(weeklyMomentum.totalCount)}
            </span>
          </p>
          <div className="mt-3 flex justify-between gap-1.5">
            {weeklyMomentum.dots.map((d) => (
              <div key={d.dayNumber} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[0.6rem] font-bold uppercase text-ink-faint dark:text-ink-dark-faint">
                  {enrollment ? weekdayLabel(enrollment.started_at, d.dayNumber) : ""}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    d.status === "done"
                      ? "border-junebud bg-junebud"
                      : d.status === "today"
                        ? "border-dashed border-primary"
                        : d.status === "missed"
                          ? "border-border dark:border-border-dark"
                          : "border-border opacity-40 dark:border-border-dark"
                  }`}
                >
                  {d.status === "done" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4.5 4.5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-ink-soft dark:text-ink-dark-soft">
            {weeklyMomentum.completedCount === weeklyMomentum.totalCount
              ? t.programme.momentum.footerComplete
              : t.programme.momentum.footerInProgress}
          </p>
        </div>
      )}

      {content.isProfileReveal && completedChecksCount === ASSESSMENT_TYPES.length && (
        <div className="mt-4 rounded-xl border border-primary bg-primary-light p-4 dark:bg-primary-light-dark">
          <p className="text-sm font-semibold text-primary-dark">
            {t.programme.day.profileReveal}{" "}
            <Link href="/dashboard/readings" className="underline">
              {t.programme.day.profileRevealLink}
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.day.learn}</p>
        <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{content.learn}</p>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
          <input
            type="checkbox"
            checked={learned}
            onChange={(e) => {
              setLearned(e.target.checked);
              setJustSaved(false);
            }}
            className="h-4 w-4 accent-primary"
          />
          {isToday ? t.programme.day.readToday : t.programme.day.readThisDay}
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.day.act}</p>
        {content.assessments && content.assessments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {content.assessments.map((a) => (
              <Link
                key={a.href}
                href={`${a.href}?from=program&day=${viewedDay}`}
                className="rounded-lg border border-primary bg-white px-3 py-2 text-center text-sm font-semibold text-primary-dark transition hover:bg-primary-light dark:bg-transparent dark:hover:bg-primary-light-dark"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">{content.action}</p>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
          <input
            type="checkbox"
            checked={actionDone}
            onChange={(e) => {
              setActionDone(e.target.checked);
              setJustSaved(false);
            }}
            className="h-4 w-4 accent-primary"
          />
          {content.isClose ? t.programme.day.doneClose : isToday ? t.programme.day.doneToday : t.programme.day.done}
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.day.reflect}</p>
        <p className="mt-2 text-sm font-medium text-ink dark:text-ink-dark">{content.reflect}</p>
        {content.reflectExamples && (
          <p className="mt-1 text-xs text-ink-faint dark:text-ink-dark-faint">
            {t.programme.day.examples(content.reflectExamples.map((ex) => `"${ex}"`).join(" · "))}
          </p>
        )}
        <textarea
          value={reflection}
          onChange={(e) => {
            setReflection(e.target.value);
            setJustSaved(false);
          }}
          rows={3}
          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
          placeholder={t.programme.day.answerPlaceholder}
        />
      </div>

      {content.isClose && (
        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.programme.testimonial.heading}</p>
          <p className="mt-2 text-sm font-medium text-ink dark:text-ink-dark">{t.programme.testimonial.improvedMost}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {IMPROVED_MOST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTestimonial((t) => ({ ...t, improvedMost: opt.value }));
                  setJustSaved(false);
                }}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  testimonial.improvedMost === opt.value
                    ? "border-primary bg-primary-light text-primary-dark dark:bg-primary-light-dark"
                    : "border-border text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {testimonial.improvedMost === "other" && (
            <input
              type="text"
              value={testimonial.improvedMostOther}
              onChange={(e) => {
                setTestimonial((t) => ({ ...t, improvedMostOther: e.target.value }));
                setJustSaved(false);
              }}
              placeholder={t.programme.testimonial.otherPlaceholder}
              className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
            />
          )}

          <p className="mt-4 text-sm font-medium text-ink dark:text-ink-dark">
            {t.programme.testimonial.consentQuestion}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                setTestimonial((t) => ({ ...t, consentToShare: true }));
                setJustSaved(false);
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                testimonial.consentToShare === true
                  ? "border-primary bg-primary-light text-primary-dark dark:bg-primary-light-dark"
                  : "border-border text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
              }`}
            >
              {t.programme.testimonial.yes}
            </button>
            <button
              onClick={() => {
                setTestimonial((t) => ({ ...t, consentToShare: false }));
                setJustSaved(false);
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                testimonial.consentToShare === false
                  ? "border-primary bg-primary-light text-primary-dark dark:bg-primary-light-dark"
                  : "border-border text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
              }`}
            >
              {t.programme.testimonial.no}
            </button>
          </div>

          {testimonial.consentToShare && (
            <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 dark:border-border-dark">
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">
                  {t.programme.testimonial.beforeConcern}
                </p>
                <textarea
                  value={testimonial.beforeConcern}
                  onChange={(e) => {
                    setTestimonial((t) => ({ ...t, beforeConcern: e.target.value }));
                    setJustSaved(false);
                  }}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
                  placeholder={t.programme.day.answerPlaceholder}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">{t.programme.testimonial.changeNoticed}</p>
                <textarea
                  value={testimonial.changeNoticed}
                  onChange={(e) => {
                    setTestimonial((t) => ({ ...t, changeNoticed: e.target.value }));
                    setJustSaved(false);
                  }}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
                  placeholder={t.programme.day.answerPlaceholder}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">
                  {t.programme.testimonial.recommendation}
                </p>
                <textarea
                  value={testimonial.recommendation}
                  onChange={(e) => {
                    setTestimonial((t) => ({ ...t, recommendation: e.target.value }));
                    setJustSaved(false);
                  }}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
                  placeholder={t.programme.day.answerPlaceholder}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || dayLoading}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition disabled:opacity-50 ${
          justSaved && !saving
            ? "bg-junebud text-ink"
            : "bg-primary text-white hover:bg-primary-dark"
        }`}
      >
        {justSaved && !saving && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {saving ? t.common.saving : justSaved ? t.common.saved : isToday ? t.programme.day.saveToday : t.programme.day.saveDay(viewedDay)}
      </button>
      {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}

      <TabBar />
    </main>
  );
}
