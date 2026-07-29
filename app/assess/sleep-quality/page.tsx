"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
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
        selected ? "border-primary bg-primary-light text-primary-dark" : "border-neutral-300 text-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}

function PillRow({
  options,
  value,
  onChange,
}: {
  options: { value: number; label: string }[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
            value === opt.value ? "border-primary bg-primary-light text-primary-dark" : "border-neutral-300 text-neutral-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SleepQualityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<SleepAnswers>(emptySleepAnswers());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/signin");
        return;
      }
      setUserId(user.id);
    });
  }, [router]);

  function set<K extends keyof SleepAnswers>(key: K, value: SleepAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const result = computePSQI(answers);
  const interpretation = interpretPSQI(result.total);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "sleep-quality", { score: result.total });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      {screen === "welcome" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Sleep Check · ~5 minutes</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Sleep Quality Check</h1>
          <p className="mt-3 text-neutral-600">
            This check is based on the Pittsburgh Sleep Quality Index (PSQI), one of the most
            widely used sleep questionnaires in research and clinical care.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            You&apos;ll answer a few questions about your sleep over the past month — when you go
            to bed, how long you sleep, and how often certain things disturb your rest.
          </p>
          <button
            onClick={() => setScreen("times")}
            className="mt-6 rounded bg-primary px-4 py-2 font-medium text-white"
          >
            Let&apos;s begin
          </button>
        </div>
      )}

      {screen === "times" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Thinking back over the past month…</h2>
          <p className="mt-1 text-sm text-neutral-500">Answer for a typical night — there&apos;s no need to be exact.</p>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-neutral-800">What time have you usually gone to bed?</label>
              <input
                type="time"
                value={answers.bedTime}
                onChange={(e) => set("bedTime", e.target.value)}
                className="mt-2 block rounded border border-neutral-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">What time have you usually got up in the morning?</label>
              <input
                type="time"
                value={answers.wakeTime}
                onChange={(e) => set("wakeTime", e.target.value)}
                className="mt-2 block rounded border border-neutral-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">
                How long has it usually taken you to fall asleep, in minutes?
              </label>
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => set("latency", Math.max(0, Math.min(240, answers.latency - 5)))}
                  className="h-10 w-10 rounded-full border border-neutral-300 text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center text-xl font-semibold tabular-nums">{answers.latency}</span>
                <button
                  onClick={() => set("latency", Math.max(0, Math.min(240, answers.latency + 5)))}
                  className="h-10 w-10 rounded-full border border-neutral-300 text-lg"
                >
                  +
                </button>
                <span className="text-sm text-neutral-500">minutes to fall asleep</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">
                How many hours of actual sleep did you usually get at night? (this may be less than
                time in bed)
              </label>
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => set("sleepHours", Math.max(0, Math.min(14, Math.round((answers.sleepHours - 0.5) * 2) / 2)))}
                  className="h-10 w-10 rounded-full border border-neutral-300 text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center text-xl font-semibold tabular-nums">{answers.sleepHours}</span>
                <button
                  onClick={() => set("sleepHours", Math.max(0, Math.min(14, Math.round((answers.sleepHours + 0.5) * 2) / 2)))}
                  className="h-10 w-10 rounded-full border border-neutral-300 text-lg"
                >
                  +
                </button>
                <span className="text-sm text-neutral-500">hours of actual sleep</span>
              </div>
            </div>
          </div>

          <button onClick={() => setScreen("disturbances")} className="mt-8 rounded bg-primary px-4 py-2 font-medium text-white">
            Continue
          </button>
        </div>
      )}

      {screen === "disturbances" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">How often has this kept you from sleeping well?</h2>
          <p className="mt-1 text-sm text-neutral-500">For each one, choose how often it happened in the past month.</p>

          <div className="mt-6 flex flex-col gap-5">
            {DISTURBANCE_ITEMS.map((item) => (
              <div key={item.key}>
                <p className="text-sm font-medium text-neutral-800">{item.text}</p>
                <PillRow
                  options={[
                    { value: 0, label: "Never" },
                    { value: 1, label: "<1x/wk" },
                    { value: 2, label: "1–2x/wk" },
                    { value: 3, label: "3+/wk" },
                  ]}
                  value={answers[item.key]}
                  onChange={(v) => set(item.key, v)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => isDisturbancesComplete(answers) && setScreen("quality")}
            disabled={!isDisturbancesComplete(answers)}
            className="mt-8 rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {screen === "quality" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Overall, how would you rate your sleep quality?</h2>
          <p className="mt-1 text-sm text-neutral-500">Thinking about the past month as a whole.</p>

          <div className="mt-6 flex flex-col gap-2">
            {QUALITY_OPTIONS.map((opt) => (
              <ChoiceButton key={opt.value} selected={answers.q6 === opt.value} label={opt.label} onClick={() => set("q6", opt.value)} />
            ))}
          </div>

          <button
            onClick={() => answers.q6 !== null && setScreen("medication")}
            disabled={answers.q6 === null}
            className="mt-8 rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {screen === "medication" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">How often have you taken medicine to help you sleep?</h2>
          <p className="mt-1 text-sm text-neutral-500">Prescribed or over-the-counter — either counts.</p>

          <div className="mt-6 flex flex-col gap-2">
            {MEDS_OPTIONS.map((opt) => (
              <ChoiceButton key={opt.value} selected={answers.q7 === opt.value} label={opt.label} onClick={() => set("q7", opt.value)} />
            ))}
          </div>

          <button
            onClick={() => answers.q7 !== null && setScreen("daytime")}
            disabled={answers.q7 === null}
            className="mt-8 rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {screen === "daytime" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Two last questions</h2>
          <p className="mt-1 text-sm text-neutral-500">How the past month felt during the day.</p>

          <div className="mt-6 flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                How often have you had trouble staying awake while driving, eating meals, or being
                social?
              </p>
              <PillRow options={DAYTIME_TROUBLE_OPTIONS} value={answers.q8} onChange={(v) => set("q8", v)} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                How much of a problem has it been to keep up enough enthusiasm to get things done?
              </p>
              <PillRow options={ENTHUSIASM_OPTIONS} value={answers.q9} onChange={(v) => set("q9", v)} />
            </div>
          </div>

          <button
            onClick={() => answers.q8 !== null && answers.q9 !== null && setScreen("results")}
            disabled={answers.q8 === null || answers.q9 === null}
            className="mt-8 rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            See my results
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-primary-dark">{result.total}</div>
            <div className="text-sm font-medium text-neutral-500">PSQI global score (0–21, lower is better)</div>
          </div>

          <p className="mt-6 rounded-full bg-primary-light px-3 py-1 text-center text-sm font-semibold text-primary-dark">
            {interpretation.label}
          </p>

          <p className="mt-4 text-xs text-neutral-400">
            A score of 5 or below is associated with good sleep quality; above 5 is associated with
            poor sleep quality (Buysse et al., 1989). Your sleep efficiency: {Math.round(result.efficiency)}%.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">What&apos;s behind your score</p>
          <div className="mt-2 flex flex-col gap-2">
            {PSQI_COMPONENTS.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                <span className="w-52 shrink-0 text-sm text-neutral-700">{c.label}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(result[c.key] / 3) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-neutral-500">{result[c.key]}/3</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">💡 {interpretation.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{interpretation.text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">✅ Suggested next steps</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
              {interpretation.nextSteps.map((step) => (
                <li key={step} className="mt-1">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            This is a wellness screening tool based on a published research questionnaire, not a
            medical diagnosis. If sleep problems are affecting your daily life, it&apos;s worth
            discussing with your doctor.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & return to dashboard"}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
