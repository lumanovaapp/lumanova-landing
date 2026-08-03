import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
