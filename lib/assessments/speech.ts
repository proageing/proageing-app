"use client";

import { useCallback, useRef, useState } from "react";

// Matches proageing.org's shared audio pattern: a per-page audioOn toggle
// (default on) and a speak() that cancels any in-flight utterance first.
export function useAssessmentAudio() {
  const [audioOn, setAudioOn] = useState(true);
  const audioOnRef = useRef(audioOn);
  audioOnRef.current = audioOn;

  const speak = useCallback((text: string) => {
    if (!audioOnRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioOn((prev) => {
      const next = !prev;
      if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

  return { audioOn, toggleAudio, speak };
}
