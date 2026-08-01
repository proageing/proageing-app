import type { AssessmentType } from "@/lib/importHistory";

export type ReadingsTier = "good" | "watch" | "attention";

// Every check already classifies its own result (see each
// lib/assessments/*.ts interpret function) — this just maps that
// check-specific vocabulary onto one shared 3-tier signal for the small
// dot on the Longevity Readings grid. It's a glance, not a new judgement:
// the full label and explanation still live on the check's own trend page.
// Returns null when the saved row predates status being stored, or when
// the row genuinely has nothing to classify (e.g. an unanswered check).
export function readingsTierFor(type: AssessmentType, entryData: Record<string, unknown>): ReadingsTier | null {
  const status = typeof entryData.status === "string" ? entryData.status : null;

  switch (type) {
    case "purpose":
      if (status === "high") return "good";
      if (status === "mid") return "watch";
      if (status === "low") return "attention";
      return null;

    case "cognitive-decline":
    case "connection":
    case "nutrition-protein":
      if (status === "good") return "good";
      if (status === "watch") return "watch";
      if (status === "elevated") return "attention";
      return null;

    case "sleep-quality":
      if (status === "good") return "good";
      if (status === "poor") return "attention";
      return null;

    case "balance":
    case "sit-to-stand":
      if (status === "typical" || status === "within" || status === "above") return "good";
      if (status === "below") return "attention";
      return null;

    case "vo2max":
      if (status === "poor") return "attention";
      if (status === "fair") return "watch";
      if (status === "average" || status === "good" || status === "excellent" || status === "superior") return "good";
      return null;

    case "family-history": {
      const earlyOnset = typeof entryData.early_onset_count === "number" ? entryData.early_onset_count : 0;
      const flagged = typeof entryData.elevated_count === "number" ? entryData.elevated_count : 0;
      if (earlyOnset > 0) return "attention";
      if (flagged > 0) return "watch";
      return "good";
    }

    default:
      return null;
  }
}
