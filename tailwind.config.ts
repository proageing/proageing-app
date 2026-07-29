import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff9c00",
          dark: "#e08600",
          light: "#fff1dc",
        },
      },
    },
  },
  plugins: [],
};

export default config;
