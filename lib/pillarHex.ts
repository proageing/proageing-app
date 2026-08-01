import type { PillarColor } from "./assessmentTypes";

// Literal hex twins of tailwind.config.ts's pillar palette, for contexts
// that can't consume Tailwind classes — SVG fill/stroke attributes.
export const PILLAR_HEX: Record<PillarColor, { main: string; tint: string }> = {
  primary: { main: "#a84e00", tint: "#ffefd6" },
  purpose: { main: "#8b5a83", tint: "#f1e4ee" },
  healthrisk: { main: "#7a4e0e", tint: "#f6e9d2" },
  movement: { main: "#1e4666", tint: "#e4edf5" },
  strength: { main: "#3d4a56", tint: "#e7ebee" },
  nutrition: { main: "#4f5c38", tint: "#e9eddd" },
  sleep: { main: "#5b5bd6", tint: "#e8e8fb" },
  connection: { main: "#7a3b4e", tint: "#f5e3e8" },
  cognitive: { main: "#5c7a1e", tint: "#eff7dd" },
};
