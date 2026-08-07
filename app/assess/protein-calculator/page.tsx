"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { useT } from "@/lib/i18n/context";
import {
  PROTEIN_FOODS,
  computeProteinTarget,
  loadSettings,
  loadTally,
  saveSettings,
  saveTally,
  tallyTotal,
  type TallyCounts,
} from "@/lib/assessments/proteinCalculator";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.nutrition;

// A calculator, not an assessment: it works out a target and tallies a day
// against it, and stores neither in the database. See lib/assessments/
// proteinCalculator.ts for why.
export default function ProteinCalculatorPage() {
  return (
    <Suspense fallback={null}>
      <ProteinCalculatorPageInner />
    </Suspense>
  );
}

function ProteinCalculatorPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const t = useT();
  const c = t.assess.proteinCalculator;
  const { audioOn, toggleAudio, speak } = useAssessmentAudio();

  const [screen, setScreen] = useState<Screen>("welcome");
  const [weightKg, setWeightKg] = useState(60);
  const [strength, setStrength] = useState<boolean | null>(null);
  const [counts, setCounts] = useState<TallyCounts>({});

  // A returning visitor already told us their weight; skip straight to the
  // target and today's tally rather than asking again.
  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      setWeightKg(saved.weightKg);
      setStrength(saved.doesStrengthWork);
      setCounts(loadTally());
      setScreen("results");
    }
  }, []);

  useEffect(() => {
    if (screen === "welcome") speak(c.title);
  }, [screen, c, speak]);

  const target = computeProteinTarget(weightKg, strength === true);
  const total = tallyTotal(counts);
  const remaining = Math.max(0, target.low - total);
  const pct = Math.min(100, Math.round((total / target.low) * 100));

  function commitAnswers() {
    saveSettings({ weightKg, doesStrengthWork: strength === true });
    setScreen("results");
  }

  function bump(key: string, delta: number) {
    setCounts((prev) => {
      const next = { ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) };
      if (next[key] === 0) delete next[key];
      saveTally(next);
      return next;
    });
  }

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
          <p className="mt-3 text-base leading-relaxed text-ink-soft dark:text-ink-dark-soft">{c.intro1}</p>
          <p className="mt-3 text-base text-ink-soft dark:text-ink-dark-soft">{c.intro2}</p>
          <button
            onClick={() => setScreen("questions")}
            className={`mt-6 min-h-[56px] w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            {c.begin}
          </button>
        </div>
      )}

      {screen === "questions" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{c.aboutYou}</p>

          <div className="mt-3 rounded-xl border border-border p-4 dark:border-border-dark">
            <p className="text-base font-medium text-ink dark:text-ink-dark">{c.yourWeight}</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => setWeightKg((w) => Math.max(30, w - 1))}
                aria-label="−1 kg"
                className="h-14 w-14 rounded-full border-2 border-border text-2xl font-bold dark:border-border-dark"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={30}
                max={200}
                value={weightKg}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setWeightKg(Number.isNaN(n) ? 60 : Math.min(200, Math.max(30, n)));
                }}
                className="no-spinner w-20 rounded-lg border-2 border-border bg-transparent py-2 text-center text-2xl font-bold tabular-nums text-ink outline-none focus:border-nutrition dark:border-border-dark dark:text-ink-dark"
              />
              <button
                onClick={() => setWeightKg((w) => Math.min(200, w + 1))}
                aria-label="+1 kg"
                className="h-14 w-14 rounded-full border-2 border-border text-2xl font-bold dark:border-border-dark"
              >
                +
              </button>
              <span className="text-base text-ink-soft dark:text-ink-dark-soft">{c.kgUnit}</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border p-4 dark:border-border-dark">
            <p className="text-base font-medium text-ink dark:text-ink-dark">{c.strengthQuestion}</p>
            <div className="mt-3 flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setStrength(val)}
                  className={`min-h-[56px] flex-1 rounded-xl border-2 px-4 text-base font-bold ${
                    strength === val ? pillar.selected : `${pillar.unselected} dark:border-border-dark`
                  }`}
                >
                  {val ? c.strengthYes : c.strengthNo}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-faint dark:text-ink-dark-faint">{c.strengthNote}</p>
          </div>

          <button
            onClick={commitAnswers}
            disabled={strength === null}
            className={`mt-6 min-h-[56px] w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-40 ${pillar.solidButton}`}
          >
            {c.calculate}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${pillar.eyebrow}`}>{c.yourTarget}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold tabular-nums text-nutrition-dark">
              {target.low}–{target.high}
            </div>
            <div className="text-base font-medium text-ink-soft dark:text-ink-dark-soft">{c.gramsADay}</div>
            <p className="mt-2 text-base text-ink-soft dark:text-ink-dark-soft">{c.perMealLabel(target.perMeal)}</p>
            <p className="mt-1 text-sm text-ink-faint dark:text-ink-dark-faint">{c.palmNote}</p>
          </div>

          {/* today's tally */}
          <div className="mt-8 rounded-2xl border-2 border-nutrition/40 p-4">
            <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.tallyHeading}</h2>
            <p className="mt-1 text-base text-ink-soft dark:text-ink-dark-soft">{c.tallyBlurb}</p>

            <div className="sticky top-2 z-10 mt-4 rounded-xl bg-nutrition-tint p-4 dark:bg-nutrition-dark/30">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold text-nutrition-dark dark:text-nutrition-tint">{c.totalSoFar}</span>
                <span className="text-3xl font-bold tabular-nums text-nutrition-dark dark:text-nutrition-tint">{total}g</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/70 dark:bg-black/30">
                <div className="h-3 rounded-full bg-nutrition transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-base font-semibold text-nutrition-dark dark:text-nutrition-tint">
                {remaining > 0 ? c.remaining(remaining) : c.targetMet}
              </p>
            </div>

            {(["everyday", "hawker"] as const).map((group) => (
              <div key={group} className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
                  {group === "everyday" ? c.everyday : c.hawker}
                </p>
                <ul className="mt-2 space-y-2">
                  {PROTEIN_FOODS.filter((f) => f.group === group).map((food) => {
                    const n = counts[food.key] ?? 0;
                    return (
                      <li
                        key={food.key}
                        className={`flex items-center gap-3 rounded-xl border-2 p-2 ${
                          n > 0 ? "border-nutrition bg-nutrition-tint dark:bg-nutrition-dark/25" : "border-border dark:border-border-dark"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pl-1">
                          <div className="text-base text-ink dark:text-ink-dark">{c.foods[food.key as keyof typeof c.foods]}</div>
                          <div className="text-sm text-ink-faint dark:text-ink-dark-faint">{food.grams}g</div>
                        </div>
                        {n > 0 && (
                          <button
                            onClick={() => bump(food.key, -1)}
                            aria-label={`−1 ${c.foods[food.key as keyof typeof c.foods]}`}
                            className="h-14 w-14 shrink-0 rounded-full border-2 border-nutrition text-2xl font-bold text-nutrition-dark"
                          >
                            −
                          </button>
                        )}
                        {n > 0 && (
                          <span className="w-6 shrink-0 text-center text-xl font-bold tabular-nums text-nutrition-dark">{n}</span>
                        )}
                        <button
                          onClick={() => bump(food.key, 1)}
                          aria-label={`+1 ${c.foods[food.key as keyof typeof c.foods]}`}
                          className={`h-14 w-14 shrink-0 rounded-full text-2xl font-bold text-white ${pillar.solidButton}`}
                        >
                          +
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {total > 0 && (
              <button
                onClick={() => {
                  setCounts({});
                  saveTally({});
                }}
                className="mt-5 min-h-[56px] w-full rounded-xl border-2 border-border text-base font-semibold text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
              >
                {c.clearTally}
              </button>
            )}
          </div>

          <p className="mt-6 rounded-xl bg-coral-tint px-4 py-3 text-base text-coral dark:bg-coral-tint-dark dark:text-coral-dark">
            {c.kidneyWarning}
          </p>
          <p className="mt-3 text-sm text-ink-faint dark:text-ink-dark-faint">{c.disclaimer}</p>
          <p className="mt-2 text-xs text-ink-faint dark:text-ink-dark-faint">{c.sources}</p>

          <button
            onClick={() => setScreen("questions")}
            className="mt-6 min-h-[56px] w-full rounded-2xl border-2 border-border text-base font-semibold text-ink-soft dark:border-border-dark dark:text-ink-dark-soft"
          >
            {c.changeAnswers}
          </button>
          <button
            onClick={() => router.push(returnTo)}
            className={`mt-3 min-h-[56px] w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            {c.done}
          </button>
        </div>
      )}
    </main>
  );
}
