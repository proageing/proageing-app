"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { LikertQuestionCard } from "@/components/LikertQuestionCard";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import {
  FREQUENCY_OPTIONS,
  PORTION_OPTIONS,
  PROTEIN_FOOD_QUESTIONS,
  computeProteinScore,
  emptyNutritionAnswers,
  interpretProteinScore,
  isNutritionComplete,
  type NutritionAnswers,
} from "@/lib/assessments/nutritionProtein";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.nutrition;

export default function NutritionProteinPage() {
  return (
    <Suspense fallback={null}>
      <NutritionProteinPageInner />
    </Suspense>
  );
}

function NutritionProteinPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"));
  const returnLabel = returnLabelFrom(searchParams.get("from"));
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<NutritionAnswers>(emptyNutritionAnswers());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { audioOn, toggleAudio, speak } = useAssessmentAudio();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/signin");
        return;
      }
      setUserId(user.id);
    });
  }, [router]);

  useEffect(() => {
    if (screen === "welcome") {
      speak("Nutrition and protein check. How often do you eat protein-rich foods in a typical week?");
    }
    if (screen === "questions") {
      speak("Think about a normal week for you. There are no right or wrong answers.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function setAnswer(key: keyof NutritionAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeProteinScore(answers);
  const result = interpretProteinScore(score);

  function goToResults() {
    if (!isNutritionComplete(answers)) return;
    speak(`Your protein source frequency score is ${score} out of 32.`);
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "nutrition-protein", { score });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    router.push(returnTo);
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
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Nutrition & Protein · ~3 minutes</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Nutrition & Protein Check</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            Older adults need more protein per kg of body weight than younger adults do, just to
            maintain the same muscle — but intake often quietly falls short. This check screens
            how often you're eating protein-rich foods across a typical week.
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            Adapted from the Protein Screener 55+ (a validated Dutch tool) using food items
            confirmed relevant to Singapore's multi-ethnic diet. It's a directional guide, not a
            lab-grade measurement.
          </p>
          <button
            onClick={() => setScreen("questions")}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            Let&apos;s begin
          </button>
        </div>
      )}

      {screen === "questions" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">How often do you eat these?</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">Think about a normal week for you — no right or wrong answers.</p>

          <div className="mt-6 flex flex-col gap-2.5">
            {PROTEIN_FOOD_QUESTIONS.map((q) => (
              <LikertQuestionCard
                key={q.key}
                question={q.label}
                options={FREQUENCY_OPTIONS}
                value={answers[q.key]}
                onChange={(v) => setAnswer(q.key, v)}
                style={PILLAR_STYLES.nutrition}
              />
            ))}

            <LikertQuestionCard
              question="At your main meal, how much meat, fish, tofu, or eggs do you usually have?"
              options={PORTION_OPTIONS}
              value={answers.portion}
              onChange={(v) => setAnswer("portion", v)}
              style={PILLAR_STYLES.nutrition}
            />
          </div>

          <button
            onClick={goToResults}
            disabled={!isNutritionComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            See my results
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-nutrition-dark">Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-nutrition-dark">{score}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">protein-source frequency score · out of 32</div>
          </div>

          <p className="mt-6 rounded-full bg-nutrition-tint px-3 py-1 text-center text-sm font-semibold text-nutrition-dark">
            {result.label}
          </p>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {result.title}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{result.text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">✅ Suggested next steps</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
              {result.nextSteps.map((step) => (
                <li key={step} className="mt-1">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            This is an informational screening tool, not a diagnosis. For a precise measurement
            of your protein intake, ask your doctor for a referral to a dietitian.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {saving ? "Saving…" : `Save & return to ${returnLabel}`}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
