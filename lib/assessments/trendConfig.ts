import type { AssessmentType } from "@/lib/importHistory";
import type { PillarColor } from "@/lib/assessmentTypes";
import { interpretIkigaiScore } from "./purpose";
import { interpretSLASScore } from "./cognitiveDecline";
import { interpretProteinScore } from "./nutritionProtein";
import { interpretPSQI } from "./sleepQuality";
import { interpretLonelinessScore } from "./connection";
import { interpretBalance, type Sex } from "./balance";
import { interpretSitToStand } from "./sitToStand";
import { classifyVO2 } from "./vo2max";

export interface TrendMetric {
  key: string; // field name in entry_data
  label: string;
  unit?: string;
  higherIsBetter: boolean;
  pillarColor: PillarColor;
  // Receives the whole entry_data, not just the score, because some
  // checks are scored against age- and sex-banded norms. Returns null
  // when a row can't be classified — results saved before age and sex
  // were persisted have no way to be interpreted, and a guessed band is
  // worse than none.
  statusLabel?: (entry: Record<string, unknown>) => string | null;
}

function num(entry: Record<string, unknown>, key: string): number | null {
  return typeof entry[key] === "number" ? (entry[key] as number) : null;
}

function sexOf(entry: Record<string, unknown>): Sex | null {
  return entry.sex === "m" || entry.sex === "f" ? entry.sex : null;
}

export const TREND_METRICS: Record<AssessmentType, TrendMetric[]> = {
  purpose: [
    { key: "score", label: "Ikigai score", unit: "out of 45", higherIsBetter: true, pillarColor: "purpose", statusLabel: (e) => { const v = num(e, "score"); return v === null ? null : interpretIkigaiScore(v).label; } },
  ],
  "family-history": [{ key: "elevated_count", label: "Areas flagged", unit: "out of 4", higherIsBetter: false, pillarColor: "healthrisk" }],
  "cognitive-decline": [
    { key: "score", label: "Risk index", unit: "out of 13", higherIsBetter: false, pillarColor: "cognitive", statusLabel: (e) => { const v = num(e, "score"); return v === null ? null : interpretSLASScore(v).label; } },
  ],
  vo2max: [
    {
      key: "score", label: "VO2 max", unit: "mL/kg/min", higherIsBetter: true, pillarColor: "movement",
      statusLabel: (e) => {
        const v = num(e, "score"), age = num(e, "age"), sex = sexOf(e);
        if (v === null || age === null || !sex) return null;
        return classifyVO2(v, sex, age).label;
      },
    },
    { key: "rhr", label: "Resting HR", unit: "bpm", higherIsBetter: false, pillarColor: "primary" },
  ],
  "sit-to-stand": [
    {
      key: "score", label: "Full stands", unit: "in 30s", higherIsBetter: true, pillarColor: "primary",
      statusLabel: (e) => {
        const v = num(e, "score"), age = num(e, "age"), sex = sexOf(e);
        if (v === null || age === null || !sex) return null;
        return interpretSitToStand(v, sex, age).label;
      },
    },
  ],
  balance: [
    {
      key: "score", label: "Time balanced", unit: "seconds", higherIsBetter: true, pillarColor: "strength",
      statusLabel: (e) => {
        const v = num(e, "score"), age = num(e, "age"), sex = sexOf(e);
        if (v === null || age === null || !sex) return null;
        return interpretBalance(v, sex, age).label;
      },
    },
  ],
  "nutrition-protein": [
    { key: "score", label: "Protein frequency", unit: "out of 32", higherIsBetter: true, pillarColor: "nutrition", statusLabel: (e) => { const v = num(e, "score"); return v === null ? null : interpretProteinScore(v).label; } },
  ],
  "sleep-quality": [
    { key: "score", label: "PSQI score", unit: "out of 21", higherIsBetter: false, pillarColor: "sleep", statusLabel: (e) => { const v = num(e, "score"); return v === null ? null : interpretPSQI(v).label; } },
  ],
  connection: [
    { key: "score", label: "Loneliness score", unit: "out of 9", higherIsBetter: false, pillarColor: "connection", statusLabel: (e) => { const v = num(e, "score"); return v === null ? null : interpretLonelinessScore(v).label; } },
  ],
};
