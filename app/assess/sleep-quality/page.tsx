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
  DAYTIME_TROUBLE_OPTIONS,
  DISTURBANCE_ITEMS,
  ENTHUSIASM_OPTIONS,
  MEDS_OPTIONS,
  PSQI_COMPONENTS,
  QUALITY_OPTIONS,
  computePSQI,
  emptySleepAnswers,
  interpretPSQI,
  isDisturbancesComplete,
  type SleepAnswers,
} from "@/lib/assessments/sleepQuality";

type Screen = "welcome" | "times" | "disturbances" | "quality" | "medication" | "daytime" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "times", "disturbances", "quality", "medication", "daytime", "results"];
const pillar = PILLAR_STYLES.sleep;

function ChoiceButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium ${
        selected ? "border-sleep bg-sleep-tint text-sleep-dark" : "border-border dark:border-border-dark text-ink-soft dark:text-ink-dark-soft"
      }`}
    >
      {label}
    </button>
  );
}

export default function SleepQualityPage() {
  return (
    <Suspense fallback={null}>
      <SleepQualityPageInner />
    </Suspense>
  );
}

function SleepQualityPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const t = useT();
  const c = t.assess.sleepQuality;
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<SleepAnswers>(emptySleepAnswers());
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
      speak("Sleep quality check, based on the Pittsburgh Sleep Quality Index. We'll ask about your sleep over the past month.");
    }
    if (screen === "times") {
      speak("Thinking back over the past month, tell us about your usual sleep schedule.");
    }
    if (screen === "disturbances") {
      speak("How often has each of these kept you from sleeping well in the past month?");
    }
    if (screen === "quality") {
      speak("Overall, how would you rate your sleep quality over the past month?");
    }
    if (screen === "medication") {
      speak("How often have you taken medicine to help you sleep?");
    }
    if (screen === "daytime") {
      speak("Two last questions about how your days have felt.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function set<K extends keyof SleepAnswers>(key: K, value: SleepAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const result = computePSQI(answers);
  const interpretation = interpretPSQI(result.total);

  function goToResults() {
    speak(
      `Your sleep quality score is ${result.total} out of 21. ${
        result.total <= 5 ? "This is associated with good sleep quality." : "This is associated with poor sleep quality."
      }`
    );
    setScreen("results");
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "sleep-quality", { score: result.total, status: interpretation.status });
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
          <button
            onClick={() => setScreen("times")}
            className={`mt-6 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}
          >
            {c.begin}
          </button>
        </div>
      )}

      {screen === "times" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.timesHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.timesBlurb}</p>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-ink dark:text-ink-dark">{c.bedTime}</label>
              <input
                type="time"
                value={answers.bedTime}
                onChange={(e) => set("bedTime", e.target.value)}
                className="mt-2 block rounded border border-border dark:border-border-dark px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink dark:text-ink-dark">{c.wakeTime}</label>
              <input
                type="time"
                value={answers.wakeTime}
                onChange={(e) => set("wakeTime", e.target.value)}
                className="mt-2 block rounded border border-border dark:border-border-dark px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink dark:text-ink-dark">
                {c.latencyQuestion}
              </label>
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => set("latency", Math.max(0, Math.min(240, answers.latency - 5)))}
                  className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={240}
                  step={5}
                  value={answers.latency}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    set("latency", Number.isNaN(n) ? 0 : Math.min(240, Math.max(0, n)));
                  }}
                  className="no-spinner w-14 rounded-lg border border-border bg-transparent text-center text-xl font-semibold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
                />
                <button
                  onClick={() => set("latency", Math.max(0, Math.min(240, answers.latency + 5)))}
                  className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
                >
                  +
                </button>
                <span className="text-sm text-ink-soft dark:text-ink-dark-soft">{c.latencyUnit}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink dark:text-ink-dark">
                {c.hoursQuestion}
              </label>
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => set("sleepHours", Math.max(0, Math.min(14, Math.round((answers.sleepHours - 0.5) * 2) / 2)))}
                  className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={14}
                  step={0.5}
                  value={answers.sleepHours}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    set("sleepHours", Number.isNaN(n) ? 0 : Math.min(14, Math.max(0, n)));
                  }}
                  className="no-spinner w-14 rounded-lg border border-border bg-transparent text-center text-xl font-semibold tabular-nums text-ink outline-none focus:border-primary dark:border-border-dark dark:text-ink-dark"
                />
                <button
                  onClick={() => set("sleepHours", Math.max(0, Math.min(14, Math.round((answers.sleepHours + 0.5) * 2) / 2)))}
                  className="h-10 w-10 rounded-full border border-border dark:border-border-dark text-lg"
                >
                  +
                </button>
                <span className="text-sm text-ink-soft dark:text-ink-dark-soft">{c.hoursUnit}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setScreen("disturbances")} className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white ${pillar.solidButton}`}>
            {t.assess.common.continue}
          </button>
        </div>
      )}

      {screen === "disturbances" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.disturbHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.disturbBlurb}</p>

          <div className="mt-6 flex flex-col gap-2.5">
            {DISTURBANCE_ITEMS.map((item, i) => (
              <LikertQuestionCard
                key={item.key}
                question={c.disturbances[i]}
                options={[
                  { value: 0, label: c.frequency[0] },
                  { value: 1, label: c.frequency[1] },
                  { value: 2, label: c.frequency[2] },
                  { value: 3, label: c.frequency[3] },
                ]}
                value={answers[item.key]}
                onChange={(v) => set(item.key, v)}
                style={PILLAR_STYLES.sleep}
              />
            ))}
          </div>

          <button
            onClick={() => isDisturbancesComplete(answers) && setScreen("quality")}
            disabled={!isDisturbancesComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {t.assess.common.continue}
          </button>
        </div>
      )}

      {screen === "quality" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.qualityHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.qualityBlurb}</p>

          <div className="mt-6 flex flex-col gap-2">
            {QUALITY_OPTIONS.map((opt) => (
              <ChoiceButton key={opt.value} selected={answers.q6 === opt.value} label={c.quality[opt.value]} onClick={() => set("q6", opt.value)} />
            ))}
          </div>

          <button
            onClick={() => answers.q6 !== null && setScreen("medication")}
            disabled={answers.q6 === null}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {t.assess.common.continue}
          </button>
        </div>
      )}

      {screen === "medication" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.medsHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.medsBlurb}</p>

          <div className="mt-6 flex flex-col gap-2">
            {MEDS_OPTIONS.map((opt) => (
              <ChoiceButton key={opt.value} selected={answers.q7 === opt.value} label={c.meds[opt.value]} onClick={() => set("q7", opt.value)} />
            ))}
          </div>

          <button
            onClick={() => answers.q7 !== null && setScreen("daytime")}
            disabled={answers.q7 === null}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {t.assess.common.continue}
          </button>
        </div>
      )}

      {screen === "daytime" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">{c.daytimeHeading}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{c.daytimeBlurb}</p>

          <div className="mt-6 flex flex-col gap-2.5">
            <LikertQuestionCard
              question={c.awakeQuestion}
              options={DAYTIME_TROUBLE_OPTIONS.map((o, oi) => ({ ...o, label: c.frequency[oi] }))}
              value={answers.q8}
              onChange={(v) => set("q8", v)}
              style={PILLAR_STYLES.sleep}
            />
            <LikertQuestionCard
              question={c.enthusiasmQuestion}
              options={ENTHUSIASM_OPTIONS.map((o, oi) => ({ ...o, label: c.problem[oi] }))}
              value={answers.q9}
              onChange={(v) => set("q9", v)}
              style={PILLAR_STYLES.sleep}
            />
          </div>

          <button
            onClick={() => answers.q8 !== null && answers.q9 !== null && goToResults()}
            disabled={answers.q8 === null || answers.q9 === null}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className={`text-[0.74rem] font-bold uppercase tracking-[0.13em] ${pillar.eyebrow}`}>{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-sleep-dark">{result.total}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">{c.globalScore}</div>
          </div>

          <p className="mt-6 rounded-full bg-sleep-tint px-3 py-1 text-center text-sm font-semibold text-sleep-dark">
            {c.result[interpretation.status].label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            {c.cutoff(Math.round(result.efficiency))}
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">{c.behindScore}</p>
          <div className="mt-2 flex flex-col gap-2">
            {PSQI_COMPONENTS.map((comp, i) => (
              <div key={comp.key} className="flex items-center gap-3">
                <span className="w-52 shrink-0 text-sm text-ink-soft dark:text-ink-dark-soft">{c.components[i]}</span>
                <div className="h-2 flex-1 rounded-full bg-border/60 dark:bg-border-dark">
                  <div className="h-2 rounded-full bg-sleep" style={{ width: `${(result[comp.key] / 3) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-ink-soft dark:text-ink-dark-soft">{result[comp.key]}/3</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">💡 {c.result[interpretation.status].title}</h3>
            <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{c.result[interpretation.status].text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">{c.nextStepsHeading}</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
              {c.result[interpretation.status].nextSteps.map((step) => (
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
