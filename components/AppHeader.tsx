"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

// Sign out lives on /account now, not scattered per-page — this icon is
// the one consistent entry point, present everywhere AppHeader is.
function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.5" fill="currentColor" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function AppHeader() {
  return (
    <div className="flex items-center justify-between">
      <Link href="/dashboard">
        <Logo size={64} />
      </Link>
      <Link
        href="/account"
        aria-label="Account"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary-light text-primary-dark transition hover:border-primary dark:bg-primary-light-dark"
      >
        <AccountIcon />
      </Link>
    </div>
  );
}
