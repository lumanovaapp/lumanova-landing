import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Shared className tokens (e.g. lib/accent.ts, lib/badges.ts) live here
    // as plain string literals referenced indirectly through theme objects —
    // without this, Tailwind's scanner never sees them and silently drops
    // their classes from the compiled CSS.
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lumen-gold": "#F4C430",
        "deep-teal": "#0E3A47",
        "aurora-mist": "#7FE0D3",
        "cream-ivory": "#F8F4E3",
        "pure-black": "#0A0A0A",
        charcoal: "#1A1A1A",
        "warm-coral": "#FF6F59",
        // Jewel-toned violet reserved for milestone-category achievement
        // badges — distinct from every other semantic accent in the app.
        "badge-violet": "#B69CFF",
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
