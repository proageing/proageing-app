"use client";

import { Logo } from "@/components/Logo";
import type { PillarStyle } from "@/lib/pillarStyles";

import { useT } from "@/lib/i18n/context";

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
  const t = useT();
  const idx = order.indexOf(current);

  return (
    <div className="mb-2 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="-ml-2 flex min-h-[56px] items-center px-2 text-base font-semibold text-ink-faint hover:text-ink-soft dark:text-ink-dark-faint dark:hover:text-ink-dark-soft"
        >
          {t.assess.common.exit}
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
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white ${pillar.solidButton}`}
        >
          {audioOn ? `🔊 ${t.assess.common.audio}` : `🔇 ${t.assess.common.audio}`}
        </button>
      </div>
      <div className="flex justify-center">
        <Logo size={32} />
      </div>
    </div>
  );
}
