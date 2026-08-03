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
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Balance Check · ~2 minutes</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Balance Check</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            This check uses the One-Leg Standing Test (eyes open) — how long you can balance on
            one leg with your eyes open — one of the most studied, self-testable markers of fall
            risk, with reference values from a pooled study of 4,683 older Japanese adults (Seino
            et al., 2014).
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            Balance naturally changes with age, and this simple test tracks it well: one large
            study found impaired one-leg balance was the strongest independent predictor of
            injurious falls in older adults (Vellas et al., 1997).
          </p>
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">⚠️ Please read before starting</h3>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
              This involves real balancing — only attempt it if you feel steady today, right next
              to a wall, counter, or sturdy furniture you can grab.
            </p>
          </div>
          <button onClick={() => setScreen("check")} className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            Let&apos;s begin
          </button>
        </div>
      )}

      {screen === "check" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">Two quick safety questions</h2>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">
              Do you have a wall, counter, or sturdy furniture within arm&apos;s reach right now?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, hasSupport: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.hasSupport === true ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                Yes, ready
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, hasSupport: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.hasSupport === false ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                Not yet
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">
              Right now, are you free of dizziness, a recent fall, or an injury that would make
              balancing on one leg unsafe?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === true ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                Yes, I&apos;m fine
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === false ? "border-strength bg-strength-tint text-strength-dark" : "border-border text-ink-soft"
                }`}
              >
                Not today
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            Just so we can compare your result fairly
          </p>
          <div className="mt-2 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">Your age</p>
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
              <span className="text-sm text-ink-soft dark:text-ink-dark-soft">years</span>
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
                {s === "m" ? "Male" : "Female"}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckContinue}
            disabled={!isSafetyComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            Continue
          </button>
        </div>
      )}

      {screen === "unsafe" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Let&apos;s hold off</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">We&apos;ll skip the test for today</h2>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            Balancing on one leg isn&apos;t a good idea right now without a clear support surface
            nearby, or while dealing with dizziness, a recent fall, or an injury. Please set up
            somewhere safer, or check with your doctor first.
          </p>
          <button onClick={() => setScreen("welcome")} className="mt-6 rounded border border-border dark:border-border-dark px-4 py-2 font-medium text-ink-soft dark:text-ink-dark-soft">
            Not now
          </button>
        </div>
      )}

      {screen === "setup" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">Get ready to balance</h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-ink-soft dark:text-ink-dark-soft">
            <li>
              Stand <strong>barefoot or in socks</strong>, right next to your support.
            </li>
            <li>
              <strong>Hands on hips</strong>, <strong>eyes open</strong>, looking at a fixed point
              ahead.
            </li>
            <li>
              Lift either foot a few inches off the floor and tap <strong>Start</strong>.
            </li>
            <li>
              Tap <strong>Stop</strong> the moment your foot touches down, you shift, or your hands
              leave your hips.
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4 text-sm text-ink-soft dark:text-ink-dark-soft">
            We&apos;ll time up to 60 seconds — that&apos;s the cap used in the research, so
            there&apos;s no need to go on longer.
          </div>
          <button onClick={startTest} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            I&apos;m ready
          </button>
        </div>
      )}

      {screen === "test" && (
        <div className="flex flex-col items-center text-center">
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Balancing now</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">
            {running ? "Balancing… tap Stop when you touch down" : "Tap Start when your foot lifts off"}
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
            {running ? "Stop" : "Start"}
          </button>
        </div>
      )}

      {screen === "results" && result && normRange && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-strength-dark">{answers.time.toFixed(1)}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">seconds balanced</div>
          </div>

          <p className="mt-6 rounded-full bg-strength-tint px-3 py-1 text-center text-sm font-semibold text-strength-dark">
            {result.label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            Typical range for your age & sex: {normRange[0].toFixed(0)}–{normRange[1].toFixed(0)}s
            (illustrative reference, Seino et al., 2014).
          </p>

          {answers.time < 5 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-semibold text-red-700">⚠️ Worth mentioning to your doctor</h3>
              <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
                Holding a one-leg stance for less than 5 seconds has been linked to a significantly
                higher risk of injurious falls (Vellas et al., 1997). This is a signal worth
                following up on, not a diagnosis.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
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
            This is an educational screening check, not a diagnosis. If you felt very unsteady
            during this test, please mention it to your doctor, and consider having someone nearby
            the next time you try.
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
