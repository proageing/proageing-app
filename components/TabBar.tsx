"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/context";

// Solid, filled, curved-edge icons per ProAge's Brand Identity guide
// ("Icon choices must resemble and compliment the Title Font... with fill
// and curved edges. Thin, outlined icons are discouraged.") — built from
// currentColor fills at two opacities rather than strokes, so they stay
// single-color-safe (recolors cleanly with active/inactive tab state).

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2.8 2.8 10.2V18.6c0 1.55 1.25 2.8 2.8 2.8h12.8c1.55 0 2.8-1.25 2.8-2.8V10.2z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <rect x="9.4" y="13.8" width="5.2" height="7.6" rx="1.6" fill="currentColor" />
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
  { href: "/dashboard", key: "home", Icon: HomeIcon },
  { href: "/program", key: "programme", Icon: ProgrammeIcon },
  { href: "/upgrade", key: "plans", Icon: PlansIcon },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white dark:border-border-dark dark:bg-white/5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-2xl">
        {TABS.map(({ href, key, Icon }) => {
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
              {t.tabs[key]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
