import { supabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { contentForDay } from "@/lib/program21";
import { formatEntryData } from "@/lib/formatResult";
import { readingsTierFor, type ReadingsTier } from "@/lib/assessments/readingsTier";
import type { AssessmentType } from "@/lib/importHistory";

// Which direction a check moved between the user's first ever result and
// their day-21 retake. Deliberately derived from the interpreted tier, not
// from the raw number — the numbers run in opposite directions across
// checks (more sit-to-stand reps is better, a lower PSQI score is better),
// and the tier already encodes that per type.
export type MovementDirection = "better" | "held" | "lower" | "unrated" | "first-time";

export interface CheckMovement {
  type: AssessmentType;
  title: string;
  firstLabel: string | null; // null when there's only one result — nothing to compare against
  latestLabel: string;
  direction: MovementDirection;
}

export interface CompletionSummary {
  daysCompleted: number;
  bestStreak: number;
  keystoneHabit: string | null;
  finishedOn: string | null;
  movements: CheckMovement[];
}

interface ResultRow {
  assessment_type: AssessmentType;
  entry_data: Record<string, unknown>;
  created_at: string;
}

const TIER_RANK: Record<ReadingsTier, number> = { attention: 1, watch: 2, good: 3 };

function directionFor(first: ReadingsTier | null, latest: ReadingsTier | null): MovementDirection {
  if (!first || !latest) return "unrated";
  const delta = TIER_RANK[latest] - TIER_RANK[first];
  if (delta > 0) return "better";
  if (delta < 0) return "lower";
  return "held";
}

// The checks day 21 asks the user to retake, read straight off the day's
// own content so the two can't drift apart.
function retakeTypes(programLengthDays: number): AssessmentType[] {
  const close = contentForDay(programLengthDays);
  if (!close.assessments) return [];
  return close.assessments.map((a) => a.href.split("/").pop() as AssessmentType);
}

// Longest run of consecutive completed days anywhere in the programme —
// distinct from computeHabitStreak, which is the run ending today. Once
// the programme is over, the best run is the more meaningful number.
export function bestStreakFrom(completedDays: Set<number>, programLengthDays: number): number {
  let best = 0;
  let run = 0;
  for (let day = 1; day <= programLengthDays; day++) {
    run = completedDays.has(day) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

export async function getCompletionSummary(
  userId: string,
  enrollmentId: string,
  programLengthDays: number
): Promise<CompletionSummary> {
  const [progressRes, resultsRes] = await Promise.all([
    supabase
      .from("day_progress")
      .select("day_number, habit_completed, checkin_note, completed_at")
      .eq("enrollment_id", enrollmentId),
    supabase
      .from("assessment_results")
      .select("assessment_type, entry_data, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .returns<ResultRow[]>(),
  ]);

  const progress = progressRes.data ?? [];
  const completedDays = new Set(progress.filter((p) => p.habit_completed).map((p) => p.day_number));
  const closeDay = progress.find((p) => p.day_number === programLengthDays);

  // Rows arrive oldest-first, so the first seen per type is the baseline
  // and the last seen is the retake.
  const byType = new Map<AssessmentType, ResultRow[]>();
  for (const row of resultsRes.data ?? []) {
    const rows = byType.get(row.assessment_type) ?? [];
    rows.push(row);
    byType.set(row.assessment_type, rows);
  }

  const titleByType = new Map(ASSESSMENT_TYPES.map((a) => [a.type, a.title]));

  const movements: CheckMovement[] = [];
  for (const type of retakeTypes(programLengthDays)) {
    const rows = byType.get(type);
    if (!rows || rows.length === 0) continue;

    const first = rows[0];
    const latest = rows[rows.length - 1];
    const onlyOne = rows.length < 2;

    movements.push({
      type,
      title: titleByType.get(type) ?? type,
      firstLabel: onlyOne ? null : formatEntryData(type, first.entry_data),
      latestLabel: formatEntryData(type, latest.entry_data),
      direction: onlyOne
        ? "first-time"
        : directionFor(readingsTierFor(type, first.entry_data), readingsTierFor(type, latest.entry_data)),
    });
  }

  return {
    daysCompleted: completedDays.size,
    bestStreak: bestStreakFrom(completedDays, programLengthDays),
    keystoneHabit: closeDay?.checkin_note?.trim() || null,
    finishedOn: closeDay?.completed_at ?? null,
    movements,
  };
}
