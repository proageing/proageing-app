import Link from "next/link";

// Solid, filled, curved-edge icons per ProAge's Brand Identity guide —
// see components/TabBar.tsx for the same treatment and rationale.

function DashboardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="4" fill="currentColor" fillOpacity="0.25" />
      <path
        d="M8 12.5l2.6 2.6L16.5 9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ChallengeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="16" rx="3.5" fill="currentColor" fillOpacity="0.25" />
      <path d="M3.5 8h17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="7.5" y="12" width="5" height="5" rx="1.4" fill="currentColor" />
    </svg>
  );
}

function TrendsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.25" />
      <path
        d="M7 15l3.2-4 2.6 2.4L17 8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="17" cy="8.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="4" y="10" width="16" height="10" rx="3" fill="currentColor" fillOpacity="0.7" />
    </svg>
  );
}

export function HomeCards({ completedCount, totalCount }: { completedCount: number; totalCount: number }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Link
        href="#checks-list"
        className="flex flex-col justify-between rounded-2xl bg-primary p-4 text-white shadow-sm transition hover:brightness-105"
        style={{ minHeight: "128px" }}
      >
        <DashboardIcon />
        <div>
          <p className="font-serif text-base font-semibold leading-tight">My Longevity Dashboard</p>
          <p className="mt-1 text-xs font-medium text-white/85">
            {completedCount} of {totalCount} checks
          </p>
        </div>
      </Link>

      <Link
        href="/program"
        className="flex flex-col justify-between rounded-2xl bg-movement p-4 text-white shadow-sm transition hover:brightness-105"
        style={{ minHeight: "128px" }}
      >
        <ChallengeIcon />
        <div>
          <p className="font-serif text-base font-semibold leading-tight">21-Day Challenge</p>
          <p className="mt-1 text-xs font-medium text-white/85">Daily plan &amp; streaks</p>
        </div>
      </Link>

      <Link
        href="/dashboard/trends"
        className="flex flex-col justify-between rounded-2xl bg-sleep p-4 text-white shadow-sm transition hover:brightness-105"
        style={{ minHeight: "128px" }}
      >
        <TrendsIcon />
        <div>
          <p className="font-serif text-base font-semibold leading-tight">Your Trends</p>
          <p className="mt-1 text-xs font-medium text-white/85">See how you're changing</p>
        </div>
      </Link>

      <Link
        href="/upgrade"
        className="flex flex-col justify-between rounded-2xl border border-border bg-border/30 p-4 text-ink-soft shadow-sm transition hover:bg-border/50 dark:border-border-dark dark:bg-white/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
        style={{ minHeight: "128px" }}
      >
        <LockIcon />
        <div>
          <p className="font-serif text-base font-semibold leading-tight">90-Day Transformation</p>
          <p className="mt-1 text-xs font-medium opacity-80">See pricing &amp; details</p>
        </div>
      </Link>
    </div>
  );
}
