"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AppHeader({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Logo size={32} />
        <span className="font-serif text-lg font-semibold text-ink dark:text-ink-dark">ProAge</span>
      </Link>
      {onSignOut && (
        <button onClick={onSignOut} className="text-sm text-ink-faint underline dark:text-ink-dark-faint">
          Sign out
        </button>
      )}
    </div>
  );
}
