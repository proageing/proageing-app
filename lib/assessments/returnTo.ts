// Assessment pages are entered from a few different places — the
// Longevity Dashboard (readings list), the 21-Day Challenge, or a direct
// link — and should hand the user back to wherever they came from rather
// than always dropping them on the main dashboard.
export type ReturnSource = "program" | "readings";

export function returnPathFrom(from: string | null, day?: string | null): string {
  if (from === "program") return day ? `/program?day=${day}` : "/program";
  if (from === "readings") return "/dashboard/readings";
  return "/dashboard";
}

export function returnLabelFrom(from: string | null): string {
  if (from === "program") return "the 21-Day Challenge";
  if (from === "readings") return "your readings";
  return "dashboard";
}
