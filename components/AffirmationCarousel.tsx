"use client";

import { useEffect, useState } from "react";

export function AffirmationCarousel({ quotes, intervalMs = 4000 }: { quotes: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % quotes.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [quotes.length, intervalMs]);

  return (
    <p key={index} className="mt-1 text-sm text-ink-soft animate-fade-in-quote dark:text-ink-dark-soft">
      {quotes[index]}
    </p>
  );
}
