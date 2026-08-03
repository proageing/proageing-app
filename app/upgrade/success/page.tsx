"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useT } from "@/lib/i18n/context";

export default function UpgradeSuccessPage() {
  const t = useT();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo size={48} />
      <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">{t.upgradeSuccess.title}</h1>
      <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">{t.upgradeSuccess.body}</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark"
      >
        {t.upgradeSuccess.backToDashboard}
      </Link>
    </main>
  );
}
