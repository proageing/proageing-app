"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Solid, filled, curved-edge icons per ProAge's Brand Identity guide
// ("Icon choices must resemble and compliment the Title Font... with fill
// and curved edges. Thin, outlined icons are discouraged.") — built from
// currentColor fills at two opacities rather than strokes, so they stay
// single-color-safe (recolors cleanly with active/inactive tab state).

function ChecksIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="4" fill="currentColor" fillOpacity="0.18" />
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

function ProgrammeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="16" rx="3.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M3.5 8h17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="7.5" y="12" width="5" height="5" rx="1.4" fill="currentColor" />
    </svg>
  );
}

function PlansIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z" fill="currentColor" fillOpacity="0.18" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </svg>
  );
}

const TABS = [
  { href: "/dashboard", label: "Checks", Icon: ChecksIcon },
  { href: "/program", label: "Programme", Icon: ProgrammeIcon },
  { href: "/upgrade", label: "Plans", Icon: PlansIcon },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white dark:border-border-dark dark:bg-white/5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-2xl">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition ${
                active ? "text-primary" : "text-ink-faint dark:text-ink-dark-faint"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
