"use client";

import { useState } from "react";
import { Illustration } from "./Illustration";
import { useT } from "@/lib/i18n/context";
import type { HowToSlug } from "@/lib/howTo";

// One collapsible set of instructions on the Act card.
//
// Built to docs/AGE_FRIENDLY_UI.md: the toggle is a full-width 56px button
// that says what it does in words, not a chevron someone has to hit. The
// first version of this leant on a 12px arrow and was, correctly, called
// ridiculous — the row was tappable but nothing about it looked it.
//
// Open by default only for the first technique of a day, and only the first
// day it is asked for: someone meeting the chair squat gets the full form
// cues without going looking, while someone on their fourth strength snack
// isn't made to scroll past them again to reach the tick box.
export function HowToPanel({ slug, defaultOpen = false }: { slug: HowToSlug; defaultOpen?: boolean }) {
  const t = useT();
  const c = t.howTo;
  const content = c[slug];
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border-2 border-primary/40 bg-paper dark:border-primary/30 dark:bg-black/15">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[56px] w-full items-center gap-3 bg-primary-light px-4 py-3 text-left transition hover:brightness-95 dark:bg-primary-light-dark"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-dark text-lg font-bold leading-none text-white"
        >
          {open ? "−" : "+"}
        </span>
        <span className="flex-1 text-base font-bold text-primary-dark">
          {open ? c.hide : c.show}
          <span className="block text-base font-semibold text-ink-soft dark:text-ink-dark-soft">{content.name}</span>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3">
          <Illustration slug={slug} />

          <p className="mb-3 text-base text-ink-soft dark:text-ink-dark-soft">{content.whatIs}</p>

          <ol className="list-decimal space-y-2.5 pl-6 marker:font-bold marker:text-primary-dark">
            {content.steps.map((step) => (
              <li key={step} className="pl-1 text-base leading-relaxed text-ink dark:text-ink-dark">
                {step}
              </li>
            ))}
          </ol>

          {"portions" in content && Array.isArray(content.portions) && (
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border dark:divide-border-dark dark:border-border-dark">
              {content.portions.map((row: { food: string; protein: string }) => (
                <li key={row.food} className="flex items-center justify-between gap-3 px-3 py-3">
                  <span className="text-base text-ink dark:text-ink-dark">{row.food}</span>
                  <span className="shrink-0 rounded-full bg-nutrition-tint px-3 py-1 text-base font-bold tabular-nums text-nutrition-dark dark:bg-nutrition-dark/30 dark:text-nutrition-tint">
                    {row.protein}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {"easier" in content && content.easier && (
            <p className="mt-4 rounded-xl bg-nutrition-tint px-4 py-3 text-base text-nutrition-dark dark:bg-nutrition-dark/25 dark:text-nutrition-tint">
              <span className="font-bold">{c.easierLabel}:</span> {content.easier}
            </p>
          )}

          {"stopIf" in content && content.stopIf && (
            <p className="mt-3 rounded-xl bg-coral-tint px-4 py-3 text-base text-coral dark:bg-coral-tint-dark dark:text-coral-dark">
              <span className="font-bold">{c.stopIfLabel}</span> {content.stopIf}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
