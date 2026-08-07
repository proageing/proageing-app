"use client";

import { useState } from "react";
import { Illustration } from "./Illustration";
import { useT } from "@/lib/i18n/context";
import type { HowToSlug } from "@/lib/howTo";

// One collapsible set of instructions on the Act card.
//
// Open by default only for the first technique of a day, and only the first
// day it is asked for: someone meeting the chair squat gets the full form
// cues without having to go looking, while someone on their fourth strength
// snack is not made to scroll past them again to reach the tick box. Day 4
// offers three moves and its copy says "pick one to start", so the other two
// stay folded rather than turning the card into a manual.
export function HowToPanel({ slug, defaultOpen = false }: { slug: HowToSlug; defaultOpen?: boolean }) {
  const t = useT();
  const c = t.howTo;
  const content = c[slug];
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-paper dark:border-border-dark dark:bg-black/15">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-primary-dark"
      >
        <span>
          {c.show} — {content.name}
        </span>
        <span aria-hidden className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <Illustration slug={slug} />

          <p className="mb-3 text-sm text-ink-soft dark:text-ink-dark-soft">{content.whatIs}</p>

          <ol className="list-decimal space-y-1.5 pl-5">
            {content.steps.map((step) => (
              <li key={step} className="text-sm text-ink dark:text-ink-dark">
                {step}
              </li>
            ))}
          </ol>

          {"easier" in content && content.easier && (
            <p className="mt-3 rounded-lg bg-nutrition-tint px-3 py-2 text-xs text-nutrition-dark dark:bg-nutrition-dark/25 dark:text-nutrition-tint">
              <span className="font-bold">{c.easierLabel}:</span> {content.easier}
            </p>
          )}

          {"stopIf" in content && content.stopIf && (
            <p className="mt-2 rounded-lg bg-coral-tint px-3 py-2 text-xs text-coral dark:bg-coral-tint-dark dark:text-coral-dark">
              <span className="font-bold">{c.stopIfLabel}</span> {content.stopIf}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
