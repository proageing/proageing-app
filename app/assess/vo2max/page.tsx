"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import {
  classifyVO2,
  computeVO2Max,
  emptyVO2Answers,
  interpretVO2Category,
  type Sex,
  type VO2Answers,
} from "@/lib/assessments/vo2max";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.movement;

export default function VO2MaxPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<VO2Answers>(emptyVO2Answers());
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
      speak("VO2 max and resting heart rate check. We'll estimate your cardiorespiratory fitness.");
    }
    if (screen === "questions") {
      speak("Tell us your age, sex, and resting heart rate.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const score = computeVO2Max(answers);
  const category = answers.sex ? classifyVO2(score.vo2max, answers.sex, answers.age) : null;
  const result = category ? interpretVO2Category(category.status) : null;

  function goToResults() {
    if (!answers.sex) return;
    speak(`Your estimated VO2 max is ${score.vo2max} milliliters per kilogram per minute.`);
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "vo2max", { score: score.vo2max, rhr: answers.rhr });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <AssessmentTopBar
        order={SCREEN_ORDER}
        current={screen}
        pillar={pillar}
        audioOn={audioOn}
        onToggleAudio={toggleAudio}
        onExit={() => router.push("/dashboard")}
      />

      {screen === "welcome" && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Cardiorespiratory Fitness · ~3 minutes</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">VO2 Max & Resting Heart Rate</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            VO2 max measures how efficiently your heart, lungs, and muscles use oxygen during
            exercise. It&apos;s one of the strongest predictors of healthy longevity found in
            ageing research — in one study of over 122,000 adults, the fittest group had an 80%
            lower risk of death than the least fit (Mandsager et al., JAMA Network Open, 2018).
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            We&apos;ll estimate yours from your resting heart rate using the Heart Rate Ratio
            Method (Uth et al., 2004) — no treadmill needed.
          </p>
          <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">📏 Before you begin</h3>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
              For the most accurate result, measure your resting heart rate first thing in the
              morning, before getting out of bed. Count your pulse for a full 60 seconds.
            </p>
          </div>
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
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">Tell us about yourself</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">Just three numbers — no equipment needed beyond a watch or phone timer.</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">About you</p>
          <div className="mt-2 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">Your age</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setAnswers((p) => ({ ...p, age: Math.max(18, Math.min(100, p.age - 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                −
              </button>
              <span className="w-12 text-center text-xl font-semibold tabular-nums">{answers.age}</span>
              <button
                onClick={() => setAnswers((p) => ({ ...p, age: Math.max(18, Math.min(100, p.age + 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                +
              </button>
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">years</span>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">Your sex</p>
            <div className="mt-2 flex gap-2">
              {(["m", "f"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setAnswers((p) => ({ ...p, sex: s }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                    answers.sex === s ? "border-movement bg-movement-tint text-movement-dark" : "border-border text-ink-soft"
                  }`}
                >
                  {s === "m" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Your resting heart rate</p>
          <div className="mt-2 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">Pulse count (60 seconds, at rest)</p>
            <p className="mt-1 text-xs text-ink-soft dark:text-ink-dark-soft">
              Count your pulse for a full minute while sitting calmly, ideally first thing in the
              morning.
            </p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setAnswers((p) => ({ ...p, rhr: Math.max(35, Math.min(120, p.rhr - 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                −
              </button>
              <span className="w-12 text-center text-xl font-semibold tabular-nums">{answers.rhr}</span>
              <button
                onClick={() => setAnswers((p) => ({ ...p, rhr: Math.max(35, Math.min(120, p.rhr + 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                +
              </button>
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">beats per minute</span>
            </div>
          </div>

          <button
            onClick={goToResults}
            disabled={!answers.sex}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            See my results
          </button>
        </div>
      )}

      {screen === "results" && category && result && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-movement-dark">Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-movement-dark">{score.vo2max}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">estimated VO2 max (mL/kg/min)</div>
          </div>

          <p className="mt-6 rounded-full bg-movement-tint px-3 py-1 text-center text-sm font-semibold text-movement-dark">
            {category.label}
          </p>

          <div className="mt-4 flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-ink dark:text-ink-dark">{score.hrMax}</div>
              <div className="text-xs text-ink-soft dark:text-ink-dark-soft">Max HR (bpm)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ink dark:text-ink-dark">{answers.rhr}</div>
              <div className="text-xs text-ink-soft dark:text-ink-dark-soft">Resting HR (bpm)</div>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint text-center">
            Estimate for age {answers.age}, {answers.sex === "m" ? "male" : "female"}. Categories
            from Cooper Institute / ACSM norms.
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
            This is a formula-based estimate, not a lab measurement — individual accuracy varies,
            and it tends to underestimate VO2 max in fitter people. It&apos;s a screening tool, not
            a diagnosis. Always check with your doctor before starting a new exercise programme.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {saving ? "Saving…" : "Save & return to dashboard"}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
