"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { stepByNumber } from "@/lib/sevenSteps";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { TabBar } from "@/components/TabBar";

// Reproduces proageing.org/7-steps.html's own per-step section styling
// as closely as the app's design system allows: same photo treatment
// (4:3, rounded-24, shadow-card), same orange step badge, same
// eyebrow/label/body type scale. Only the check links differ — native
// in-app assessment instead of the site's own legacy check page.
export default function StepDetailPage() {
  const router = useRouter();
  const params = useParams<{ step: string }>();
  const stepNumber = Number(params.step);
  const step = stepByNumber(stepNumber);

  if (!step) {
    return (
      <main className="mx-auto max-w-xl px-6 pb-28 pt-6">
        <p className="text-ink-soft dark:text-ink-dark-soft">Unknown step.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-primary-dark underline">
          ← Back to dashboard
        </Link>
        <TabBar />
      </main>
    );
  }

  const prev = stepByNumber(step.step - 1);
  const next = stepByNumber(step.step + 1);

  return (
    <main className="mx-auto max-w-xl px-6 pb-28 pt-6">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-ink-faint hover:text-ink-soft dark:text-ink-dark-faint dark:hover:text-ink-dark-soft"
      >
        ← Back
      </Link>

      <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-[24px] shadow-card">
        <Image src={step.photo} alt="" fill className="object-cover" priority />
      </div>

      <div
        className="mt-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary font-serif text-2xl font-semibold"
        style={{ color: "#2a1c00" }}
      >
        {step.step}
      </div>

      <h1 className="mt-4 font-serif text-[1.9rem] font-semibold leading-tight text-ink dark:text-ink-dark">{step.title}</h1>
      <p className="mt-1.5 text-[1.02rem] italic text-ink-soft dark:text-ink-dark-soft">{step.tagline}</p>

      <h2 className="mt-6 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary-dark">Why it matters</h2>
      <p className="mt-1.5 text-[1.02rem] leading-[1.7] text-ink-soft dark:text-ink-dark-soft">{step.why}</p>

      <h2 className="mt-5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary-dark">What the science shows</h2>
      <p className="mt-1.5 text-[1.02rem] leading-[1.7] text-ink-soft dark:text-ink-dark-soft">{step.science}</p>

      <h2 className="mt-5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary-dark">{step.listHeading}</h2>
      <ul className="mt-1.5 list-disc pl-5 text-ink-soft dark:text-ink-dark-soft">
        {step.listItems.map((item) => (
          <li key={item} className="mb-1.5 text-[1.02rem] leading-[1.6]">
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[1.02rem] leading-[1.7] text-ink-soft dark:text-ink-dark-soft">{step.closing}</p>

      <div className="mt-4 flex flex-col items-start gap-1.5">
        {step.assessments.map((a) => {
          const meta = ASSESSMENT_TYPES.find((x) => x.type === a.type);
          if (!meta?.href) return null;
          return (
            <Link
              key={a.type}
              href={meta.href}
              className="inline-flex items-center gap-1.5 text-[0.94rem] font-bold text-primary-dark transition hover:text-cognitive"
            >
              Take the {a.label} check →
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-4 dark:border-border-dark">
        {prev ? (
          <button onClick={() => router.push(`/steps/${prev.step}`)} className="text-sm font-semibold text-ink-soft hover:text-ink dark:text-ink-dark-soft dark:hover:text-ink-dark">
            ← Step {prev.step}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button onClick={() => router.push(`/steps/${next.step}`)} className="text-sm font-semibold text-ink-soft hover:text-ink dark:text-ink-dark-soft dark:hover:text-ink-dark">
            Step {next.step} →
          </button>
        ) : (
          <span />
        )}
      </div>

      <TabBar />
    </main>
  );
}
