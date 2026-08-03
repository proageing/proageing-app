"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { LikertQuestionCard } from "@/components/LikertQuestionCard";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import {
  COGNITIVE_QUESTIONS,
  cognitiveComponentMeta,
  computeSLASScore,
  emptyCognitiveAnswers,
  interpretSLASScore,
  isCognitiveComplete,
  type CognitiveAnswers,
} from "@/lib/assessments/cognitiveDecline";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.cognitive;

export default function CognitiveDeclinePage() {
  return (
    <Suspense fallback={null}>
      <CognitiveDeclinePageInner />
    </Suspense>
  );
}

function CognitiveDeclinePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabel = returnLabelFrom(searchParams.get("from"));
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<CognitiveAnswers>(emptyCognitiveAnswers());
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
      speak("Cognitive decline risk check, based on the SLAS Risk Index. A few short questions about you.");
    }
    if (screen === "questions") {
      speak("Answer each question about yourself. There are no right or wrong answers.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function setAnswer(key: keyof CognitiveAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeSLASScore(answers);
  const result = interpretSLASScore(score.total);
  const componentMeta = cognitiveComponentMeta(score.cardioCount);

  function goToResults() {
    if (!isCognitiveComplete(answers)) return;
    speak(`Your cognitive risk score is ${score.total}.`);
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "cognitive-decline", { score: score.total, status: result.status });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    router.push(returnTo);
  }

  let lastSection = "";

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
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Cognitive Health Check · ~3 minutes</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Cognitive Decline Risk Check</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            This check uses the SLAS Risk Index, developed and validated by the Singapore
            Longitudinal Ageing Study (Ng et al., 2021). It&apos;s a short, self-reported
            checklist of 10 personal, lifestyle and health factors shown to predict a person&apos;s
            3–5 year risk of mild cognitive impairment (MCI) or dementia.
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            It was field-tested with over 400 community-living older adults in Singapore to
            identify who would benefit most from early lifestyle support — the same approach
            we&apos;re using here.
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
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">Tell us about yourself</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
            These are the same questions used in the original research checklist. There are no
            right or wrong answers — just answer as accurately as you can.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {COGNITIVE_QUESTIONS.map((q) => {
              const showSection = q.section !== lastSection;
              lastSection = q.section;
              return (
                <LikertQuestionCard
                  key={q.key}
                  section={showSection ? q.section : undefined}
                  question={q.question}
                  options={q.opts}
                  value={answers[q.key]}
                  onChange={(v) => setAnswer(q.key, v)}
                  style={PILLAR_STYLES.cognitive}
                />
              );
            })}
          </div>

          <button
            onClick={goToResults}
            disabled={!isCognitiveComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            See my results
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cognitive-dark">Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-cognitive-dark">{score.total}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">risk index score · higher means higher risk</div>
          </div>

          <p className="mt-6 rounded-full bg-cognitive-tint px-3 py-1 text-center text-sm font-semibold text-cognitive-dark">
            {result.label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            Score {score.total} of 13. In the original research, scores under 6 were linked to
            under 10% predicted risk; 6–7 was the study&apos;s screening threshold; 8 and above
            showed a clinically meaningful drop in cognitive test scores.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">What&apos;s behind your score</p>
          <div className="mt-2 flex flex-col gap-2">
            {componentMeta.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                <span className="w-56 shrink-0 text-sm text-ink-soft dark:text-ink-dark-soft">{c.label}</span>
                <div className="h-2 flex-1 rounded-full bg-border/60 dark:bg-border-dark">
                  <div className="h-2 rounded-full bg-cognitive" style={{ width: `${(score.parts[c.key] / c.max) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-ink-soft dark:text-ink-dark-soft">
                  {score.parts[c.key]}/{c.max}
                </span>
              </div>
            ))}
          </div>

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
            This is a research-based screening tool, not a diagnosis. Only a doctor can assess
            memory or thinking changes properly — please share this result with yours, especially
            if your score is 6 or higher.
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
