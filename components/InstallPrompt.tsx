"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";

// Chrome's install event isn't in lib.dom yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "proageing.installPromptDismissedAt";
// "Not now" means not now: ask again after this long, not never.
const REASK_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < REASK_AFTER_MS;
  } catch {
    return false; // storage blocked (private mode): just show it
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS reports installed apps here rather than through display-mode.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua);
  // Chrome and Firefox on iOS can't install to the home screen at all, so
  // showing them Safari's Share instructions would be a dead end.
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return ios && safari;
}

export function InstallPrompt() {
  const t = useT();
  const [mode, setMode] = useState<"hidden" | "android" | "ios">("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (recentlyDismissed()) return;

    // Android/Chrome: the browser tells us when it's willing to install.
    function onBeforeInstall(e: Event) {
      e.preventDefault(); // stop Chrome's own mini-infobar; we show our own
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("android");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari never fires that event and offers no programmatic install,
    // so the only honest option is to show the manual gesture.
    if (isIosSafari()) setMode("ios");

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* storage blocked: it will simply show again next visit */
    }
    setMode("hidden");
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // Either way the event is spent — Chrome won't let it be reused.
    setDeferred(null);
    setMode("hidden");
  }

  if (mode === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-label={t.install.title}
      className="fixed inset-x-3 bottom-20 z-50 rounded-2xl border border-border bg-paper p-4 shadow-card dark:border-border-dark dark:bg-paper-dark sm:mx-auto sm:max-w-md"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={40} height={40} className="mt-0.5 rounded-lg" />
        <div className="flex-1">
          <p className="font-semibold text-ink dark:text-ink-dark">{t.install.title}</p>
          <p className="mt-1 text-base text-ink-soft dark:text-ink-dark-soft">
            {mode === "ios" ? t.install.iosBody : t.install.androidBody}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {mode === "android" && (
              <button
                onClick={install}
                className="min-h-[56px] rounded-xl bg-primary px-5 text-base font-semibold text-white transition hover:bg-primary-dark"
              >
                {t.install.addButton}
              </button>
            )}
            <button
              onClick={dismiss}
              className="min-h-[56px] rounded-xl px-5 text-base font-semibold text-ink-soft transition hover:text-ink dark:text-ink-dark-soft dark:hover:text-ink-dark"
            >
              {t.install.notNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
