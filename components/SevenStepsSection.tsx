import Link from "next/link";
import { SEVEN_STEPS } from "@/lib/sevenSteps";
import { ASSESSMENT_TYPES } from "@/lib/assessmentTypes";
import { PILLAR_STYLES } from "@/lib/pillarStyles";

// Replaces the article teasers with the framework itself — same "Why it
// matters" copy as proageing.org/7-steps.html, but the call to action
// points at the native in-app check instead of the site's legacy version.
export function SevenStepsSection() {
  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">The 7 ProAgeing Steps</p>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">The science-backed framework behind every check in this app.</p>

      <div className="mt-4 flex flex-col gap-3">
        {SEVEN_STEPS.map((step) => {
          const pillar = PILLAR_STYLES[step.pillarColor];
          return (
            <div key={step.step} className={`rounded-[14px] border-[1.5px] p-4 ${pillar.card}`}>
              <p className={`text-[0.7rem] font-bold uppercase tracking-[0.08em] ${pillar.eyebrow}`}>
                Step {step.step} · {step.tagline}
              </p>
              <h3 className="mt-1 font-serif text-base font-semibold leading-snug text-ink dark:text-ink-dark">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft dark:text-ink-dark-soft">{step.why}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {step.assessments.map((a) => {
                  const meta = ASSESSMENT_TYPES.find((x) => x.type === a.type);
                  if (!meta?.href) return null;
                  return (
                    <Link
                      key={a.type}
                      href={meta.href}
                      className="rounded-full border-[1.5px] border-primary bg-white px-3 py-1 text-xs font-bold text-primary-dark transition hover:bg-primary-light dark:bg-transparent dark:hover:bg-primary-light-dark"
                    >
                      Take the {a.label} check →
                    </Link>
                  );
                })}
              </div>

              <a
                href={step.learnMoreHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-ink-faint underline dark:text-ink-dark-faint"
              >
                Read more on proageing.org
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
