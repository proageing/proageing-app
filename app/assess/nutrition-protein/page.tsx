"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { LikertQuestionCard } from "@/components/LikertQuestionCard";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelKeyFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { useT } from "@/lib/i18n/context";
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
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const t = useT();
  const c = t.assess.nutritionProtein;
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(searchParams.get("retake") === "1" ? "questions" : "welcome");
  const [answers, setAnswers] = useState<NutritionAnswers>(emptyNutritionAnswers());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { audioOn, toggleAudio, speak } = useAssessmentAudio();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(signInHrefFor(window.location.pathname + window.location.search));
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
    const { error } = await saveAssessmentResult(userId, "nutrition-protein", { score, status: result.status });
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
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{c.eyebrow}</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{c.title}</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            {c.intro1}
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            {c.intro2}
          </p>
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
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.questionsHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.questionsBlurb}</p>

          <div className="mt-6 flex flex-col gap-2.5">
            {PROTEIN_FOOD_QUESTIONS.map((q, i) => (
              <LikertQuestionCard
                key={q.key}
                question={c.foods[i]}
                options={FREQUENCY_OPTIONS.map((o, oi) => ({ ...o, label: c.frequency[oi] }))}
                value={answers[q.key]}
                onChange={(v) => setAnswer(q.key, v)}
                style={PILLAR_STYLES.nutrition}
              />
            ))}

            <LikertQuestionCard
              question={c.portionQuestion}
              options={PORTION_OPTIONS.map((o, oi) => ({ ...o, label: c.portions[oi] }))}
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
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-nutrition-dark">{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-nutrition-dark">{score}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.scoreCaption}</div>
          </div>

          <p className="mt-6 rounded-full bg-nutrition-tint px-3 py-1 text-center text-sm font-semibold text-nutrition-dark">
            {c.result[result.status].label}
          </p>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {c.result[result.status].title}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{c.result[result.status].text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">{c.nextStepsHeading}</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
              {c.result[result.status].nextSteps.map((step) => (
                <li key={step} className="mt-1">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.disclaimer}
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {saving ? t.assess.common.saving : t.assess.common.saveAndReturn(t.assess.common.returnTo[returnLabelKey])}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
