"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
import { AssessmentTopBar } from "@/components/AssessmentTopBar";
import { useAssessmentAudio } from "@/lib/assessments/speech";
import { returnLabelKeyFrom, returnPathFrom } from "@/lib/assessments/returnTo";
import { useT } from "@/lib/i18n/context";
import { PILLAR_STYLES } from "@/lib/pillarStyles";
import {
  CANCER_TYPES,
  FAMILY_HISTORY_KEYS,
  emptyFamilyHistoryAnswers,
  isFamilyHistoryComplete,
  summarizeFamilyHistory,
  type CancerType,
  type FamilyHistoryAnswers,
  type Sex,
} from "@/lib/assessments/familyHistory";

type Screen = "welcome" | "questions" | "results";
const SCREEN_ORDER: Screen[] = ["welcome", "questions", "results"];
const pillar = PILLAR_STYLES.healthrisk;

const FLAG_STYLES: Record<string, string> = {
  none: "bg-border/40 text-ink-soft dark:bg-border-dark dark:text-ink-dark-soft",
  present: "bg-healthrisk-tint text-healthrisk-dark",
  elevated: "bg-red-100 text-red-700",
};
export default function FamilyHistoryPage() {
  return (
    <Suspense fallback={null}>
      <FamilyHistoryPageInner />
    </Suspense>
  );
}

function FamilyHistoryPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = returnPathFrom(searchParams.get("from"), searchParams.get("day"));
  const returnLabelKey = returnLabelKeyFrom(searchParams.get("from"));
  const t = useT();
  const c = t.assess.familyHistory;
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(searchParams.get("retake") === "1" ? "questions" : "welcome");
  const [answers, setAnswers] = useState<FamilyHistoryAnswers>(emptyFamilyHistoryAnswers());
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
      speak("Family history: know your risk. A few short questions to map your inherited risk.");
    }
    if (screen === "questions") {
      speak(
        "First, your sex — this helps us apply the right cardiovascular threshold. Then, for each category, tell us if a first-degree relative has been diagnosed, and at what age if you know it."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

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

  const summary = summarizeFamilyHistory(answers, c);

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
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">
            {c.questionsBlurb}
          </p>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
            <h3 className="font-semibold text-ink dark:text-ink-dark">{c.yourSex}</h3>
            <p className="mt-1 text-xs text-ink-soft dark:text-ink-dark-soft">
              {c.sexNote}
            </p>
            <div className="mt-3 flex gap-2">
              {(["male", "female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize ${
                    answers.sex === s ? "border-healthrisk bg-healthrisk-tint text-healthrisk-dark" : "border-border text-ink-soft"
                  }`}
                >
                  {s === "male" ? c.male : c.female}
                </button>
              ))}
            </div>
          </div>

          {FAMILY_HISTORY_KEYS.map((key) => {
            const d = answers[key];
            return (
              <div key={key} className="mt-4 rounded-lg border border-border dark:border-border-dark p-4">
                <h3 className="font-semibold text-ink dark:text-ink-dark">{c.categories[key].title}</h3>
                <p className="mt-1 text-xs text-ink-soft dark:text-ink-dark-soft">{c.categories[key].sub}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setHas(key, true)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                      d.has === true ? "border-healthrisk bg-healthrisk-tint text-healthrisk-dark" : "border-border text-ink-soft"
                    }`}
                  >
                    {c.yes}
                  </button>
                  <button
                    onClick={() => setHas(key, false)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                      d.has === false ? "border-healthrisk bg-healthrisk-tint text-healthrisk-dark" : "border-border text-ink-soft"
                    }`}
                  >
                    {c.no}
                  </button>
                </div>

                {d.has && (
                  <div className="mt-3 border-t border-border dark:border-border-dark pt-3">
                    <label className="text-xs text-ink-soft dark:text-ink-dark-soft">
                      {c.ageLabel}
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={110}
                      value={d.age ?? ""}
                      onChange={(e) => setAge(key, e.target.value === "" ? null : parseInt(e.target.value, 10))}
                      className="mt-1 w-24 rounded border border-border dark:border-border-dark px-2 py-1 text-center"
                    />
                  </div>
                )}

                {key === "cancer" && d.has && (
                  <div className="mt-3 border-t border-border dark:border-border-dark pt-3">
                    <label className="text-xs text-ink-soft dark:text-ink-dark-soft">{c.cancerTypeLabel}</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CANCER_TYPES.map((typeKey) => (
                        <button
                          key={typeKey}
                          onClick={() => setCancerType(typeKey)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                            answers.cancer.type === typeKey
                              ? "border-healthrisk bg-healthrisk-tint text-healthrisk-dark"
                              : "border-border text-ink-soft"
                          }`}
                        >
                          {c.cancerTypes[typeKey]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() => {
              if (!isFamilyHistoryComplete(answers)) return;
              speak(
                summary.flaggedCount === 0
                  ? "No family history flagged in any category."
                  : `${summary.flaggedCount} of 4 categories show family history.`
              );
              setScreen("results");
            }}
            disabled={!isFamilyHistoryComplete(answers)}
            className={`mt-8 w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50 ${pillar.solidButton}`}
          >
            {c.seeResults}
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-healthrisk-dark">{t.assess.common.yourResult}</p>
          <div className="mt-2 text-center">
            <div className="text-4xl font-bold text-healthrisk-dark">{summary.flaggedCount}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">
              {c.flaggedCaption(summary.elevatedCount)}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {FAMILY_HISTORY_KEYS.map((key) => {
              const r = summary.results[key];
              return (
                <div key={key} className="rounded-lg border border-border dark:border-border-dark p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-ink dark:text-ink-dark">{c.categories[key].title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${FLAG_STYLES[r.level]}`}>
                      {c.flags[r.level]}
                    </span>
                  </div>
                  {r.source && (
                    <p className="mt-2 inline-block rounded-full border border-border dark:border-border-dark bg-paper px-2 py-0.5 text-xs font-semibold text-ink-soft dark:bg-white/5 dark:text-ink-dark-soft">
                      {r.source}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-ink-soft dark:text-ink-dark-soft">{r.text}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
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
