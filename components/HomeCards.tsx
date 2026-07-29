import Link from "next/link";

function DashboardIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function ChallengeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}

function TrendsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
