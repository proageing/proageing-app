"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PLANS, planById, type PlanId } from "@/lib/plans";
import { getActiveSubscription, type ActiveSubscription } from "@/lib/subscription";
import { signInHrefFor } from "@/lib/nextPath";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { WatermarkSwirl } from "@/components/BrandSwirl";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveSubscription | null>(null);
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  // proageing.org's pricing page links here as /upgrade?plan=21-day.
  const [requestedPlan, setRequestedPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("plan");
    const matched = raw ? planById(raw) : undefined;
    if (matched) setRequestedPlan(matched.id);

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        // Keep the plan they picked on the way through sign-in, so they
        // come back to the same choice rather than a bare plan list.
        router.push(signInHrefFor(`/upgrade${window.location.search}`));
        return;
      }
      setActive(await getActiveSubscription(user.id));
      setLoading(false);
    });
  }, [router]);

  async function handleUpgrade(planId: PlanId) {
    setBusyPlan(planId);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push(signInHrefFor(`/upgrade?plan=${planId}`));
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ planId }),
    });
    const body = await res.json();
    setBusyPlan(null);
    if (!res.ok) {
      setError(body.error ?? "Couldn't start checkout.");
      return;
    }
    window.location.href = body.url;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  const requestedPlanIsComingSoon = requestedPlan ? (planById(requestedPlan)?.comingSoon ?? false) : false;

  return (
    <main className="relative mx-auto max-w-xl overflow-x-hidden px-6 pb-28 pt-8">
      <WatermarkSwirl className="pointer-events-none absolute -right-24 -top-20 w-[420px] text-primary opacity-[0.06]" />

      <div className="relative">
        <AppHeader />
        <h1 className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">
          Plans &amp; pricing
        </h1>
        <p className="mt-2 text-ink-soft dark:text-ink-dark-soft">
          Your 9 free assessment checks are always free, and your account
          keeps a free history of every check you take over time. These are
          the guided programmes that turn your results into a daily plan.
        </p>

      {active && (
        <p className="mt-6 rounded-xl border border-primary bg-primary-light px-4 py-3 text-sm font-semibold text-primary-dark dark:bg-primary-light-dark">
          You're currently on {PLANS.find((p) => p.id === active.plan)?.title ?? active.plan}.
        </p>
      )}

      {requestedPlanIsComingSoon && (
        <p className="mt-6 rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink-soft shadow-sm dark:border-border-dark dark:bg-white/5 dark:text-ink-dark-soft">
          The {planById(requestedPlan!)?.title} isn&apos;t open yet — here&apos;s what&apos;s available today.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {PLANS.map((plan) => {
          const highlighted = plan.id === requestedPlan && !plan.comingSoon;
          return (
          <div
            key={plan.id}
            className={`rounded-xl border p-4 shadow-sm ${
              highlighted ? "border-primary" : "border-border dark:border-border-dark"
            } ${plan.comingSoon ? "bg-border/20 dark:bg-white/[0.02]" : "bg-white dark:bg-white/5"}`}
          >
            {highlighted && (
              <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">Your selection</p>
            )}
            <h2 className={`font-serif text-lg font-semibold ${plan.comingSoon ? "text-ink-faint dark:text-ink-dark-faint" : "text-ink dark:text-ink-dark"} ${highlighted ? "mt-1" : ""}`}>
              {plan.title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{plan.priceLabel}</p>
            {plan.comingSoon ? (
              <button
                disabled
                className="mt-3 w-full cursor-not-allowed rounded-xl bg-border px-4 py-3 font-semibold text-ink-faint dark:bg-border-dark dark:text-ink-dark-faint"
              >
                Coming soon
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={busyPlan !== null || active?.plan === plan.id}
                className="mt-3 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
              >
                {active?.plan === plan.id ? "Current plan" : busyPlan === plan.id ? "Redirecting…" : "Choose this plan"}
              </button>
            )}
          </div>
          );
        })}
      </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      <TabBar />
    </main>
  );
}
