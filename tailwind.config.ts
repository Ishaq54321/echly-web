import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
    },
  },
  plugins: [],
};

export default config;
