"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import {
  completeEnrollment,
  computeCurrentDay,
  computeHabitStreak,
  getDayProgress,
  getLatestEnrollment,
  hasCompletedAssessments,
  saveDayProgress,
  startEnrollment,
  type ProgramEnrollment,
} from "@/lib/program";
import { getCompletionSummary, type CompletionSummary, type MovementDirection } from "@/lib/programCompletion";
import { contentForDay } from "@/lib/program21";
import { getActiveSubscription } from "@/lib/subscription";
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

type LoadState = "loading" | "no-access" | "no-enrollment" | "completed" | "ready";

const PROGRAM_LENGTH_DAYS = 21;

// TEMPORARY: paywall disabled for preview at Isaiah's request (2026-07-29).
// Flip back to true to restore the subscription gate — no other changes
// needed.
const PAYWALL_ENABLED = false;

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
function MovementPill({ direction }: { direction: MovementDirection }) {
  if (direction === "unrated") return null;

  const style: Record<Exclude<MovementDirection, "unrated">, { label: string; className: string }> = {
    // These name the band a reading falls in, not the raw number. 11 reps
    // and 15 reps are both "typical", so "Same range" is true where "Held"
    // would read as though nothing had changed at all. Saying which way a
    // raw score moved would need a per-check direction map — more reps is
    // better, a lower PSQI is better — and one entry backwards would tell
    // someone they improved when they declined.
    better: { label: "Better range", className: "bg-junebud/25 text-cognitive" },
    held: { label: "Same range", className: "bg-border/50 text-ink-faint dark:bg-border-dark dark:text-ink-dark-faint" },
    lower: { label: "Lower range", className: "bg-primary-light text-primary-dark dark:bg-primary-light-dark" },
    "first-time": {
      label: "First time",
      className: "bg-border/50 text-ink-faint dark:bg-border-dark dark:text-ink-dark-faint",
    },
    "not-retaken": {
      label: "Not retaken",
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
      if (PAYWALL_ENABLED) {
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
        setSummary(await getCompletionSummary(user.id, active.id, active.program_length_days, active.started_at));
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
      if (progress) {
        setLearned(progress.video_watched);
        setReflection(progress.checkin_note ?? "");
      }
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
    setReflection(progress?.checkin_note ?? "");
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
      setSaveStatus(`Couldn't start your challenge: ${error}`);
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
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    if (contentForDay(viewedDay).isClose) {
      const { error: testimonialError } = await saveTestimonial(userId, enrollment.id, viewedDay, testimonial);
      if (testimonialError) {
        setSaving(false);
        setSaveStatus(`Couldn't save: ${testimonialError}`);
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
        setSummary(await getCompletionSummary(userId, enrollment.id, enrollment.program_length_days, enrollment.started_at));
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
    setSummary(await getCompletionSummary(userId, enrollment.id, enrollment.program_length_days, enrollment.started_at));
    setLoadState("completed");
  }

  if (loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  if (loadState === "no-access") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 pb-28 text-center">
        <div className="mx-auto">
          <Logo size={48} />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
          The 21-Day ProAgeing Challenge
        </h1>
        <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
          Your 9 free assessment checks are always free. The guided 21-Day
          Challenge — daily actions, streaks, and a Keystone Habit at the
          end — is a paid programme.
        </p>
        <Link
          href="/upgrade"
          className="mt-6 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark"
        >
          See plans &amp; pricing
        </Link>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">21-Day Challenge</p>
            <h1 className="mt-2 text-balance font-serif text-2xl font-semibold text-ink">
              Start living the 7 ProAgeing Steps
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              One small action a day, for twenty-one days. Day 1 begins today.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">What you&apos;ll do</p>
          <ul className="mt-3 flex flex-col gap-3">
            {[
              { label: "Learn", body: "one idea a day, in a minute of reading." },
              { label: "Act", body: "a single action you can finish the same day." },
              { label: "Reflect", body: "a line to yourself, kept private." },
            ].map((item) => (
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
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">On day 21</p>
          <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
            You&apos;ll retake five of your checks and see exactly what moved — then name the one habit
            you&apos;re keeping.
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {starting ? "Starting…" : "Begin day 1"}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-cognitive">
              Challenge complete · {PROGRAM_LENGTH_DAYS} of {PROGRAM_LENGTH_DAYS}
            </p>
            <h1 className="mt-2 text-balance font-serif text-2xl font-semibold text-ink">You&apos;re a ProAger</h1>
            {summary.finishedOn && (
              <p className="mt-2 text-sm text-ink-soft">
                Finished{" "}
                {new Date(summary.finishedOn).toLocaleDateString("en-SG", { day: "numeric", month: "long" })}. Here&apos;s
                what changed.
              </p>
            )}
          </div>
        </div>

        {summary.keystoneHabit && (
          <div className="mt-6 rounded-xl border-[1.5px] border-junebud bg-junebud/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-cognitive">Your keystone habit</p>
            <p className="mt-2 font-serif text-lg leading-snug text-ink dark:text-ink-dark">
              &ldquo;{summary.keystoneHabit}&rdquo;
            </p>
            <p className="mt-2 text-xs text-cognitive">Declared on day {PROGRAM_LENGTH_DAYS} · yours to keep</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { n: summary.daysCompleted, l: "Days done" },
            { n: summary.bestStreak, l: "Best streak" },
            { n: summary.retakenCount, l: "Retaken" },
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
            <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">What moved</p>
            <p className="mt-1 text-xs text-ink-faint dark:text-ink-dark-faint">When you started → now</p>
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
                  <MovementPill direction={m.direction} />
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-ink-soft dark:border-border-dark dark:text-ink-dark-soft">
          Every retake is saved to your profile — your readings are already up to date.
        </p>

        <Link
          href="/dashboard/readings"
          className="mt-6 block w-full rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white transition hover:bg-primary-dark"
        >
          See my Longevity Readings
        </Link>
        <button
          onClick={revisitDays}
          className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-semibold text-ink transition hover:border-primary dark:border-border-dark dark:text-ink-dark"
        >
          Revisit any day
        </button>

        <TabBar />
      </main>
    );
  }

  const content = contentForDay(viewedDay);
  const isToday = viewedDay === currentDay;

  return (
    <main className="mx-auto max-w-xl overflow-x-hidden px-6 pb-28 pt-4">
      <div className="relative -mx-6 -mt-4 overflow-hidden border-b border-primary/25 bg-primary-light px-6 pb-6 pt-6 dark:bg-primary-light-dark">
        <HeroSwirl className="pointer-events-none absolute -top-3 right-2 w-32 text-primary opacity-25" />

        <div className="relative flex items-center justify-between">
          <button
            onClick={() => goToDay(viewedDay - 1)}
            disabled={viewedDay <= 1 || dayLoading}
            aria-label="Previous day"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary-dark transition hover:border-primary disabled:opacity-30 disabled:hover:border-primary/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Day {viewedDay} of {PROGRAM_LENGTH_DAYS}
            </p>
            {viewedDay !== currentDay && (
              <button onClick={() => goToDay(currentDay)} className="text-xs font-semibold text-ink-faint underline">
                Back to today (Day {currentDay})
              </button>
            )}
          </div>

          <button
            onClick={() => goToDay(viewedDay + 1)}
            disabled={viewedDay >= currentDay || dayLoading}
            aria-label="Next day"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary-dark transition hover:border-primary disabled:opacity-30 disabled:hover:border-primary/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <h1 className="relative mt-3 text-balance font-serif text-2xl font-semibold text-ink">{content.pillar}</h1>
      </div>

      {enrollment?.status === "completed" && (
        <button
          onClick={backToSummary}
          className="mt-3 text-sm font-semibold text-primary-dark underline"
        >
          ← Back to my summary
        </button>
      )}

      {streak > 0 && (
        <p className="mt-3 inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-dark dark:bg-primary-light-dark">
          🔥 {streak} day{streak === 1 ? "" : "s"} streak
        </p>
      )}

      {content.isProfileReveal && (
        <div className="mt-4 rounded-xl border border-primary bg-primary-light p-4 dark:bg-primary-light-dark">
          <p className="text-sm font-semibold text-primary-dark">
            All 7 ProAgeing Steps checked — see your full Healthy Longevity Profile on your{" "}
            <Link href="/dashboard" className="underline">
              dashboard
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Learn</p>
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
          {isToday ? "Read today's insight" : "Read this day's insight"}
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Act</p>
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
          {content.isClose ? "Done — retaken & Keystone Habit declared" : isToday ? "Done for today" : "Done"}
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Reflect</p>
        <p className="mt-2 text-sm font-medium text-ink dark:text-ink-dark">{content.reflect}</p>
        {content.reflectExamples && (
          <p className="mt-1 text-xs text-ink-faint dark:text-ink-dark-faint">
            e.g. {content.reflectExamples.map((ex) => `"${ex}"`).join(" · ")}
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
          placeholder="Your answer…"
        />
      </div>

      {content.isClose && (
        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Share your story</p>
          <p className="mt-2 text-sm font-medium text-ink dark:text-ink-dark">What has improved the most?</p>
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
              placeholder="What improved?"
              className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
            />
          )}

          <p className="mt-4 text-sm font-medium text-ink dark:text-ink-dark">
            Would you be willing to share this anonymously to encourage other adults?
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
              Yes
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
              No
            </button>
          </div>

          {testimonial.consentToShare && (
            <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 dark:border-border-dark">
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">
                  Before this programme, what was your biggest concern about ageing?
                </p>
                <textarea
                  value={testimonial.beforeConcern}
                  onChange={(e) => {
                    setTestimonial((t) => ({ ...t, beforeConcern: e.target.value }));
                    setJustSaved(false);
                  }}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
                  placeholder="Your answer…"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">What is one change you&apos;ve noticed?</p>
                <textarea
                  value={testimonial.changeNoticed}
                  onChange={(e) => {
                    setTestimonial((t) => ({ ...t, changeNoticed: e.target.value }));
                    setJustSaved(false);
                  }}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
                  placeholder="Your answer…"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">
                  What would you say to someone your age who is hesitant to start?
                </p>
                <textarea
                  value={testimonial.recommendation}
                  onChange={(e) => {
                    setTestimonial((t) => ({ ...t, recommendation: e.target.value }));
                    setJustSaved(false);
                  }}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
                  placeholder="Your answer…"
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
        {saving ? "Saving…" : justSaved ? "Saved" : isToday ? "Save today's progress" : `Save Day ${viewedDay}'s progress`}
      </button>
      {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}

      <TabBar />
    </main>
  );
}
