"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  computeCurrentDay,
  computeHabitStreak,
  getActiveEnrollment,
  getDayProgress,
  phaseForDay,
  saveDayProgress,
  startEnrollment,
  type ProgramEnrollment,
} from "@/lib/program";

type LoadState = "loading" | "no-enrollment" | "ready";

export default function ProgramPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [streak, setStreak] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [habitCompleted, setHabitCompleted] = useState(false);
  const [checkinNote, setCheckinNote] = useState("");
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
        setVideoWatched(progress.video_watched);
        setHabitCompleted(progress.habit_completed);
        setCheckinNote(progress.checkin_note ?? "");
      }
      setStreak(habitStreak);
      setLoadState("ready");
    }

    load();
  }, [router]);

  async function handleStart() {
    if (!userId) return;
    setStarting(true);
    const { enrollment: newEnrollment, error } = await startEnrollment(userId);
    setStarting(false);
    if (error || !newEnrollment) {
      setSaveStatus(`Couldn't start your programme: ${error}`);
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
      videoWatched,
      habitCompleted,
      checkinNote,
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
        <p className="text-neutral-500">Loading…</p>
      </main>
    );
  }

  if (loadState === "no-enrollment") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Start your 90-Day Transformation</h1>
        <p className="mt-3 text-neutral-600">
          A guided 90-day programme across three phases: Foundation, Strength & Metabolism, and
          Future Health. Once you start, day 1 begins today.
        </p>
        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-6 rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {starting ? "Starting…" : "Begin day 1"}
        </button>
        {saveStatus && <p className="mt-4 text-sm text-red-600">{saveStatus}</p>}
      </main>
    );
  }

  const phase = phaseForDay(currentDay);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
        Day {currentDay} of {enrollment?.program_length_days ?? 90}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{phase.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">{phase.focus}</p>

      {streak > 0 && (
        <p className="mt-3 inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-dark">
          🔥 {streak} day{streak === 1 ? "" : "s"} streak
        </p>
      )}

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Placeholder — content not yet produced</p>
        <p className="mt-2 text-sm text-neutral-600">
          Day {currentDay}&apos;s video and habit prompt will go here once the {phase.name} content
          is written and filmed (docs/PLAN.md §9, Phase 1). This screen tracks real progress
          against real days starting today — only the content itself is a placeholder.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <label className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4">
          <input
            type="checkbox"
            checked={videoWatched}
            onChange={(e) => setVideoWatched(e.target.checked)}
            className="h-5 w-5 accent-orange-500"
          />
          <span className="font-medium text-neutral-800">Watched today&apos;s video</span>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4">
          <input
            type="checkbox"
            checked={habitCompleted}
            onChange={(e) => setHabitCompleted(e.target.checked)}
            className="h-5 w-5 accent-orange-500"
          />
          <span className="font-medium text-neutral-800">Completed today&apos;s habit</span>
        </label>

        <div>
          <label className="text-sm font-medium text-neutral-800">Check-in note (optional)</label>
          <textarea
            value={checkinNote}
            onChange={(e) => setCheckinNote(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded border border-neutral-300 px-3 py-2"
            placeholder="How did today go?"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save today's progress"}
      </button>
      {saveStatus && <p className="mt-2 text-sm text-neutral-600">{saveStatus}</p>}
    </main>
  );
}
