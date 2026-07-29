import { supabase } from "@/lib/supabase";

// Phase themes from docs/PLAN.md §2, for a 90-day enrollment. PAUSED —
// the 21-day programme (lib/program21.ts) is the active track for now;
// this is kept for when 90-day work resumes, not currently used by
// app/program.
export const PROGRAM_PHASES = [
  { startDay: 1, endDay: 30, name: "Foundation", focus: "Protein, walking, sleep" },
  { startDay: 31, endDay: 60, name: "Strength & Metabolism", focus: "Resistance training, waist reduction" },
  { startDay: 61, endDay: 90, name: "Future Health", focus: "Stress, purpose, social connection, maintenance" },
] as const;

export function phaseForDay(day: number) {
  return PROGRAM_PHASES.find((p) => day >= p.startDay && day <= p.endDay) ?? PROGRAM_PHASES[PROGRAM_PHASES.length - 1];
}

export interface ProgramEnrollment {
  id: string;
  user_id: string;
  program_length_days: number;
  started_at: string; // YYYY-MM-DD
  status: "active" | "completed" | "cancelled";
}

export interface DayProgressRow {
  id: string;
  enrollment_id: string;
  day_number: number;
  video_watched: boolean;
  habit_completed: boolean;
  checkin_note: string | null;
  completed_at: string | null;
}

// Day 1 is the start date itself, not the day after.
export function computeCurrentDay(startedAt: string, programLengthDays: number): number {
  const start = new Date(startedAt + "T00:00:00");
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(programLengthDays, Math.max(1, diffDays + 1));
}

export async function getActiveEnrollment(userId: string): Promise<ProgramEnrollment | null> {
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("id, user_id, program_length_days, started_at, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load enrollment", error);
    return null;
  }
  return data;
}

export async function startEnrollment(
  userId: string,
  programLengthDays: number
): Promise<{ enrollment: ProgramEnrollment | null; error: string | null }> {
  const { data, error } = await supabase
    .from("program_enrollments")
    .insert({ user_id: userId, program_length_days: programLengthDays })
    .select("id, user_id, program_length_days, started_at, status")
    .single();

  if (error) {
    return { enrollment: null, error: error.message };
  }
  return { enrollment: data, error: null };
}

export async function getDayProgress(enrollmentId: string, dayNumber: number): Promise<DayProgressRow | null> {
  const { data, error } = await supabase
    .from("day_progress")
    .select("id, enrollment_id, day_number, video_watched, habit_completed, checkin_note, completed_at")
    .eq("enrollment_id", enrollmentId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) {
    console.error("Failed to load day progress", error);
    return null;
  }
  return data;
}

export async function saveDayProgress(
  enrollmentId: string,
  dayNumber: number,
  fields: { videoWatched: boolean; habitCompleted: boolean; checkinNote: string }
): Promise<{ error: string | null }> {
  const bothDone = fields.videoWatched && fields.habitCompleted;
  const { error } = await supabase.from("day_progress").upsert(
    {
      enrollment_id: enrollmentId,
      day_number: dayNumber,
      video_watched: fields.videoWatched,
      habit_completed: fields.habitCompleted,
      checkin_note: fields.checkinNote || null,
      completed_at: bothDone ? new Date().toISOString() : null,
    },
    { onConflict: "enrollment_id,day_number" }
  );
  return { error: error?.message ?? null };
}

// Consecutive days of habit_completed=true, walking backward from
// (currentDay - 1) plus today if already completed. A simple, honest
// streak definition — no partial-day or grace-period rules yet.
export async function computeHabitStreak(enrollmentId: string, currentDay: number): Promise<number> {
  const { data, error } = await supabase
    .from("day_progress")
    .select("day_number, habit_completed")
    .eq("enrollment_id", enrollmentId)
    .lte("day_number", currentDay)
    .order("day_number", { ascending: false });

  if (error || !data) return 0;

  const completedByDay = new Map(data.map((row) => [row.day_number, row.habit_completed]));
  let streak = 0;
  for (let day = currentDay; day >= 1; day--) {
    if (completedByDay.get(day)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
