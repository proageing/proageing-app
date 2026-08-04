import { supabase } from "@/lib/supabase";

// ProAge Momentum — a simple weekly completion count, not a separate
// self-report. It's exactly "did you do today's action", tallied across
// the programme's fixed 7-day weeks (Days 1-7, 8-14, 15-21) and reset each
// week, so a bad Week 1 doesn't punish the rest of the programme. See
// docs/PROAGE_SCORE_SPEC.md §3 for why this replaced a 5-category weighted
// score: the categories didn't appear evenly across weeks, and for a
// senior audience "did you show up today" is both simpler to read and
// still the behaviour-change mechanism that matters (Lally et al., 2010 —
// habit automaticity comes from consistent repetition, not from which
// specific action was repeated).

export type DayDotStatus = "done" | "today" | "missed" | "future";

export interface WeekDot {
  dayNumber: number;
  status: DayDotStatus;
}

export interface WeeklyMomentum {
  weekNumber: number;
  startDay: number;
  endDay: number;
  completedCount: number;
  totalCount: number;
  dots: WeekDot[];
}

export function weekForDay(day: number): number {
  return Math.ceil(day / 7);
}

export function weekRange(weekNumber: number): [number, number] {
  const start = (weekNumber - 1) * 7 + 1;
  return [start, start + 6];
}

interface DayCompletion {
  day_number: number;
  habit_completed: boolean;
}

// weekOfDay picks which week's dots to show (the viewed day); currentDay
// (today's actual programme day) decides which dots are "today",
// "missed", or "future" — so browsing back to a finished week shows it as
// entirely done/missed, never "future", regardless of which day someone
// is currently looking at.
export function computeWeeklyMomentum(weekOfDay: number, currentDay: number, rows: DayCompletion[]): WeeklyMomentum {
  const weekNumber = weekForDay(weekOfDay);
  const [startDay, endDay] = weekRange(weekNumber);
  const completedByDay = new Map(rows.map((r) => [r.day_number, r.habit_completed]));

  const dots: WeekDot[] = [];
  let completedCount = 0;
  for (let day = startDay; day <= endDay; day++) {
    const done = completedByDay.get(day) === true;
    if (done) completedCount++;
    const status: DayDotStatus = done ? "done" : day === currentDay ? "today" : day < currentDay ? "missed" : "future";
    dots.push({ dayNumber: day, status });
  }

  return { weekNumber, startDay, endDay, completedCount, totalCount: endDay - startDay + 1, dots };
}

export async function getDayCompletions(enrollmentId: string): Promise<DayCompletion[]> {
  const { data, error } = await supabase.from("day_progress").select("day_number, habit_completed").eq("enrollment_id", enrollmentId);
  if (error || !data) return [];
  return data;
}
