"use client";

import { useEffect } from "react";

// Registers the service worker whose only job is to make the app installable
// (see public/sw.js). Kept separate from InstallPrompt so registration still
// happens for people who have already dismissed the prompt — otherwise the
// browser's own install affordance in the address bar would stop working too.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Registration failing must never surface to the user: the app works
    // perfectly well without it, it just isn't installable.
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
