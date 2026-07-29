"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
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

export default function NutritionProteinPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<NutritionAnswers>(emptyNutritionAnswers());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/signin");
        return;
      }
      setUserId(user.id);
    });
  }, [router]);

  function setAnswer(key: keyof NutritionAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeProteinScore(answers);
  const result = interpretProteinScore(score);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "nutrition-protein", { score });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      {screen === "welcome" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Nutrition & Protein · ~3 minutes</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Nutrition & Protein Check</h1>
          <p className="mt-3 text-neutral-600">
            Older adults need more protein per kg of body weight than younger adults do, just to
            maintain the same muscle — but intake often quietly falls short. This check screens
            how often you're eating protein-rich foods across a typical week.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            Adapted from the Protein Screener 55+ (a validated Dutch tool) using food items
            confirmed relevant to Singapore's multi-ethnic diet. It's a directional guide, not a
            lab-grade measurement.
          </p>
          <button
            onClick={() => setScreen("questions")}
            className="mt-6 rounded bg-primary px-4 py-2 font-medium text-white"
          >
            Let&apos;s begin
          </button>
        </div>
      )}

      {screen === "questions" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">How often do you eat these?</h2>
          <p className="mt-1 text-sm text-neutral-500">Think about a normal week for you — no right or wrong answers.</p>

          <div className="mt-6 flex flex-col gap-6">
            {PROTEIN_FOOD_QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="font-medium text-neutral-800">{q.label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswer(q.key, opt.value)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                        answers[q.key] === opt.value
                          ? "border-primary bg-primary-light text-primary-dark"
                          : "border-neutral-300 text-neutral-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <p className="font-medium text-neutral-800">
                At your main meal, how much meat, fish, tofu, or eggs do you usually have?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PORTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswer("portion", opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                      answers.portion === opt.value
                        ? "border-primary bg-primary-light text-primary-dark"
                        : "border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => isNutritionComplete(answers) && setScreen("results")}
            disabled={!isNutritionComplete(answers)}
            className="mt-8 rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            See my results
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-primary-dark">{score}</div>
            <div className="text-sm font-medium text-neutral-500">protein-source frequency score · out of 32</div>
          </div>

          <p className="mt-6 rounded-full bg-primary-light px-3 py-1 text-center text-sm font-semibold text-primary-dark">
            {result.label}
          </p>

          <div className="mt-6 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">💡 {result.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{result.text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">✅ Suggested next steps</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
              {result.nextSteps.map((step) => (
                <li key={step} className="mt-1">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            This is an informational screening tool, not a diagnosis. For a precise measurement
            of your protein intake, ask your doctor for a referral to a dietitian.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & return to dashboard"}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
