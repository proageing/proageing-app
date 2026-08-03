"use client";

import Image from "next/image";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { stepsForLocale } from "@/lib/sevenSteps";

// Same card design as proageing.org's own article list — photo, step
// eyebrow, serif title, one-line meta — but tapping opens the step
// in-app instead of linking out.
export function SevenStepsSection() {
  const { locale, t } = useLocale();

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{t.dashboard.sevenSteps.eyebrow}</p>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{t.dashboard.sevenSteps.blurb}</p>

      <div className="mt-4 flex flex-col gap-3">
        {stepsForLocale(locale).map((step) => (
          <Link
            key={step.step}
            href={`/steps/${step.step}`}
            className="overflow-hidden rounded-[14px] border-[1.5px] border-border bg-white shadow-sm transition hover:border-primary dark:border-border-dark dark:bg-white/5"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image src={step.photo} alt="" fill className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">
                {t.dashboard.sevenSteps.stepLabel(step.step, step.tagline)}
              </p>
              <h3 className="mt-1 font-serif text-base font-semibold leading-snug text-ink dark:text-ink-dark">{step.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-ink-soft dark:text-ink-dark-soft">{step.why}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
