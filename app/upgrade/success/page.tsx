import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function UpgradeSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo size={48} />
      <h1 className="mt-6 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">You're all set</h1>
      <p className="mt-3 text-ink-soft dark:text-ink-dark-soft">
        Your payment went through. It may take a few seconds for your plan to
        show as active.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
