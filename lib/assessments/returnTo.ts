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

// Returns a dictionary key rather than a label, so the wording lives with
// the rest of the copy and gets translated with it.
export type ReturnLabelKey = "program" | "readings" | "dashboard";

export function returnLabelKeyFrom(from: string | null): ReturnLabelKey {
  if (from === "program") return "program";
  if (from === "readings") return "readings";
  return "dashboard";
}
