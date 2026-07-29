"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
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

export default function CognitiveDeclinePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<CognitiveAnswers>(emptyCognitiveAnswers());
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

  function setAnswer(key: keyof CognitiveAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeSLASScore(answers);
  const result = interpretSLASScore(score.total);
  const componentMeta = cognitiveComponentMeta(score.cardioCount);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "cognitive-decline", { score: score.total });
    setSaving(false);
    if (error) {
      setSaveStatus(`Couldn't save: ${error}`);
      return;
    }
    router.push("/dashboard");
  }

  let lastSection = "";

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      {screen === "welcome" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Cognitive Health Check · ~3 minutes</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Cognitive Decline Risk Check</h1>
          <p className="mt-3 text-neutral-600">
            This check uses the SLAS Risk Index, developed and validated by the Singapore
            Longitudinal Ageing Study (Ng et al., 2021). It&apos;s a short, self-reported
            checklist of 10 personal, lifestyle and health factors shown to predict a person&apos;s
            3–5 year risk of mild cognitive impairment (MCI) or dementia.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            It was field-tested with over 400 community-living older adults in Singapore to
            identify who would benefit most from early lifestyle support — the same approach
            we&apos;re using here.
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
          <h2 className="text-xl font-semibold text-neutral-900">Tell us about yourself</h2>
          <p className="mt-1 text-sm text-neutral-500">
            These are the same questions used in the original research checklist. There are no
            right or wrong answers — just answer as accurately as you can.
          </p>

          <div className="mt-6 flex flex-col gap-6">
            {COGNITIVE_QUESTIONS.map((q) => {
              const showSection = q.section !== lastSection;
              lastSection = q.section;
              return (
                <div key={q.key}>
                  {showSection && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{q.section}</p>
                  )}
                  <p className="font-medium text-neutral-800">{q.question}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.opts.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAnswer(q.key, opt.value)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                          answers[q.key] === opt.value
                            ? "border-primary bg-primary-light text-primary-dark"
                            : "border-neutral-300 text-neutral-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => isCognitiveComplete(answers) && setScreen("results")}
            disabled={!isCognitiveComplete(answers)}
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
            <div className="text-5xl font-bold text-primary-dark">{score.total}</div>
            <div className="text-sm font-medium text-neutral-500">risk index score · higher means higher risk</div>
          </div>

          <p className="mt-6 rounded-full bg-primary-light px-3 py-1 text-center text-sm font-semibold text-primary-dark">
            {result.label}
          </p>

          <p className="mt-4 text-xs text-neutral-400">
            Score {score.total} of 13. In the original research, scores under 6 were linked to
            under 10% predicted risk; 6–7 was the study&apos;s screening threshold; 8 and above
            showed a clinically meaningful drop in cognitive test scores.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">What&apos;s behind your score</p>
          <div className="mt-2 flex flex-col gap-2">
            {componentMeta.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                <span className="w-56 shrink-0 text-sm text-neutral-700">{c.label}</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(score.parts[c.key] / c.max) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-sm text-neutral-500">
                  {score.parts[c.key]}/{c.max}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">💡 {result.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{result.text}</p>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">✅ Suggested next steps</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
              {result.nextSteps.map((step) => (
                <li key={step} className="mt-1">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            This is a research-based screening tool, not a diagnosis. Only a doctor can assess
            memory or thinking changes properly — please share this result with yours, especially
            if your score is 6 or higher.
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
