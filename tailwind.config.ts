import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Linha visual LuxuryBus e dourado do logo (caminho B), na landing e no painel.
      colors: {
        noir: { DEFAULT: "#060606", soft: "#0d0d0d" },
        bone: "#F9F9F9",
        gold: { DEFAULT: "#C9A86A", soft: "#DCC596" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
