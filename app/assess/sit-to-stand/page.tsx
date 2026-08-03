"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
  emptySitToStandAnswers,
  getNormRange,
  interpretSitToStand,
  isSafetyComplete,
  isUnsafe,
  type AgeBand,
  type Sex,
  type SitToStandAnswers,
} from "@/lib/assessments/sitToStand";

type Screen = "welcome" | "check" | "unsafe" | "setup" | "test" | "count" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "check", "setup", "test", "count", "results"];
const pillar = PILLAR_STYLES.primary;

export default function SitToStandPage() {
  return (
    <Suspense fallback={null}>
      <SitToStandPageInner />
    </Suspense>
  );
}

function SitToStandPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const [userId, setUserId] = useState<string | null>(null);
  const t = useT();
  const c = t.assess.sitToStand;
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<SitToStandAnswers>(emptySitToStandAnswers());
  const [timeLeft, setTimeLeft] = useState(30);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      speak("Sit to stand check. This measures the strength in your legs and hips. Let's begin when you're ready.");
    }
    if (screen === "check") {
      speak("Two quick safety questions before we start.");
    }
    if (screen === "setup") {
      speak(
        "Set up your chair against a wall or in a corner. Sit towards the front edge, feet flat, and cross your arms over your chest. Watch it loop once, then try a slow practice rep yourself."
      );
    }
    if (screen === "unsafe") {
      speak("Let's hold off on the test today. Please check with your doctor first, and come back whenever you're ready.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  useEffect(() => {
    if (screen !== "test") return;
    setTimeLeft(30);
    speak("Go — as many full stands as you can.");
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 16) speak("Halfway there. Keep going.");
        if (prev === 6) speak("Five seconds left.");
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          speak("Time's up. How many full stands did you complete? Type your count, or use the plus and minus buttons.");
          setScreen("count");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function handleCheckContinue() {
    if (isUnsafe(answers)) {
      setScreen("unsafe");
      return;
    }
    setScreen("setup");
  }

  const result = answers.sex && answers.age ? interpretSitToStand(answers.reps, answers.sex, answers.age) : null;
  const normRange = answers.sex && answers.age ? getNormRange(answers.sex, answers.age) : null;

  function goToResults() {
    if (normRange) {
      const [lo, hi] = normRange;
      const comparison =
        answers.reps < lo
          ? "This is below the typical range for your age group."
          : answers.reps > hi
            ? "This is above the typical range for your age group."
            : "This is within the typical range for your age group.";
      speak(`You completed ${answers.reps} stands. ${comparison}`);
    }
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    // Age band and sex go with the score — the Rikli & Jones norms this
    // check is scored against differ by both, so a bare rep count can't
    // be interpreted later.
    const { error } = await saveAssessmentResult(userId, "sit-to-stand", {
      score: answers.reps,
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
              {c.chairQuestion}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, chairReady: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.chairReady === true ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.chairYes}
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, chairReady: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.chairReady === false ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.chairNo}
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
                  answers.safe === true ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.safeYes}
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === false ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                {c.safeNo}
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            {c.compareNote}
          </p>
          <div className="mt-2 flex gap-2">
            {([60, 70, 80] as AgeBand[]).map((band) => (
              <button
                key={band}
                onClick={() => setAnswers((p) => ({ ...p, age: band }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.age === band ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                {band === 80 ? "80+" : `${band}–${band + 9}`}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {(["f", "m"] as Sex[]).map((s) => (
              <button
                key={s}
                onClick={() => setAnswers((p) => ({ ...p, sex: s }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.sex === s ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                {s === "f" ? c.female : c.male}
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

          <div className="mt-4 overflow-hidden rounded-2xl bg-primary-light dark:bg-primary-light-dark">
            <video autoPlay loop muted playsInline className="block h-auto w-full">
              <source src="/sit-to-stand-demo.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-primary-dark">
            {c.watchLoop}
          </p>

          <ol className="mt-6 flex flex-col gap-4">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark">1</span>
              <span>
                <strong className="text-ink dark:text-ink-dark">{c.setup1Strong}</strong>{" "}
                <span className="text-ink-soft dark:text-ink-dark-soft">{c.setup1}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark">2</span>
              <span>
                <strong className="text-ink dark:text-ink-dark">{c.setup2Strong}</strong>{" "}
                <span className="text-ink-soft dark:text-ink-dark-soft">{c.setup2}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark">3</span>
              <span>
                <strong className="text-ink dark:text-ink-dark">{c.setup3Strong}</strong>{" "}
                <span className="text-ink-soft dark:text-ink-dark-soft">{c.setup3}</span>
              </span>
            </li>
          </ol>
          <p className="mt-6 text-sm text-ink-soft dark:text-ink-dark-soft">
            {c.setupBody}
          </p>
          <button onClick={() => setScreen("test")} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            {c.ready}
          </button>
        </div>
      )}

      {screen === "test" && (
        <div className="flex flex-col items-center text-center">
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{c.timeRemaining}</p>
          <div className="mt-4 text-7xl font-bold tabular-nums text-primary-dark">{timeLeft}</div>
          <p className="mt-4 text-ink-soft dark:text-ink-dark-soft">
            {timeLeft > 15 ? c.go : timeLeft > 5 ? c.halfway : c.almostDone}
          </p>
          <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
            {c.countInHead}
          </p>
          <button
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setScreen("welcome");
            }}
            className="mt-8 rounded border border-red-300 px-4 py-2 font-medium text-red-600"
          >
            {c.stopRest}
          </button>
        </div>
      )}

      {screen === "count" && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{c.timesUp}</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.howMany}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.countOnlyFull}</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setAnswers((p) => ({ ...p, reps: Math.max(0, p.reps - 1) }))}
              className="h-12 w-12 shrink-0 rounded-full border border-border dark:border-border-dark text-xl"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={answers.reps}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setAnswers((p) => ({ ...p, reps: Number.isNaN(n) ? 0 : Math.min(60, Math.max(0, n)) }));
              }}
              className="no-spinner w-20 rounded-lg border border-border bg-transparent text-center text-4xl font-bold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
            />
            <button
              onClick={() => setAnswers((p) => ({ ...p, reps: Math.min(60, p.reps + 1) }))}
              className="h-12 w-12 shrink-0 rounded-full border border-border dark:border-border-dark text-xl"
            >
              +
            </button>
          </div>

          <button onClick={goToResults} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && result && normRange && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-primary-dark">{answers.reps}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.standsIn30}</div>
          </div>

          <p className="mt-6 rounded-full bg-primary-tint px-3 py-1 text-center text-sm font-semibold text-primary-dark">
            {c.result[result.status].label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.typicalRange(normRange[0], normRange[1])}
          </p>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {c.result[result.status].title}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{c.result[result.status].text}</p>
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
