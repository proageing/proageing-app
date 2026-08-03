"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { en, type Dictionary } from "./en";
import { zh } from "./zh";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./types";

const DICTIONARIES: Record<Locale, Dictionary> = { en, zh };

const STORAGE_KEY = "proage-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: en,
});

// Locale lives in localStorage rather than the URL. Every page in this app
// is behind sign-in and client-rendered, so there's nothing for a /zh/
// route prefix to buy — and a prefix would mean duplicating all 23 routes.
//
// The first render is always the default locale, matching what the server
// sent; the stored preference is applied in an effect. That avoids a
// hydration mismatch, at the cost of a brief flash of English for a
// Chinese user on a cold load.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
      // No stored choice — take the browser's hint once, then remember
      // whatever the person actually picks.
      if (window.navigator.language?.toLowerCase().startsWith("zh")) {
        setLocaleState("zh");
      }
    } catch {
      // Storage unavailable — English it is.
    }
  }, []);

  // Keep the document in step, so screen readers and the browser's own
  // translation prompt aren't told this is English when it isn't.
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't survive the session.
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: DICTIONARIES[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

// Sugar for the common case, where a component only needs the strings.
export function useT(): Dictionary {
  return useContext(LocaleContext).t;
}
