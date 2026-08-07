"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { useT } from "@/lib/i18n/context";
import { computeTrainingZone } from "@/lib/assessments/trainingZone";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.movement;

// Unlike the other checks this one stores nothing: it is a calculator, not a
// measurement of the person, so there is no result worth trending and no
// sign-in gate. Mirrors proageing.org/training-zone.html.
export default function TrainingZonePage() {
  return (
    <Suspense fallback={null}>
      <TrainingZonePageInner />
    </Suspense>
  );
}

function TrainingZonePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const t = useT();
  const c = t.assess.trainingZone;
  const [screen, setScreen] = useState<Screen>("welcome");
  const [age, setAge] = useState(60);
  const { audioOn, toggleAudio, speak } = useAssessmentAudio();

  useEffect(() => {
    if (screen === "welcome") speak(c.title);
    if (screen === "questions") speak(c.howOld);
  }, [screen, c, speak]);

  const zone = computeTrainingZone(age);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <AssessmentTopBar
        order={SCREEN_ORDER}
        current={screen}
        pillar={pillar}
        audioOn={audioOn}
        onToggleAudio={toggleAudio}
        onExit={() => router.push(returnTo)}
      />

      {screen === "welcome" && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{c.eyebrow}</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{c.title}</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">{c.intro1}</p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">{c.intro2}</p>
          <button
            onClick={() => setScreen("questions")}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            {c.begin}
          </button>
        </div>
      )}

      {screen === "questions" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            {c.justOneNumber}
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.howOld}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.howOldBlurb}</p>

          <div className="mt-4 rounded-lg border border-border p-4 dark:border-border-dark">
            <p className="font-medium text-ink dark:text-ink-dark">{c.yourAge}</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setAge((a) => Math.max(18, Math.min(100, a - 1)))}
                aria-label="−"
                className="h-10 w-10 rounded-full border border-border text-lg dark:border-border-dark"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={18}
                max={100}
                value={age}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setAge(Number.isNaN(n) ? 60 : Math.min(100, Math.max(18, n)));
                }}
                className="no-spinner w-14 rounded-lg border border-border bg-transparent text-center text-xl font-semibold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
              />
              <button
                onClick={() => setAge((a) => Math.max(18, Math.min(100, a + 1)))}
                aria-label="+"
                className="h-10 w-10 rounded-full border border-border text-lg dark:border-border-dark"
              >
                +
              </button>
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">{c.yearsUnit}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-faint dark:text-ink-dark-faint">{c.medicationNote}</p>

          <button
            onClick={() => setScreen("results")}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            {c.findMyZone}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-movement-dark">{t.assess.common.yourResult}</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.zonesHeading}</h2>

          <div className="mt-4 text-center">
            <div className="text-5xl font-bold tabular-nums text-movement-dark">
              {zone.zoneLow}–{zone.zoneHigh}
            </div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.zoneRange}</div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-ink dark:text-ink-dark">{zone.hrMax}</div>
              <div className="text-xs text-ink-soft dark:text-ink-dark-soft">{c.maxHr}</div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border p-4 dark:border-border-dark">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {c.whatThisMeans}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{c.talkTest}</p>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">{c.disclaimer}</p>
          <p className="mt-2 text-xs text-ink-faint dark:text-ink-dark-faint">{c.sources}</p>

          <button
            onClick={() => setScreen("questions")}
            className="mt-6 w-full rounded-2xl border border-border py-3 text-sm font-semibold text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
          >
            {c.recalculate}
          </button>
          <button
            onClick={() => router.push(returnTo)}
            className={`mt-3 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            {c.done}
          </button>
        </div>
      )}
    </main>
  );
}
