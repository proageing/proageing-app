import type { Dictionary } from "@/lib/i18n/en";
import type { AssessmentType } from "@/lib/importHistory";

// Surfaces each check's own already-translated result label on the
// Longevity Readings grid -- the same words already shown on that check's
// own results screen (lib/i18n/en.ts assess.*.result), not new copy.
// family-history has no single status field (four independent category
// flags), so it derives from the same elevated/early-onset counts
// readingsTierFor() already uses for that check's tier.
export function insightFor(type: AssessmentType, entryData: Record<string, unknown>, t: Dictionary): string | null {
  const status = typeof entryData.status === "string" ? entryData.status : null;

  switch (type) {
    case "purpose":
      return status && status in t.assess.purpose.result
        ? t.assess.purpose.result[status as keyof typeof t.assess.purpose.result].label
        : null;
    case "cognitive-decline":
      return status && status in t.assess.cognitiveDecline.result
        ? t.assess.cognitiveDecline.result[status as keyof typeof t.assess.cognitiveDecline.result].label
        : null;
    case "nutrition-protein":
      return status && status in t.assess.nutritionProtein.result
        ? t.assess.nutritionProtein.result[status as keyof typeof t.assess.nutritionProtein.result].label
        : null;
    case "sleep-quality":
      return status && status in t.assess.sleepQuality.result
        ? t.assess.sleepQuality.result[status as keyof typeof t.assess.sleepQuality.result].label
        : null;
    case "connection":
      return status && status in t.assess.connection.result
        ? t.assess.connection.result[status as keyof typeof t.assess.connection.result].label
        : null;
    case "sit-to-stand":
      return status && status in t.assess.sitToStand.result
        ? t.assess.sitToStand.result[status as keyof typeof t.assess.sitToStand.result].label
        : null;
    case "balance":
      return status && status in t.assess.balance.result
        ? t.assess.balance.result[status as keyof typeof t.assess.balance.result].label
        : null;
    case "vo2max":
      // Saved status is the 6-way fitness category (poor..superior), not
      // the 3-way narrative result -- category is the matching lookup.
      return status && status in t.assess.vo2max.category
        ? t.assess.vo2max.category[status as keyof typeof t.assess.vo2max.category]
        : null;
    case "family-history": {
      const earlyOnset = typeof entryData.early_onset_count === "number" ? entryData.early_onset_count : 0;
      const flagged = typeof entryData.elevated_count === "number" ? entryData.elevated_count : 0;
      if (earlyOnset > 0) return t.assess.familyHistory.flags.elevated;
      if (flagged > 0) return t.assess.familyHistory.flags.present;
      return t.assess.familyHistory.flags.none;
    }
    default:
      return null;
  }
}
