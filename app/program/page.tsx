"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  computeCurrentDay,
  computeHabitStreak,
  getActiveEnrollment,
  getDayProgress,
  saveDayProgress,
  startEnrollment,
  type ProgramEnrollment,
} from "@/lib/program";
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
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";

type LoadState = "loading" | "no-access" | "no-enrollment" | "ready";

const PROGRAM_LENGTH_DAYS = 21;

// TEMPORARY: paywall disabled for preview at Isaiah's request (2026-07-29).
// Flip back to true to restore the subscription gate — no other changes
// needed.
const PAYWALL_ENABLED = false;

export default function ProgramPage() {
  const router = useRouter();
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

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
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

      const active = await getActiveEnrollment(user.id);
      if (!active) {
        setLoadState("no-enrollment");
        return;
      }

      setEnrollment(active);
      const day = computeCurrentDay(active.started_at, active.program_length_days);
      setCurrentDay(day);
      setViewedDay(day);

      const [progress, habitStreak] = await Promise.all([
        getDayProgress(active.id, day),
        computeHabitStreak(active.id, day),
      ]);

      if (progress) {
        setLearned(progress.video_watched);
        setActionDone(progress.habit_completed);
        setReflection(progress.checkin_note ?? "");
      }
      if (contentForDay(day).isClose) {
        setTestimonial((await getTestimonial(active.id, day)) ?? emptyTestimonial());
      }
      setStreak(habitStreak);
      setLoadState("ready");
    }

    load();
  }, [router]);

  async function goToDay(day: number) {
    if (!enrollment || day < 1 || day > currentDay) return;
    setViewedDay(day);
    setJustSaved(false);
    setSaveStatus(null);
    setDayLoading(true);
    const progress = await getDayProgress(enrollment.id, day);
    setLearned(progress?.video_watched ?? false);
    setActionDone(progress?.habit_completed ?? false);
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
    setSaving(false);
    // Streak is always anchored to today, even when saving a backfilled
    // past day — completing a missed day can extend it.
    const newStreak = await computeHabitStreak(enrollment.id, currentDay);
    setStreak(newStreak);
    setJustSaved(true);
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 pb-28 text-center">
        <div className="mx-auto">
          <Logo size={48} />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
          The 21-Day ProAgeing Challenge
        </h1>
        <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
          Try out and start living the 7 ProAgeing Steps. Day 1 begins today.
        </p>
        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-6 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {starting ? "Starting…" : "Begin day 1"}
        </button>
        {saveStatus && <p className="mt-4 text-sm text-red-600">{saveStatus}</p>}
        <TabBar />
      </main>
    );
  }

  const content = contentForDay(viewedDay);
  const isToday = viewedDay === currentDay;

  return (
    <main className="mx-auto max-w-xl px-6 pb-28 pt-8">
      <AppHeader />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => goToDay(viewedDay - 1)}
          disabled={viewedDay <= 1 || dayLoading}
          aria-label="Previous day"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink-soft transition hover:border-primary hover:text-primary-dark disabled:opacity-30 disabled:hover:border-border disabled:hover:text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
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
            <button onClick={() => goToDay(currentDay)} className="text-xs font-semibold text-ink-faint underline dark:text-ink-dark-faint">
              Back to today (Day {currentDay})
            </button>
          )}
        </div>

        <button
          onClick={() => goToDay(viewedDay + 1)}
          disabled={viewedDay >= currentDay || dayLoading}
          aria-label="Next day"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink-soft transition hover:border-primary hover:text-primary-dark disabled:opacity-30 disabled:hover:border-border disabled:hover:text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{content.pillar}</h1>

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
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Learn</p>
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
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Act</p>
        {content.assessments && content.assessments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {content.assessments.map((a) => (
              <Link
                key={a.href}
                href={`${a.href}?from=program`}
                className="rounded-lg border border-primary px-3 py-2 text-center text-sm font-semibold text-primary-dark transition hover:bg-primary-light dark:hover:bg-primary-light-dark"
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
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Reflect</p>
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
          className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
          placeholder="Your answer…"
        />
      </div>

      {content.isClose && (
        <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Share your story</p>
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
