"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AppHeader({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <Link href="/dashboard">
        <Logo size={64} />
      </Link>
      {onSignOut && (
        <button onClick={onSignOut} className="text-sm text-ink-faint underline dark:text-ink-dark-faint">
          Sign out
        </button>
      )}
    </div>
  );
}
