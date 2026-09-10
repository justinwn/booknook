import type { Config } from "tailwindcss";

// Design tokens are centralized as CSS custom properties (see app/globals.css),
// grouped per theme under [data-theme="..."]. Tailwind utilities below just
// point at those variables so no component ever hardcodes a color, radius,
// or shadow value directly — swap a theme's variables and every component
// that uses these tokens updates automatically.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--color-surface-rgb) / <alpha-value>)",
        "surface-raised": "rgb(var(--color-surface-raised-rgb) / <alpha-value>)",
        ink: "rgb(var(--color-ink-rgb) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted-rgb) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft-rgb) / <alpha-value>)",
        accent: "rgb(var(--color-accent-rgb) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft-rgb) / <alpha-value>)",
        border: "rgb(var(--color-border-rgb) / <alpha-value>)",
        paper: "rgb(var(--color-paper-rgb) / <alpha-value>)",
        // brand chrome (login + onboarding), independent of library mood
        blush: "rgb(var(--brand-blush-rgb) / <alpha-value>)",
        "blush-ink": "rgb(var(--brand-blush-ink-rgb) / <alpha-value>)",
        gallery: "rgb(var(--brand-gallery-rgb) / <alpha-value>)",
        "gallery-ink": "rgb(var(--brand-gallery-ink-rgb) / <alpha-value>)",
        selected: "rgb(var(--brand-selected-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        token: "var(--radius-md)",
        "token-sm": "var(--radius-sm)",
        "token-lg": "var(--radius-lg)",
      },
      boxShadow: {
        token: "var(--shadow-md)",
        "token-lg": "var(--shadow-lg)",
        "token-inset": "var(--shadow-inset)",
      },
      transitionTimingFunction: {
        settle: "var(--ease-settle)",
        gentle: "var(--ease-gentle)",
      },
      transitionDuration: {
        token: "var(--motion-md)",
      },
      backgroundImage: {
        grain: "url('/assets/texture-grain.svg')",
      },
    },
  },
  plugins: [],
};
export default config;
