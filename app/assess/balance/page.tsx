"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import { useT } from "@/lib/i18n/context";
import {
  TIME_CAP,
  emptyBalanceAnswers,
  getNormRange,
  interpretBalance,
  isSafetyComplete,
  isUnsafe,
  type BalanceAnswers,
  type Sex,
} from "@/lib/assessments/balance";

type Screen = "welcome" | "check" | "unsafe" | "setup" | "test" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "check", "setup", "test", "results"];
const pillar = PILLAR_STYLES.strength;

export default function BalancePage() {
  return (
    <Suspense fallback={null}>
      <BalancePageInner />
    </Suspense>
  );
}

function BalancePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabel = returnLabelFrom(searchParams.get("from"));
  const [userId, setUserId] = useState<string | null>(null);
  const t = useT();
  const c = t.assess.balance;
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<BalanceAnswers>(emptyBalanceAnswers());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (screen === "welcome") {
      speak("Balance check. We'll time how long you can stand on one leg.");
    }
    if (screen === "check") {
      speak("Two quick safety questions, then your age and sex so we can compare fairly.");
    }
    if (screen === "setup") {
      speak("Stand near your support, hands on your hips, eyes open, and tap Start when you lift your foot.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function finishTimer(finalElapsed: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const rounded = Math.round(finalElapsed * 10) / 10;
    setAnswers((p) => ({ ...p, time: rounded }));
    speak(`You balanced for ${rounded.toFixed(1)} seconds.`);
    setScreen("results");
  }

  function handleTimerButton() {
    if (!running) {
      setRunning(true);
      speak("Timer started.");
      startedAtRef.current = performance.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const now = (performance.now() - startedAtRef.current) / 1000;
        if (now >= TIME_CAP) {
          setElapsed(TIME_CAP);
          finishTimer(TIME_CAP);
          return;
        }
        setElapsed(now);
      }, 100);
    } else {
      finishTimer(elapsed);
    }
  }

  function handleCheckContinue() {
    if (isUnsafe(answers)) {
      setScreen("unsafe");
      return;
    }
    setScreen("setup");
  }

  function startTest() {
    setElapsed(0);
    setRunning(false);
    setScreen("test");
  }

  const result = answers.sex ? interpretBalance(answers.time, answers.sex, answers.age) : null;
  const normRange = answers.sex ? getNormRange(answers.sex, answers.age) : null;

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    // age and sex are stored alongside the score because this check's
    // norms depend on both. Without them a past result can never be
    // re-interpreted — only compared as a bare number.
    // status is stored, not just recomputed later, so the record keeps
    // the interpretation the participant was actually shown. If a norm
    // table is ever revised, past results don't silently change meaning.
    const { error } = await saveAssessmentResult(userId, "balance", {
      score: answers.time,
      age: answers.age,
      sex: answers.sex,
      status: result?.status ?? null,
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
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">{c.readFirst}</h3>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
              {c.readFirstBody}
            </p>
          </div>
          <button onClick={() => setScreen("check")} className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            {c.begin}
          </button>
        </div>
      )}

      {screen === "check" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.safetyHeading}</h2>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">
              {c.supportQuestion}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, hasSupport: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.hasSupport === true ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.yesReady}
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, hasSupport: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.hasSupport === false ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.notYet}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">
              {c.safeQuestion}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === true ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.yesFine}
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === false ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.notToday}
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            {c.compareNote}
          </p>
          <div className="mt-2 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">{c.yourAge}</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setAnswers((p) => ({ ...p, age: Math.max(18, Math.min(100, p.age - 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={18}
                max={100}
                value={answers.age}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setAnswers((p) => ({ ...p, age: Number.isNaN(n) ? 18 : Math.min(100, Math.max(18, n)) }));
                }}
                className="no-spinner w-14 rounded-lg border border-border bg-transparent text-center text-xl font-semibold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
              />
              <button
                onClick={() => setAnswers((p) => ({ ...p, age: Math.max(18, Math.min(100, p.age + 1)) }))}
                className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
              >
                +
              </button>
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">{c.yearsUnit}</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {(["m", "f"] as Sex[]).map((s) => (
              <button
                key={s}
                onClick={() => setAnswers((p) => ({ ...p, sex: s }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.sex === s ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                {s === "m" ? c.male : c.female}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckContinue}
            disabled={!isSafetyComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {t.assess.common.continue}
          </button>
        </div>
      )}

      {screen === "unsafe" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">{c.holdOff}</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.skipToday}</h2>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            {c.skipBody}
          </p>
          <button onClick={() => setScreen("welcome")} className="mt-6 rounded border border-border dark:border-border-dark px-4 py-2 font-medium text-ink-soft dark:text-ink-dark-soft">
            {t.assess.common.notNow}
          </button>
        </div>
      )}

      {screen === "setup" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.setupHeading}</h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-ink-soft dark:text-ink-dark-soft">
            <li>
              <strong>{c.setupBarefoot}</strong>{c.setup1Rest}
            </li>
            <li>
              <strong>{c.setupHands}</strong>，<strong>{c.setupEyes}</strong>{c.setup2Rest}
            </li>
            <li>
              {c.setup3Pre}<strong>{c.setupStart}</strong>
            </li>
            <li>
              {c.setup4Pre}<strong>{c.setupStop}</strong>{c.setup4Rest}
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4 text-sm text-ink-soft dark:text-ink-dark-soft">
            {c.capNote}
          </div>
          <button onClick={startTest} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            {c.ready}
          </button>
        </div>
      )}

      {screen === "test" && (
        <div className="flex flex-col items-center text-center">
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{c.balancingNow}</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">
            {running ? c.tapStopWhen : c.tapStartWhen}
          </h2>
          <div className="mt-6 text-6xl font-bold tabular-nums text-strength-dark">{elapsed.toFixed(1)}</div>
          <div className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
            {running ? "keep your eyes open and hands on hips" : "seconds"}
          </div>
          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            Stop the moment you touch down, shift, or your hands leave your hips — capped at 60s.
          </p>
          <button
            onClick={handleTimerButton}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold ${
              running ? "border-[1.5px] border-border dark:border-border-dark text-ink-soft dark:text-ink-dark-soft" : `text-white ${pillar.solidButton}`
            }`}
          >
            {running ? c.stop : c.start}
          </button>
        </div>
      )}

      {screen === "results" && result && normRange && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-strength-dark">{answers.time.toFixed(1)}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.secondsBalanced}</div>
          </div>

          <p className="mt-6 rounded-full bg-strength-tint px-3 py-1 text-center text-sm font-semibold text-strength-dark">
            {c.result[result.status].label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.typicalRange(normRange[0].toFixed(0), normRange[1].toFixed(0))}
          </p>

          {answers.time < 5 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-semibold text-red-700">{c.doctorFlag}</h3>
              <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
                {c.doctorFlagBody}
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
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
            {saving ? t.assess.common.saving : t.assess.common.saveAndReturn(returnLabel)}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
