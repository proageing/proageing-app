"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { useT } from "@/lib/i18n/context";
import {
  CUSTOM_GRAMS_MAX,
  CUSTOM_NAME_MAX,
  PROTEIN_FOODS,
  computeProteinTarget,
  loadSettings,
  loadTally,
  makeCustomFood,
  saveSettings,
  saveTally,
  tallyTotal,
  type CustomFood,
  type TallyCounts,
} from "@/lib/assessments/proteinCalculator";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.nutrition;

// One row shape for both the built-in foods and the ones someone adds, so an
// added item is tapped exactly like the rest. Only custom rows get Remove.
function FoodRow({
  label,
  grams,
  count,
  onBump,
  onRemove,
  removeLabel,
}: {
  label: string;
  grams: number;
  count: number;
  onBump: (delta: number) => void;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border-2 p-2 ${
        count > 0 ? "border-nutrition bg-nutrition-tint dark:bg-nutrition-dark/25" : "border-border dark:border-border-dark"
      }`}
    >
      <div className="min-w-0 flex-1 pl-1">
        <div className="text-base text-ink dark:text-ink-dark">{label}</div>
        <div className="text-sm text-ink-faint dark:text-ink-dark-faint">{grams}g</div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="mt-1 min-h-[44px] text-sm font-semibold text-coral underline dark:text-coral-dark"
          >
            {removeLabel}
          </button>
        )}
      </div>
      {count > 0 && (
        <button
          onClick={() => onBump(-1)}
          aria-label={`−1 ${label}`}
          className="h-14 w-14 shrink-0 rounded-full border-2 border-nutrition text-2xl font-bold text-nutrition-dark"
        >
          −
        </button>
      )}
      {count > 0 && <span className="w-6 shrink-0 text-center text-xl font-bold tabular-nums text-nutrition-dark">{count}</span>}
      <button
        onClick={() => onBump(1)}
        aria-label={`+1 ${label}`}
        className={`h-14 w-14 shrink-0 rounded-full text-2xl font-bold text-white ${pillar.solidButton}`}
      >
        +
      </button>
    </li>
  );
}

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
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [newName, setNewName] = useState("");
  const [newGrams, setNewGrams] = useState("");

  // A returning visitor already told us their weight; skip straight to the
  // target and today's tally rather than asking again.
  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      setWeightKg(saved.weightKg);
      setStrength(saved.doesStrengthWork);
      setCustomFoods(saved.customFoods ?? []);
      setCounts(loadTally());
      setScreen("results");
    }
  }, []);

  useEffect(() => {
    if (screen === "welcome") speak(c.title);
  }, [screen, c, speak]);

  const target = computeProteinTarget(weightKg, strength === true);
  const total = tallyTotal(counts, customFoods);
  const remaining = Math.max(0, target.low - total);
  const pct = Math.min(100, Math.round((total / target.low) * 100));

  const parsedGrams = parseInt(newGrams, 10);
  const canAdd = Number.isFinite(parsedGrams) && parsedGrams >= 1 && parsedGrams <= CUSTOM_GRAMS_MAX;

  function persist(foods: CustomFood[]) {
    saveSettings({ weightKg, doesStrengthWork: strength === true, customFoods: foods });
  }

  function commitAnswers() {
    persist(customFoods);
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

  // An added item counts once straight away -- you are entering it because you
  // just ate it, so making you then tap "+" would be a step for nothing.
  function addCustom() {
    if (!canAdd) return;
    const food = makeCustomFood(newName || c.customFallbackName, parsedGrams);
    const foods = [...customFoods, food];
    setCustomFoods(foods);
    persist(foods);
    setCounts((prev) => {
      const next = { ...prev, [food.key]: 1 };
      saveTally(next);
      return next;
    });
    setNewName("");
    setNewGrams("");
  }

  function removeCustom(key: string) {
    const foods = customFoods.filter((f) => f.key !== key);
    setCustomFoods(foods);
    persist(foods);
    setCounts((prev) => {
      const next = { ...prev };
      delete next[key];
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
                  {PROTEIN_FOODS.filter((f) => f.group === group).map((food) => (
                    <FoodRow
                      key={food.key}
                      label={c.foods[food.key as keyof typeof c.foods]}
                      grams={food.grams}
                      count={counts[food.key] ?? 0}
                      onBump={(d) => bump(food.key, d)}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {customFoods.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{c.yourOwn}</p>
                <ul className="mt-2 space-y-2">
                  {customFoods.map((food) => (
                    <FoodRow
                      key={food.key}
                      label={food.label}
                      grams={food.grams}
                      count={counts[food.key] ?? 0}
                      onBump={(d) => bump(food.key, d)}
                      onRemove={() => removeCustom(food.key)}
                      removeLabel={c.remove}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Add your own. The list above cannot cover a protein shake, a
                particular brand of yoghurt, or someone's own cooking. */}
            <div className="mt-6 rounded-xl border-2 border-dashed border-border p-4 dark:border-border-dark">
              <p className="text-base font-semibold text-ink dark:text-ink-dark">{c.addHeading}</p>
              <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.addHint}</p>
              <label className="mt-3 block text-sm font-semibold text-ink-soft dark:text-ink-dark-soft" htmlFor="customName">
                {c.customNameLabel}
              </label>
              <input
                id="customName"
                type="text"
                maxLength={CUSTOM_NAME_MAX}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={c.customNamePlaceholder}
                className="mt-1 min-h-[56px] w-full rounded-xl border-2 border-border bg-transparent px-3 text-base text-ink outline-none focus:border-nutrition dark:border-border-dark dark:text-ink-dark"
              />
              <label className="mt-3 block text-sm font-semibold text-ink-soft dark:text-ink-dark-soft" htmlFor="customGrams">
                {c.customGramsLabel}
              </label>
              <input
                id="customGrams"
                type="number"
                inputMode="numeric"
                min={1}
                max={CUSTOM_GRAMS_MAX}
                value={newGrams}
                onChange={(e) => setNewGrams(e.target.value)}
                placeholder="20"
                className="no-spinner mt-1 min-h-[56px] w-24 rounded-xl border-2 border-border bg-transparent px-3 text-center text-xl font-bold tabular-nums text-ink outline-none focus:border-nutrition dark:border-border-dark dark:text-ink-dark"
              />
              <button
                onClick={addCustom}
                disabled={!canAdd}
                className={`mt-4 min-h-[56px] w-full rounded-xl text-base font-bold text-white disabled:opacity-40 ${pillar.solidButton}`}
              >
                {c.addButton}
              </button>
            </div>

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
