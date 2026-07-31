import type { PillarStyle } from "@/lib/pillarStyles";

interface Option {
  value: number;
  label: string;
}

// Matches proageing.org's .item-card / .pill-row pattern exactly (bordered
// card per question, fixed 3-column grid of pill buttons) so the app and
// the site read as the same product, not two different UIs.
export function LikertQuestionCard({
  question,
  section,
  options,
  value,
  onChange,
  style,
}: {
  question: string;
  section?: string;
  options: Option[];
  value: number | null;
  onChange: (v: number) => void;
  style: PillarStyle;
}) {
  return (
    <div className="rounded-[14px] border-[1.5px] border-border bg-white p-4 dark:border-border-dark dark:bg-white/5">
      {section && (
        <p className={`mb-1 text-[0.74rem] font-bold uppercase tracking-[0.13em] ${style.eyebrow}`}>{section}</p>
      )}
      <p className="mb-2.5 text-base font-semibold leading-snug text-ink dark:text-ink-dark">{question}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border-[1.5px] px-1 py-2.5 text-center text-[0.72rem] font-bold leading-tight transition ${
              value === opt.value
                ? style.selected
                : "border-border bg-paper text-ink-soft dark:border-border-dark dark:bg-paper-dark dark:text-ink-dark-soft"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
