import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: "#6B0F1A", 50: "#FBF1F2", 100: "#F5DDE0", 200: "#E8B4BB", 600: "#85131F", 700: "#6B0F1A", 800: "#520B14", 900: "#3A080E" },
        gold: { DEFAULT: "#C9A84C", 50: "#FBF7EB", 100: "#F5ECCF", 300: "#DEC47E", 500: "#C9A84C", 700: "#9C7F2E" },
        cream: { DEFAULT: "#FFFBF3", 100: "#FDF6E7" },
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
        hindi: ['"Noto Sans Devanagari"', '"Noto Sans"', "sans-serif"],
        display: ['"Noto Serif"', '"Noto Serif Devanagari"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
