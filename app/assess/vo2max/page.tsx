"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelKeyFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { useT } from "@/lib/i18n/context";
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
  return (
    <Suspense fallback={null}>
      <VO2MaxPageInner />
    </Suspense>
  );
}

function VO2MaxPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const [userId, setUserId] = useState<string | null>(null);
  const t = useT();
  const c = t.assess.vo2max;
  const [screen, setScreen] = useState<Screen>(searchParams.get("retake") === "1" ? "questions" : "welcome");
  const [answers, setAnswers] = useState<VO2Answers>(emptyVO2Answers());
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
  // The six norm bands collapse to three copy bands, matching
  // interpretVO2Category's own poor/fair, average, rest split.
  const rc = category
    ? category.status === "poor" || category.status === "fair"
      ? c.result.low
      : category.status === "average"
        ? c.result.average
        : c.result.high
    : null;

  function goToResults() {
    if (!answers.sex) return;
    speak(`Your estimated VO2 max is ${score.vo2max} milliliters per kilogram per minute.`);
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    // Cooper/ACSM fitness categories are age- and sex-banded, so both
    // are stored with the estimate rather than only the derived number.
    const { error } = await saveAssessmentResult(userId, "vo2max", {
      score: score.vo2max,
      rhr: answers.rhr,
      age: answers.age,
      sex: answers.sex,
      status: category?.status ?? null,
    });
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
          <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">{c.beforeBegin}</h3>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
              {c.beforeBeginBody}
            </p>
          </div>
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
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.tellUs}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.tellUsBlurb}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{c.aboutYou}</p>
          <div className="mt-2 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">{c.yourAge}</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setAnswers((p) => ({ ...p, age: Math.max(50, Math.min(100, p.age - 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={50}
                max={100}
                value={answers.age}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setAnswers((p) => ({ ...p, age: Number.isNaN(n) ? 50 : Math.min(100, Math.max(50, n)) }));
                }}
                className="no-spinner w-14 rounded-lg border border-border bg-transparent text-center text-xl font-semibold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
              />
              <button
                onClick={() => setAnswers((p) => ({ ...p, age: Math.max(50, Math.min(100, p.age + 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                +
              </button>
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">{c.yearsUnit}</span>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">{c.yourSex}</p>
            <div className="mt-2 flex gap-2">
              {(["m", "f"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setAnswers((p) => ({ ...p, sex: s }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                    answers.sex === s ? "border-movement bg-movement-tint text-movement-dark" : "border-border text-ink-soft"
                  }`}
                >
                  {s === "m" ? c.male : c.female}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{c.restingHr}</p>
          <div className="mt-2 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">{c.pulseCount}</p>
            <p className="mt-1 text-xs text-ink-soft dark:text-ink-dark-soft">
              {c.pulseBlurb}
            </p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setAnswers((p) => ({ ...p, rhr: Math.max(35, Math.min(120, p.rhr - 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={35}
                max={120}
                value={answers.rhr}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setAnswers((p) => ({ ...p, rhr: Number.isNaN(n) ? 35 : Math.min(120, Math.max(35, n)) }));
                }}
                className="no-spinner w-14 rounded-lg border border-border bg-transparent text-center text-xl font-semibold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
              />
              <button
                onClick={() => setAnswers((p) => ({ ...p, rhr: Math.max(35, Math.min(120, p.rhr + 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                +
              </button>
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">{c.bpm}</span>
            </div>
          </div>

          <button
            onClick={goToResults}
            disabled={!answers.sex}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && category && result && rc && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-movement-dark">{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-movement-dark">{score.vo2max}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.estimatedVo2}</div>
          </div>

          <p className="mt-6 rounded-full bg-movement-tint px-3 py-1 text-center text-sm font-semibold text-movement-dark">
            {c.category[category.status]}
          </p>

          <div className="mt-4 flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-ink dark:text-ink-dark">{score.hrMax}</div>
              <div className="text-xs text-ink-soft dark:text-ink-dark-soft">{c.maxHr}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ink dark:text-ink-dark">{answers.rhr}</div>
              <div className="text-xs text-ink-soft dark:text-ink-dark-soft">{c.restingHrShort}</div>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint text-center">
            {c.estimateFor(answers.age, answers.sex === "m" ? c.sexMale : c.sexFemale)}
          </p>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {rc.title}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{rc.text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">{c.nextStepsHeading}</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
              {rc.nextSteps.map((step) => (
                <li key={step} className="mt-1">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.disclaimer}
          </p>
          <p className="mt-2 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.sources}
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
