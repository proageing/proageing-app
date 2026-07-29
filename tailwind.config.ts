import type { Config } from "tailwindcss";

// Palette pulled directly from proageing.org's live assessment pages —
// paper/ink neutrals and the per-pillar accent colors already proven in
// production there, not invented for this app. See docs/PLAN.md §6 and
// the design notes in globals.css.
const config: Config = {
  darkMode: "media",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['ui-serif', 'Georgia', '"Iowan Old Style"', '"Times New Roman"', "serif"],
      },
      colors: {
        paper: {
          DEFAULT: "#faf9f7",
          dark: "#1e1d1b",
        },
        ink: {
          DEFAULT: "#444444",
          soft: "#6b6b6b",
          faint: "#767676",
          dark: "#f2f0ea",
          "dark-soft": "#c9c5bc",
          "dark-faint": "#96918a",
        },
        border: {
          DEFAULT: "#d9d6ce",
          dark: "#3a3733",
        },
        primary: {
          DEFAULT: "#ff9c00",
          dark: "#a84e00",
          light: "#ffefd6",
          "light-dark": "#3d2a0a",
        },
        // Per-pillar accents, matching proageing.org's assessment pages 1:1.
        // "dark" uses each page's own "-deep" shade where one exists;
        // purpose and sleep don't define one on the source pages (their
        // base tone is already dark enough for text), so dark = DEFAULT.
        purpose: { DEFAULT: "#8b5a83", dark: "#8b5a83", tint: "#f1e4ee" },
        healthrisk: { DEFAULT: "#b9791a", dark: "#7a4e0e", tint: "#f6e9d2" },
        movement: { DEFAULT: "#2c5f8a", dark: "#1e4666", tint: "#e4edf5" },
        strength: { DEFAULT: "#5b6b7c", dark: "#3d4a56", tint: "#e7ebee" },
        nutrition: { DEFAULT: "#7a8b5a", dark: "#4f5c38", tint: "#e9eddd" },
        sleep: { DEFAULT: "#5b5bd6", dark: "#5b5bd6", tint: "#e8e8fb" },
        connection: { DEFAULT: "#b8607a", dark: "#7a3b4e", tint: "#f5e3e8" },
        cognitive: { DEFAULT: "#5c7a1e", dark: "#5c7a1e", tint: "#eff7dd" },
      },
      boxShadow: {
        card: "0 24px 60px -20px rgba(30,26,20,0.35), 0 2px 8px rgba(30,26,20,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
