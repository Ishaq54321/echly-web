import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2A2A2A",
        active: "#6E6E6E",
        brand: {
          primary: "#111827",
          accent: "#2563EB",
          soft: "#F3F4F6",
        },
        accent: {
          blue: "#2563EB",
          purple: "#7C3AED",
          green: "#059669",
          amber: "#D97706",
        },
        semantic: {
          system: "#2563EB",
          insight: "#7C3AED",
          success: "#059669",
          attention: "#D97706",
          danger: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
