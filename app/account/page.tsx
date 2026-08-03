"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signInHrefFor } from "@/lib/nextPath";
import { greetingNameFromEmail } from "@/lib/formatResult";
import { AppHeader } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [initialName, setInitialName] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(signInHrefFor(window.location.pathname + window.location.search));
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data, error } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

      if (!error && data?.full_name) {
        setInitialName(data.full_name);
        setName(data.full_name);
      }
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);
    setJustSaved(false);
    const trimmed = name.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed || null })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setInitialName(trimmed);
    setName(trimmed);
    setJustSaved(true);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/signin");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      </main>
    );
  }

  const displayName = initialName || greetingNameFromEmail(email);
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const dirty = name.trim() !== initialName;

  return (
    <main className="mx-auto max-w-xl px-6 pb-28 pt-4">
      <AppHeader />

      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm font-semibold text-ink-faint hover:text-ink-soft dark:text-ink-dark-faint dark:hover:text-ink-dark-soft"
      >
        ← Back
      </Link>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink dark:text-ink-dark">Account</h1>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light font-serif text-xl font-bold text-primary-dark dark:bg-primary-light-dark">
          {avatarInitial}
        </div>
        <div>
          <p className="font-serif text-base font-semibold text-ink dark:text-ink-dark">{displayName}</p>
          <p className="text-sm text-ink-faint dark:text-ink-dark-faint">{email}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-white p-4 shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Display name</p>
        <p className="mt-1 text-sm font-medium text-ink dark:text-ink-dark">This is the name shown in the app</p>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setJustSaved(false);
            setSaveError(null);
          }}
          placeholder={greetingNameFromEmail(email)}
          className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition focus:border-primary dark:border-border-dark dark:bg-white/5 dark:text-ink-dark"
        />
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition disabled:opacity-40 ${
            justSaved ? "bg-junebud text-ink" : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {justSaved && !saving && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {saving ? "Saving…" : justSaved ? "Saved" : "Save"}
        </button>
        {saveError && <p className="mt-2 text-sm text-red-600">Couldn&apos;t save: {saveError}</p>}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
          Your data
        </p>
        <Link
          href="/import"
          className="flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-ink transition hover:text-primary-dark dark:text-ink-dark"
        >
          <span>
            Find history from another email
            <span className="mt-0.5 block text-xs font-normal text-ink-faint dark:text-ink-dark-faint">
              Results saved on proageing.org under a different address
            </span>
          </span>
          <span className="shrink-0 text-ink-faint dark:text-ink-dark-faint" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white shadow-sm dark:border-border-dark dark:bg-white/5">
        <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Account</p>
        <a
          href="https://proageing.org/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between border-b border-border px-4 py-3.5 text-sm font-semibold text-ink transition hover:text-primary-dark dark:border-border-dark dark:text-ink-dark"
        >
          Privacy Policy
          <span className="text-ink-faint dark:text-ink-dark-faint" aria-hidden="true">
            ↗
          </span>
        </a>
        <a
          href="https://proageing.org/terms.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-ink transition hover:text-primary-dark dark:text-ink-dark"
        >
          Terms of Use
          <span className="text-ink-faint dark:text-ink-dark-faint" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-5 w-full rounded-xl border border-border px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-border-dark dark:hover:bg-red-950/20"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>

      <TabBar />
    </main>
  );
}
