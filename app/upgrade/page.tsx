"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PLANS, planById, type PlanId } from "@/lib/plans";
import { getActiveSubscription, type ActiveSubscription } from "@/lib/subscription";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { WatermarkSwirl } from "@/components/BrandSwirl";
import { useT } from "@/lib/i18n/context";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveSubscription | null>(null);
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  // proageing.org's pricing page links here as /upgrade?plan=21-day.
  const [requestedPlan, setRequestedPlan] = useState<PlanId | null>(null);
  const t = useT();

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("plan");
    const matched = raw ? planById(raw) : undefined;
    if (matched) setRequestedPlan(matched.id);

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        // Guest arriving from proageing.org with a purchasable plan already
        // chosen: send them to Stripe without ever rendering this page. They
        // have read the price and picked — a plan list (built for signed-in
        // people, with "current plan" state) only adds a step. Stripe
        // collects their email; the account is created after payment.
        //
        // comingSoon plans are excluded deliberately: they have no Stripe
        // price configured, so checkout would throw. Those fall through and
        // get the page, which says the plan isn't open yet.
        if (matched && !planById(matched.id)?.comingSoon) {
          void startCheckout(matched.id);
          return;
        }
        // Any other guest still gets the plan list rather than a sign-in
        // wall — there is nothing here that needs an account to read.
        setLoading(false);
        return;
      }
      setActive(await getActiveSubscription(user.id));
      setLoading(false);
    });
    // startCheckout is stable for this page's lifetime and depending on it
    // would re-run this effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Sends the browser to Stripe. Works with or without a session: the
  // checkout route treats a missing Bearer header as a guest purchase.
  async function startCheckout(planId: PlanId) {
    setBusyPlan(planId);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ planId }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.url) {
      setBusyPlan(null);
      // A guest whose checkout failed would otherwise be stuck on a blank
      // loading screen, since this page never renders for them.
      setLoading(false);
      setError(body?.error ?? t.upgrade.couldntStart);
      return;
    }
    window.location.href = body.url;
  }

  async function handleUpgrade(planId: PlanId) {
    await startCheckout(planId);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">{t.common.loading}</p>
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
          {t.upgrade.title}
        </h1>

      {active && (
        <p className="mt-6 rounded-xl border border-primary bg-primary-light px-4 py-3 text-sm font-semibold text-primary-dark dark:bg-primary-light-dark">
          {t.upgrade.currentlyOn(PLANS.find((p) => p.id === active.plan)?.title ?? active.plan)}
        </p>
      )}

      {requestedPlanIsComingSoon && (
        <p className="mt-6 rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink-soft shadow-sm dark:border-border-dark dark:bg-white/5 dark:text-ink-dark-soft">
          {t.upgrade.notOpenYet(planById(requestedPlan!)?.title ?? "")}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-cognitive dark:text-junebud">{t.upgrade.free.included}</p>
          <h2 className="mt-1 font-serif text-lg font-semibold text-ink dark:text-ink-dark">{t.upgrade.free.title}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">{t.upgrade.free.priceLabel}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {t.upgrade.free.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
                <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-junebud">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4.5 4.5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

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
              <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">{t.upgrade.yourSelection}</p>
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
                {t.upgrade.comingSoon}
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={busyPlan !== null || active?.plan === plan.id}
                className="mt-3 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
              >
                {active?.plan === plan.id ? t.upgrade.currentPlan : busyPlan === plan.id ? t.upgrade.redirecting : t.upgrade.choosePlan}
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
