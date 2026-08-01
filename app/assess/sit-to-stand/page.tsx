"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
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
  const returnTo = returnPathFrom(searchParams.get("from"));
  const returnLabel = returnLabelFrom(searchParams.get("from"));
  const [userId, setUserId] = useState<string | null>(null);
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
        router.push("/signin");
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
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Physical Function Check · ~4 minutes</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Sit-to-Stand Check</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            This test measures the strength in your legs and hips — the muscles you use every day
            to get up from a chair, climb stairs, or catch your balance.
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            You&apos;ll stand up and sit down from a chair as many times as you can in 30 seconds.
            No equipment needed beyond a sturdy chair.
          </p>
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
              Do you have a sturdy chair with no wheels, that won&apos;t slide when you sit or stand?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, chairReady: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.chairReady === true ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                Yes, ready
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, chairReady: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.chairReady === false ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                Not yet
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <p className="font-medium text-ink dark:text-ink-dark">
              Right now, are you free of pain, dizziness, or a recent injury that would make
              standing up repeatedly unsafe?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: true }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === true ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                Yes, I&apos;m fine
              </button>
              <button
                onClick={() => setAnswers((p) => ({ ...p, safe: false }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  answers.safe === false ? "border-primary bg-primary-tint text-primary-dark" : "border-border text-ink-soft"
                }`}
              >
                Not today
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            Just so we can compare your result fairly
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
                {s === "f" ? "Female" : "Male"}
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
            Standing up repeatedly isn&apos;t a good idea while you&apos;re dealing with pain,
            dizziness, or a recent injury, or without a chair that won&apos;t slide. Please check
            with your doctor first, or get set up safely — we&apos;ll be right here whenever
            you&apos;re ready to try.
          </p>
          <button onClick={() => setScreen("welcome")} className="mt-6 rounded border border-border dark:border-border-dark px-4 py-2 font-medium text-ink-soft dark:text-ink-dark-soft">
            Not now
          </button>
        </div>
      )}

      {screen === "setup" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">Set up your chair like this</h2>

          <div className="mt-4 overflow-hidden rounded-2xl bg-primary-light dark:bg-primary-light-dark">
            <video autoPlay loop muted playsInline className="block h-auto w-full">
              <source src="/sit-to-stand-demo.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-primary-dark">
            Watch it loop once, then try a slow practice rep yourself.
          </p>

          <ol className="mt-6 flex flex-col gap-4">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark">1</span>
              <span>
                <strong className="text-ink dark:text-ink-dark">Back against a wall.</strong>{" "}
                <span className="text-ink-soft dark:text-ink-dark-soft">Or push it into a corner so it can&apos;t slide.</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark">2</span>
              <span>
                <strong className="text-ink dark:text-ink-dark">Sit towards the front edge.</strong>{" "}
                <span className="text-ink-soft dark:text-ink-dark-soft">Feet flat on the floor, about shoulder-width apart.</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark">3</span>
              <span>
                <strong className="text-ink dark:text-ink-dark">Cross your arms over your chest.</strong>{" "}
                <span className="text-ink-soft dark:text-ink-dark-soft">No pushing off with your hands or the chair arms.</span>
              </span>
            </li>
          </ol>
          <p className="mt-6 text-sm text-ink-soft dark:text-ink-dark-soft">
            In the real check, do as many full stands as you can in 30 seconds. Full stand, full
            sit, that&apos;s one rep. Just count each one in your head — no need to touch your
            phone while you&apos;re moving. We&apos;ll ask for your total once the timer ends.
          </p>
          <button onClick={() => setScreen("test")} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            I&apos;m ready
          </button>
        </div>
      )}

      {screen === "test" && (
        <div className="flex flex-col items-center text-center">
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Time remaining</p>
          <div className="mt-4 text-7xl font-bold tabular-nums text-primary-dark">{timeLeft}</div>
          <p className="mt-4 text-ink-soft dark:text-ink-dark-soft">
            {timeLeft > 15 ? "Go — as many full stands as you can." : timeLeft > 5 ? "Halfway there — keep going." : "Almost done."}
          </p>
          <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">
            🧠 Count each full stand in your head. No need to touch your phone — we&apos;ll ask for
            your total when time&apos;s up.
          </p>
          <button
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setScreen("welcome");
            }}
            className="mt-8 rounded border border-red-300 px-4 py-2 font-medium text-red-600"
          >
            Stop — I need to rest
          </button>
        </div>
      )}

      {screen === "count" && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Time&apos;s up</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink dark:text-ink-dark">How many did you complete?</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">Count only full stands — all the way up, all the way back down.</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setAnswers((p) => ({ ...p, reps: Math.max(0, p.reps - 1) }))}
              className="h-12 w-12 rounded-full border border-border dark:border-border-dark text-xl"
            >
              −
            </button>
            <span className="w-16 text-center text-4xl font-bold tabular-nums">{answers.reps}</span>
            <button
              onClick={() => setAnswers((p) => ({ ...p, reps: Math.min(60, p.reps + 1) }))}
              className="h-12 w-12 rounded-full border border-border dark:border-border-dark text-xl"
            >
              +
            </button>
          </div>

          <button onClick={goToResults} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            See my results
          </button>
        </div>
      )}

      {screen === "results" && result && normRange && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-primary-dark">{answers.reps}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">full stands in 30 seconds</div>
          </div>

          <p className="mt-6 rounded-full bg-primary-tint px-3 py-1 text-center text-sm font-semibold text-primary-dark">
            {result.label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            Typical range for your group: {normRange[0]}–{normRange[1]} stands (illustrative
            reference, Rikli & Jones Senior Fitness Test).
          </p>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {result.title}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{result.text}</p>
          </div>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            This is an educational screening check, not a diagnosis. If you felt very unsteady
            during this test, please mention it to your doctor.
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
