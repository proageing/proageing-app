"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveAssessmentResult } from "@/lib/assessments/saveResult";
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

export default function ConnectionPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<ConnectionAnswers>(emptyConnectionAnswers());
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

  function setAnswer(key: keyof ConnectionAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const score = computeConnectionScore(answers);
  const result = interpretLonelinessScore(score.loneliness);
  const famFlag = networkFlag(score.family);
  const friFlag = networkFlag(score.friends);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await saveAssessmentResult(userId, "connection", { score: score.loneliness });
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
          <p className="text-xs font-semibold uppercase tracking-wide text-connection-dark">Connection Check · ~3 minutes</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Connection Check</h1>
          <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
            This check combines two validated instruments: the Lubben Social Network Scale
            (LSNS-6), which maps the size of your family and friend networks, and the UCLA-3
            Loneliness Scale, which asks how connected you actually feel.
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-ink-dark-soft">
            In a 2022 Singapore study of 606 older adults, feeling lonely — not network size
            alone — was the one linked to higher frailty risk (Ge, Yap & Heng, BMC Geriatrics).
            So this check tracks both, but pays closest attention to how you feel.
          </p>
          <button
            onClick={() => setScreen("questions")}
            className="mt-6 rounded bg-connection px-4 py-2 font-medium text-white"
          >
            Let&apos;s begin
          </button>
        </div>
      )}

      {screen === "questions" && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink dark:text-ink-dark">Your family, friends, and feelings</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">There are no right or wrong answers — just answer as accurately as you can.</p>

          <div className="mt-6 flex flex-col gap-6">
            {CONNECTION_QUESTIONS.map((q) => {
              const showSection = q.section !== lastSection;
              lastSection = q.section;
              return (
                <div key={q.key}>
                  {showSection && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">{q.section}</p>
                  )}
                  <p className="font-medium text-ink dark:text-ink-dark">{q.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.opts.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAnswer(q.key, opt.value)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                          answers[q.key] === opt.value
                            ? "border-connection bg-connection-tint text-connection-dark"
                            : "border-border text-ink-soft"
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
            onClick={() => isConnectionComplete(answers) && setScreen("results")}
            disabled={!isConnectionComplete(answers)}
            className="mt-8 rounded bg-connection px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            See my results
          </button>
        </div>
      )}

      {screen === "results" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-connection-dark">Your result</p>
          <div className="mt-2 text-center">
            <div className="text-5xl font-bold text-connection-dark">{score.loneliness}</div>
            <div className="text-sm font-medium text-ink-soft dark:text-ink-dark-soft">loneliness score (UCLA-3) · lower means less lonely</div>
          </div>

          <p className="mt-6 rounded-full bg-connection-tint px-3 py-1 text-center text-sm font-semibold text-connection-dark">
            {result.label}
          </p>

          <p className="mt-4 text-xs text-ink-faint dark:text-ink-dark-faint">
            Score {score.loneliness} of 9 (range 3–9). In the Singapore sample this check is based
            on: 3 = not lonely, 4–5 = somewhat lonely, 6–9 = lonely.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
            Your social network (LSNS-6)
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm">
              <span className="font-medium text-ink dark:text-ink-dark">Family network ({score.family}/15)</span>
              <span className={famFlag === "isolated" ? "font-semibold text-red-600" : "font-semibold text-green-700"}>
                {famFlag === "isolated" ? "Isolated" : "Connected"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm">
              <span className="font-medium text-ink dark:text-ink-dark">Friend network ({score.friends}/15)</span>
              <span className={friFlag === "isolated" ? "font-semibold text-red-600" : "font-semibold text-green-700"}>
                {friFlag === "isolated" ? "Isolated" : "Connected"}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border dark:border-border-dark p-4">
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
            This is a research-based screening tool, not a diagnosis. If persistent loneliness is
            affecting your wellbeing, please talk to your doctor or a counsellor.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full rounded bg-connection px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & return to dashboard"}
          </button>
          {saveStatus && <p className="mt-2 text-sm text-red-600">{saveStatus}</p>}
        </div>
      )}
    </main>
  );
}
