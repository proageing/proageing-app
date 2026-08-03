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
  AGREEMENT_OPTIONS,
  IKIGAI_QUESTIONS,
  SUBSCALE_META,
  computeIkigaiScore,
  emptyIkigaiAnswers,
  interpretIkigaiScore,
  isIkigaiComplete,
  type IkigaiAnswers,
} from "@/lib/assessments/purpose";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.purpose;

export default function PurposePage() {
  return (
    <Suspense fallback={null}>
      <PurposePageInner />
    </Suspense>
  );
}

function PurposePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const t = useT();
  const c = t.assess.purpose;
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<IkigaiAnswers>(emptyIkigaiAnswers());
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
      speak("Sense of purpose check, based on the Ikigai-9. There are nine short statements to react to.");
    }
    if (screen === "questions") {
      speak("For each statement, choose how much you agree, from strongly disagree to strongly agree.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function setAnswer(key: keyof IkigaiAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeIkigaiScore(answers);
  const result = interpretIkigaiScore(score.total);

  function goToResults() {
    if (!isIkigaiComplete(answers)) return;
    speak(`Your ikigai score is ${score.total} out of 45.`);
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "purpose", { score: score.total, status: result.status });
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
            {c.intro1Pre}
            <em>{c.intro1Em}</em>
            {c.intro1Post}
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
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{c.questionsEyebrow}</p>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.questionsHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.questionsBlurb}</p>

          <div className="mt-6 flex flex-col gap-2.5">
            {IKIGAI_QUESTIONS.map((q, i) => (
              <LikertQuestionCard
                key={q.key}
                question={c.questions[i]}
                options={AGREEMENT_OPTIONS.map((o, oi) => ({ ...o, label: c.agreement[oi] }))}
                value={answers[q.key]}
                onChange={(v) => setAnswer(q.key, v)}
                style={PILLAR_STYLES.purpose}
              />
            ))}
          </div>

          <button
            onClick={goToResults}
            disabled={!isIkigaiComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purpose-dark">{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-purpose-dark">{score.total}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.outOf45}</div>
          </div>

          <p className="mt-6 rounded-full bg-purpose-tint px-3 py-1 text-center text-sm font-semibold text-purpose-dark">
            {c.result[result.status].label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.bands(score.total)}
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">{c.behindScore}</p>
          <div className="mt-2 flex flex-col gap-2">
            {SUBSCALE_META.map((m, i) => (
              <div key={m.key} className="flex items-center gap-3">
                <span className="w-64 shrink-0 text-sm text-ink-soft dark:text-ink-dark-soft">{c.subscales[i]}</span>
                <div className="h-2 flex-1 rounded-full bg-border/60 dark:bg-border-dark">
                  <div className="h-2 rounded-full bg-purpose" style={{ width: `${(score.subs[m.key] / 15) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-ink-soft dark:text-ink-dark-soft">{score.subs[m.key]}/15</span>
              </div>
            ))}
          </div>

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
