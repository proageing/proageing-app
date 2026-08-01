import { supabase } from "@/lib/supabase";

export type ImprovedMost = "energy" | "strength" | "sleep" | "confidence" | "motivation" | "other";

export const IMPROVED_MOST_OPTIONS: { value: ImprovedMost; label: string }[] = [
  { value: "energy", label: "Energy" },
  { value: "strength", label: "Strength" },
  { value: "sleep", label: "Sleep" },
  { value: "confidence", label: "Confidence" },
  { value: "motivation", label: "Motivation" },
  { value: "other", label: "Something else" },
];

export interface TestimonialFields {
  improvedMost: ImprovedMost | null;
  improvedMostOther: string;
  consentToShare: boolean | null;
  beforeConcern: string;
  changeNoticed: string;
  recommendation: string;
}

export function emptyTestimonial(): TestimonialFields {
  return {
    improvedMost: null,
    improvedMostOther: "",
    consentToShare: null,
    beforeConcern: "",
    changeNoticed: "",
    recommendation: "",
  };
}

export async function getTestimonial(enrollmentId: string, dayNumber: number): Promise<TestimonialFields | null> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("improved_most, improved_most_other, consent_to_share, before_concern, change_noticed, recommendation")
    .eq("enrollment_id", enrollmentId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) {
    console.error("Failed to load testimonial", error);
    return null;
  }
  if (!data) return null;

  return {
    improvedMost: data.improved_most,
    improvedMostOther: data.improved_most_other ?? "",
    consentToShare: data.consent_to_share,
    beforeConcern: data.before_concern ?? "",
    changeNoticed: data.change_noticed ?? "",
    recommendation: data.recommendation ?? "",
  };
}

export async function saveTestimonial(
  userId: string,
  enrollmentId: string,
  dayNumber: number,
  fields: TestimonialFields
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("testimonials").upsert(
    {
      user_id: userId,
      enrollment_id: enrollmentId,
      day_number: dayNumber,
      improved_most: fields.improvedMost,
      improved_most_other: fields.improvedMostOther || null,
      consent_to_share: fields.consentToShare,
      before_concern: fields.beforeConcern || null,
      change_noticed: fields.changeNoticed || null,
      recommendation: fields.recommendation || null,
    },
    { onConflict: "enrollment_id,day_number" }
  );
  return { error: error?.message ?? null };
}
