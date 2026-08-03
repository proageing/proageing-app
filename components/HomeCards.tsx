"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

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

export function HomeCards({ completedCount, totalCount }: { completedCount: number; totalCount: number }) {
  const t = useT();

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Link
        href="/dashboard/readings"
        className="flex flex-col justify-between rounded-2xl bg-primary p-4 text-white shadow-sm transition hover:brightness-105"
        style={{ minHeight: "128px" }}
      >
        <DashboardIcon />
        <div>
          <p className="font-serif text-base font-semibold leading-tight">{t.dashboard.cards.checks}</p>
          <p className="mt-1 text-xs font-medium text-white/85">
            {t.dashboard.cards.checksProgress(completedCount, totalCount)}
          </p>
        </div>
      </Link>

      <Link
        href="/program"
        className="flex flex-col justify-between rounded-2xl bg-ink p-4 text-white shadow-sm transition hover:brightness-110"
        style={{ minHeight: "128px" }}
      >
        <ChallengeIcon />
        <div>
          <p className="font-serif text-base font-semibold leading-tight">{t.dashboard.cards.challenge}</p>
          <p className="mt-1 text-xs font-medium opacity-85">{t.dashboard.cards.challengeBlurb}</p>
        </div>
      </Link>
    </div>
  );
}
