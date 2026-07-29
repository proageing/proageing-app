"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import {
  CANCER_TYPE_OPTIONS,
  FAMILY_HISTORY_CATEGORIES,
  emptyFamilyHistoryAnswers,
  isFamilyHistoryComplete,
  summarizeFamilyHistory,
  type CancerType,
  type FamilyHistoryAnswers,
  type Sex,
} from "@/lib/assessments/familyHistory";

type Screen = "welcome" | "questions" | "results";

const FLAG_STYLES: Record<string, string> = {
  none: "bg-neutral-100 text-neutral-500",
  present: "bg-primary-light text-primary-dark",
  elevated: "bg-red-100 text-red-700",
};
const FLAG_LABELS: Record<string, string> = {
  none: "No flag",
  present: "Family history",
  elevated: "Elevated — early onset",
};

export default function FamilyHistoryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<FamilyHistoryAnswers>(emptyFamilyHistoryAnswers());
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

  function setSex(sex: Sex) {
    setAnswers((prev) => ({ ...prev, sex }));
  }

  function setHas(key: "cvd" | "cancer" | "neuro" | "metabolic", has: boolean) {
    setAnswers((prev) => ({
      ...prev,
      [key]: { ...prev[key], has, age: has ? prev[key].age : null, ...(key === "cancer" && !has ? { type: null } : {}) },
    }));
  }

  function setAge(key: "cvd" | "cancer" | "neuro" | "metabolic", age: number | null) {
    setAnswers((prev) => ({ ...prev, [key]: { ...prev[key], age } }));
  }

  function setCancerType(type: CancerType) {
    setAnswers((prev) => ({ ...prev, cancer: { ...prev.cancer, type } }));
  }

  const summary = summarizeFamilyHistory(answers);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "family-history", {
      elevated_count: summary.flaggedCount,
      early_onset_count: summary.elevatedCount,
      answers,
    });
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
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Family History · ~2 minutes</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Family History: Know Your Risk</h1>
          <p className="mt-3 text-neutral-600">
            Knowing your family's medical history tells you which risks to watch most closely.
            Answer a few short questions to map your inherited risk across the main categories
            that run in families — then share the answers with your doctor to guide earlier,
            smarter screening.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            Wherever Singapore-specific guidance exists (MOH Clinical Practice Guidelines), we use
            it — it's often stricter or differently calibrated than international guidelines.
            Where it doesn't, we fall back to international standards, and say so.
          </p>
          <button
            onClick={() => setScreen("questions")}
            className="mt-6 rounded bg-primary px-4 py-2 font-medium text-white"
          >
            Let&apos;s begin
          </button>
        </div>
      )}

      {screen === "questions" && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Has this run in your family?</h2>
          <p className="mt-1 text-sm text-neutral-500">
            For each category, tell us if a first-degree relative (parent, sibling, or child) has
            been diagnosed — and at what age, if you know it.
          </p>

          <div className="mt-6 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">Your sex</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Used only to apply the right cardiovascular screening threshold (Singapore MOH:
              male &lt;50, female &lt;60).
            </p>
            <div className="mt-3 flex gap-2">
              {(["male", "female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize ${
                    answers.sex === s ? "border-primary bg-primary-light text-primary-dark" : "border-neutral-300 text-neutral-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {FAMILY_HISTORY_CATEGORIES.map(({ key, title, sub }) => {
            const d = answers[key];
            return (
              <div key={key} className="mt-4 rounded-lg border border-neutral-200 p-4">
                <h3 className="font-semibold text-neutral-900">{title}</h3>
                <p className="mt-1 text-xs text-neutral-500">{sub}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setHas(key, true)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                      d.has === true ? "border-primary bg-primary-light text-primary-dark" : "border-neutral-300 text-neutral-600"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHas(key, false)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                      d.has === false ? "border-primary bg-primary-light text-primary-dark" : "border-neutral-300 text-neutral-600"
                    }`}
                  >
                    No
                  </button>
                </div>

                {d.has && (
                  <div className="mt-3 border-t border-neutral-200 pt-3">
                    <label className="text-xs text-neutral-500">
                      Age of the youngest relative when diagnosed (your best estimate is fine)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={110}
                      value={d.age ?? ""}
                      onChange={(e) => setAge(key, e.target.value === "" ? null : parseInt(e.target.value, 10))}
                      className="mt-1 w-24 rounded border border-neutral-300 px-2 py-1 text-center"
                    />
                  </div>
                )}

                {key === "cancer" && d.has && (
                  <div className="mt-3 border-t border-neutral-200 pt-3">
                    <label className="text-xs text-neutral-500">Which type, mainly? (pick the one you know best)</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CANCER_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setCancerType(opt.value)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                            answers.cancer.type === opt.value
                              ? "border-primary bg-primary-light text-primary-dark"
                              : "border-neutral-300 text-neutral-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() => isFamilyHistoryComplete(answers) && setScreen("results")}
            disabled={!isFamilyHistoryComplete(answers)}
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
            <div className="text-4xl font-bold text-primary-dark">{summary.flaggedCount}</div>
            <div className="text-sm font-medium text-neutral-500">
              of 4 categories show family history
              {summary.elevatedCount > 0 ? ` (${summary.elevatedCount} early-onset)` : ""}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {FAMILY_HISTORY_CATEGORIES.map(({ key, title }) => {
              const r = summary.results[key];
              return (
                <div key={key} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-neutral-900">{title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${FLAG_STYLES[r.level]}`}>
                      {FLAG_LABELS[r.level]}
                    </span>
                  </div>
                  {r.source && (
                    <p className="mt-2 inline-block rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-semibold text-neutral-500">
                      {r.source}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-neutral-600">{r.text}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
                    {r.steps.map((step) => (
                      <li key={step} className="mt-1">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            This is an informational screening tool, not a diagnosis. Only a doctor can properly
            assess your personal and family risk — please share these answers with them,
            especially for any category flagged above.
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
