import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#101b25", soft: "#16232f", line: "#22313e" },
        mint: { DEFAULT: "#6cedc4", dark: "#3fc9a0" },
        // Landing pública: linha visual LuxuryBus e dourado do logo (caminho B).
        noir: "#060606",
        bone: "#F9F9F9",
        gold: { DEFAULT: "#C9A86A", soft: "#DCC596" },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Manrope", "DM Sans", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
