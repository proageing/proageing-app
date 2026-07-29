import { supabase } from "@/lib/supabase";
import type { AssessmentType } from "@/lib/importHistory";

export async function saveAssessmentResult(
  userId: string,
  assessmentType: AssessmentType,
  entryData: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("assessment_results").insert({
    user_id: userId,
    assessment_type: assessmentType,
    entry_data: entryData,
    source: "app",
  });
  return { error: error?.message ?? null };
}
