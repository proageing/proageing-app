import type { AssessmentType } from "@/lib/importHistory";
import type { PillarColor } from "@/lib/assessmentTypes";
import { interpretIkigaiScore } from "./purpose";
import { interpretSLASScore } from "./cognitiveDecline";
import { interpretProteinScore } from "./nutritionProtein";
import { interpretPSQI } from "./sleepQuality";
import { interpretLonelinessScore } from "./connection";

export interface TrendMetric {
  key: string; // field name in entry_data
  label: string;
  unit?: string;
  higherIsBetter: boolean;
  pillarColor: PillarColor;
  // Only defined where the score alone (no extra biometrics like sex/age)
  // is enough to classify a past reading — sit-to-stand and balance need
  // sex/age we don't persist per entry, so those are left uncategorized
  // rather than guessed.
  statusLabel?: (value: number) => string;
}

export const TREND_METRICS: Record<AssessmentType, TrendMetric[]> = {
  purpose: [
    { key: "score", label: "Ikigai score", unit: "out of 45", higherIsBetter: true, pillarColor: "purpose", statusLabel: (v) => interpretIkigaiScore(v).label },
  ],
  "family-history": [{ key: "elevated_count", label: "Areas flagged", unit: "out of 4", higherIsBetter: false, pillarColor: "healthrisk" }],
  "cognitive-decline": [
    { key: "score", label: "Risk index", unit: "out of 13", higherIsBetter: false, pillarColor: "cognitive", statusLabel: (v) => interpretSLASScore(v).label },
  ],
  vo2max: [
    { key: "score", label: "VO2 max", unit: "mL/kg/min", higherIsBetter: true, pillarColor: "movement" },
    { key: "rhr", label: "Resting HR", unit: "bpm", higherIsBetter: false, pillarColor: "primary" },
  ],
  "sit-to-stand": [{ key: "score", label: "Full stands", unit: "in 30s", higherIsBetter: true, pillarColor: "primary" }],
  balance: [{ key: "score", label: "Time balanced", unit: "seconds", higherIsBetter: true, pillarColor: "strength" }],
  "nutrition-protein": [
    { key: "score", label: "Protein frequency", unit: "out of 32", higherIsBetter: true, pillarColor: "nutrition", statusLabel: (v) => interpretProteinScore(v).label },
  ],
  "sleep-quality": [
    { key: "score", label: "PSQI score", unit: "out of 21", higherIsBetter: false, pillarColor: "sleep", statusLabel: (v) => interpretPSQI(v).label },
  ],
  connection: [
    { key: "score", label: "Loneliness score", unit: "out of 9", higherIsBetter: false, pillarColor: "connection", statusLabel: (v) => interpretLonelinessScore(v).label },
  ],
};
