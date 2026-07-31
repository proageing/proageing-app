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
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
      {section && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{section}</p>
      )}
      <p className="text-sm font-semibold text-ink dark:text-ink-dark">{question}</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-1 py-2.5 text-center text-xs font-semibold leading-tight transition ${
              value === opt.value ? style.selected : `border-border text-ink-soft dark:border-border-dark dark:text-ink-dark-soft`
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
