import type { PillarStyle } from "@/lib/pillarStyles";

// Matches proageing.org's assessment top bar exactly: Exit link, a row of
// progress dots for the page's screen order, an Audio toggle in the pillar
// color, and the small centered wordmark below.
export function AssessmentTopBar({
  order,
  current,
  pillar,
  audioOn,
  onToggleAudio,
  onExit,
}: {
  order: string[];
  current: string;
  pillar: PillarStyle;
  audioOn: boolean;
  onToggleAudio: () => void;
  onExit: () => void;
}) {
  const idx = order.indexOf(current);

  return (
    <div className="mb-2 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-sm font-semibold text-ink-faint hover:text-ink-soft dark:text-ink-dark-faint dark:hover:text-ink-dark-soft"
        >
          ← Exit
        </button>
        {idx >= 0 && (
          <div className="flex gap-[7px]">
            {order.map((s, i) => (
              <span
                key={s}
                className={`h-[7px] w-[7px] rounded-full transition-transform ${
                  i === idx ? `${pillar.dot} scale-150` : i < idx ? pillar.dot : "bg-border dark:bg-border-dark"
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={onToggleAudio}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white ${pillar.solidButton}`}
        >
          {audioOn ? "🔊 Audio" : "🔇 Audio"}
        </button>
      </div>
      <div className="text-center font-serif text-[0.92rem] font-semibold italic -tracking-[0.01em]">
        <span className="text-ink dark:text-ink-dark">pro</span>
        <span className="text-primary-dark">age</span>
      </div>
    </div>
  );
}
