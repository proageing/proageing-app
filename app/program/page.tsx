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
import { Logo } from "@/components/Logo";

type LoadState = "loading" | "no-enrollment" | "ready";

const PROGRAM_LENGTH_DAYS = 21;

export default function ProgramPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [streak, setStreak] = useState(0);
  const [learned, setLearned] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
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

      const active = await getActiveEnrollment(user.id);
      if (!active) {
        setLoadState("no-enrollment");
        return;
      }

      setEnrollment(active);
      const day = computeCurrentDay(active.started_at, active.program_length_days);
      setCurrentDay(day);

      const [progress, habitStreak] = await Promise.all([
        getDayProgress(active.id, day),
        computeHabitStreak(active.id, day),
      ]);

      if (progress) {
        setLearned(progress.video_watched);
        setActionDone(progress.habit_completed);
        setReflection(progress.checkin_note ?? "");
      }
      setStreak(habitStreak);
      setLoadState("ready");
    }

    load();
  }, [router]);

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
    setLoadState("ready");
  }

  async function handleSave() {
    if (!enrollment) return;
    setSaving(true);
    setSaveStatus(null);
    const { error } = await saveDayProgress(enrollment.id, currentDay, {
      videoWatched: learned,
      habitCompleted: actionDone,
      checkinNote: reflection,
    });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    const newStreak = await computeHabitStreak(enrollment.id, currentDay);
    setStreak(newStreak);
    setSaveStatus("Saved.");
  }

  if (loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  if (loadState === "no-enrollment") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
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
      </main>
    );
  }

  const content = contentForDay(currentDay);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
        Day {currentDay} of {PROGRAM_LENGTH_DAYS}
      </p>
      <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{content.pillar}</h1>

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
          <input type="checkbox" checked={learned} onChange={(e) => setLearned(e.target.checked)} className="h-4 w-4 accent-primary" />
          Read today&apos;s insight
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Act</p>
        {content.assessments && content.assessments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {content.assessments.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-lg border border-primary px-3 py-2 text-center text-sm font-semibold text-primary-dark transition hover:bg-primary-light dark:hover:bg-primary-light-dark"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">{content.action}</p>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
          <input type="checkbox" checked={actionDone} onChange={(e) => setActionDone(e.target.checked)} className="h-4 w-4 accent-primary" />
          {content.isClose ? "Done — retaken & Keystone Habit declared" : "Done for today"}
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Reflect</p>
        <p className="mt-2 text-sm font-medium text-ink dark:text-ink-dark">{content.reflect}</p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
          placeholder="Your answer…"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save today's progress"}
      </button>
      {saveStatus && <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{saveStatus}</p>}
    </main>
  );
}
