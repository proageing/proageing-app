import type { AssessmentType } from "@/lib/importHistory";
import type { Dictionary } from "@/lib/i18n/en";

// mL/kg/min and bpm are left as literal units in both locales, matching
// the convention already used on the VO2max check's own results screen
// (lib/i18n/zh.ts assess.vo2max.estimatedVo2/restingHrShort) -- only the
// words around the numbers are translated.
export function formatEntryData(type: AssessmentType, entryData: Record<string, unknown>, t: Dictionary): string {
  if (type === "family-history") {
    const flagged = entryData.elevated_count;
    return typeof flagged === "number" ? t.readings.areasFlagged(flagged) : "—";
  }
  if (type === "vo2max") {
    const score = typeof entryData.score === "number" ? `${entryData.score} mL/kg/min` : "—";
    const rhr = typeof entryData.rhr === "number" ? `${entryData.rhr} bpm ${t.readings.rhrSuffix}` : null;
    return rhr ? `${score} · ${rhr}` : score;
  }
  return typeof entryData.score === "number" ? String(entryData.score) : "—";
}

export function greetingNameFromEmail(email: string | null | undefined): string {
  if (!email) return "there";
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}
