import type { AssessmentType } from "@/lib/importHistory";

export function formatEntryData(type: AssessmentType, entryData: Record<string, unknown>): string {
  if (type === "family-history") {
    const flagged = entryData.elevated_count;
    return typeof flagged === "number" ? `${flagged} area${flagged === 1 ? "" : "s"} flagged` : "—";
  }
  if (type === "vo2max") {
    const score = typeof entryData.score === "number" ? `${entryData.score} mL/kg/min` : "—";
    const rhr = typeof entryData.rhr === "number" ? `${entryData.rhr} bpm RHR` : null;
    return rhr ? `${score} · ${rhr}` : score;
  }
  return typeof entryData.score === "number" ? String(entryData.score) : "—";
}

export function greetingNameFromEmail(email: string | null | undefined): string {
  if (!email) return "there";
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}
