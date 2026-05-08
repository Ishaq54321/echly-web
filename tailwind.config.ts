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
        brand: {
          DEFAULT: "#5A49BF",
          hover:   "#4A3BA0",
          subtle:  "#F0ECFB",
          muted:   "#DCD5F0",
          text:    "#3D2F73",
        },
        surface: {
          page:    "#FFFFFF",
          card:    "#FFFFFF",
          subtle:  "#F8F8F8",
          hover:   "#FAFAF7",
          active:  "#F0ECFB",
          input:   "#FFFFFF",
        },
        text: {
          heading:     "#15101F",
          body:        "#54495F",
          secondary:   "#54495F",
          tertiary:    "#8A8096",
          placeholder: "#B5AEBE",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong:  "#D5D5D5",
        },
        success: {
          DEFAULT: "#18794E",
          bg:      "#E9F9EE",
          border:  "#A7F3D0",
        },
        danger: {
          DEFAULT: "#E5484D",
          bg:      "#FEF2F2",
          border:  "#FECACA",
        },
        warning: {
          DEFAULT: "#F77E2C",
          bg:      "#FFEDD5",
          border:  "#FED7AA",
        },
        insight: {
          DEFAULT: "#6049E7",
          bg:      "#F0F1FF",
          border:  "#C4B5FD",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
      fontSize: {
        xs:   ["12px", { lineHeight: "1.4" }],
        sm:   ["14px", { lineHeight: "1.5" }],
        base: ["15px", { lineHeight: "1.6" }],
        md:   ["16px", { lineHeight: "1.5" }],
        lg:   ["20px", { lineHeight: "1.4" }],
        xl:   ["24px", { lineHeight: "1.3" }],
        '2xl': ['28px', { lineHeight: '1.2' }],
        '3xl': ['32px', { lineHeight: '1.15' }],
        'display': ['44px', { lineHeight: '1.08' }],
      },
      borderRadius: {
        xs:   "6px",
        sm:   "9px",
        md:   "12px",
        lg:   "16px",
        xl:   "22px",
        pill: "9999px",
        card: "22px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        xl: "0 16px 48px rgba(0,0,0,0.14), 0 4px 14px rgba(0,0,0,0.08)",
        "level-1": "0 1px 2px rgba(0, 0, 0, 0.04)",
        "level-2": "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "level-3": "0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)",
        "level-4": "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)",
        "level-5": "0 12px 32px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        motion: "200ms",
        "motion-fast": "120ms",
      },
    },
  },
  plugins: [],
};

export default config;
