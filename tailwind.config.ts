import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 — minimal JS config.
 * Design tokens are defined in globals.css via @theme {}.
 * Content scanning is automatic in v4 (no content[] required).
 */
const config: Config = {
  // v4 auto-detects content — kept here for documentation / v3 compat
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
