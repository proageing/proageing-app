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
  CONNECTION_QUESTIONS,
  computeConnectionScore,
  emptyConnectionAnswers,
  interpretLonelinessScore,
  isConnectionComplete,
  networkFlag,
  type ConnectionAnswers,
} from "@/lib/assessments/connection";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.connection;

export default function ConnectionPage() {
  return (
    <Suspense fallback={null}>
      <ConnectionPageInner />
    </Suspense>
  );
}

function ConnectionPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const t = useT();
  const c = t.assess.connection;
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(searchParams.get("retake") === "1" ? "questions" : "welcome");
  const [answers, setAnswers] = useState<ConnectionAnswers>(emptyConnectionAnswers());
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
      speak("Connection check. A few questions about your family, friends, and how you've been feeling.");
    }
    if (screen === "questions") {
      speak("Answer each question as accurately as you can. There are no right or wrong answers.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function setAnswer(key: keyof ConnectionAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeConnectionScore(answers);
  const result = interpretLonelinessScore(score.loneliness);
  const famFlag = networkFlag(score.family);
  const friFlag = networkFlag(score.friends);

  function goToResults() {
    if (!isConnectionComplete(answers)) return;
    speak(`Your loneliness score is ${score.loneliness} out of 9.`);
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "connection", { score: score.loneliness, status: result.status });
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
            {CONNECTION_QUESTIONS.map((q, i) => {
              const showSection = q.section !== lastSection;
              lastSection = q.section;
              const sectionLabel = q.key.startsWith("fam")
                ? c.sections.family
                : q.key.startsWith("fri")
                  ? c.sections.friends
                  : c.sections.feelings;
              const optionLabels = q.key.startsWith("lon") ? c.loneliness : c.frequency;
              return (
                <LikertQuestionCard
                  key={q.key}
                  section={showSection ? sectionLabel : undefined}
                  question={c.questions[i]}
                  options={q.opts.map((o, oi) => ({ ...o, label: optionLabels[oi] }))}
                  value={answers[q.key]}
                  onChange={(v) => setAnswer(q.key, v)}
                  style={PILLAR_STYLES.connection}
                />
              );
            })}
          </div>

          <button
            onClick={goToResults}
            disabled={!isConnectionComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-connection-dark">{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-connection-dark">{score.loneliness}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.scoreCaption}</div>
          </div>

          <p className="mt-6 rounded-full bg-connection-tint px-3 py-1 text-center text-sm font-semibold text-connection-dark">
            {c.result[result.status].label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.bands(score.loneliness)}
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
            {c.networkHeading}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm">
              <span className="font-medium text-ink dark:text-ink-dark">{c.familyNetwork(score.family)}</span>
              <span className={famFlag === "isolated" ? "font-semibold text-red-600" : "font-semibold text-green-700"}>
                {famFlag === "isolated" ? c.isolated : c.connected}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm">
              <span className="font-medium text-ink dark:text-ink-dark">{c.friendsNetwork(score.friends)}</span>
              <span className={friFlag === "isolated" ? "font-semibold text-red-600" : "font-semibold text-green-700"}>
                {friFlag === "isolated" ? c.isolated : c.connected}
              </span>
            </div>
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
