import type { ReadingsTier } from "@/lib/assessments/readingsTier";

// null = completed but predates status being stored on the row — shown
// as a neutral "done" mark rather than guessing at good or bad.
const TIER_COLOR: Record<ReadingsTier | "unrated", string> = {
  good: "text-junebud",
  watch: "text-amber-500",
  attention: "text-red-500",
  unrated: "text-ink-faint dark:text-ink-dark-faint",
};

export function ReadingsStatusIcon({ tier }: { tier: ReadingsTier | null }) {
  const key = tier ?? "unrated";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`shrink-0 ${TIER_COLOR[key]}`} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      {key === "good" || key === "unrated" ? (
        <path d="M7.5 12.5l2.8 2.8L16.5 9" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <rect x="10.7" y="6.5" width="2.6" height="7" rx="1.3" fill="white" />
          <circle cx="12" cy="16.5" r="1.4" fill="white" />
        </>
      )}
    </svg>
  );
}
