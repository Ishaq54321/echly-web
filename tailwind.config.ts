import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./echly-extension/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryText: "#111111",
        primary: "#2A2A2A",
        active: "#6E6E6E",
        brand: {
          primary: "#111827",
          accent: "#9FE870",
          soft: "#F3F4F6",
        },
        accent: {
          blue: "#9FE870",
          purple: "#7C3AED",
          green: "#059669",
          amber: "#D97706",
        },
        semantic: {
          system: "#5F6368",
          insight: "#7C3AED",
          success: "#0d9488",
          skipped: "#b45309",
          danger: "#b91c1c",
        },
      },
      boxShadow: {
        "level-1": "0 1px 2px rgba(0, 0, 0, 0.04)",
        "level-2": "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "level-3": "0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)",
        "level-4": "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)",
        "level-5": "0 12px 32px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        card: "22px",
      },
      transitionDuration: {
        motion: "200ms",
        "motion-fast": "150ms",
      },
    },
  },
  plugins: [],
};

export default config;
