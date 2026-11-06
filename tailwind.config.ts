import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Linha visual LuxuryBus com o dourado do logo, na landing e no painel.
      colors: {
        noir: { DEFAULT: "#060606", soft: "#0d0d0d" },
        bone: "#F9F9F9",
        gold: { DEFAULT: "#C9A86A", soft: "#DCC596", light: "#E8CF9E", deep: "#8A6F3F" },
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        // Só no logotipo "neon flow".
        brand: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "none" } },
        "ambient-glow": { "0%,100%": { opacity: "0.55", transform: "scale(1)" }, "50%": { opacity: "0.9", transform: "scale(1.08)" } },
        "slow-float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "light-sweep": {
          "0%": { opacity: "0", transform: "translateX(-120%) skewX(-18deg)" },
          "20%,60%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateX(220%) skewX(-18deg)" },
        },
        "drawer-in": { "0%": { transform: "translateX(100%)" }, "100%": { transform: "none" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        // Chama atenção para o próximo passo: cresce de leve e acende um halo dourado.
        nudge: {
          "0%,100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(201,168,106,0.55)" },
          "50%": { transform: "scale(1.025)", boxShadow: "0 0 0 10px rgba(201,168,106,0)" },
        },
        "arrow-down": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(4px)" } },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "ambient-glow": "ambient-glow 8s ease-in-out infinite",
        "slow-float": "slow-float 6s ease-in-out infinite",
        "drawer-in": "drawer-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "fade-in": "fade-in 0.4s ease both",
        nudge: "nudge 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) 3",
        "arrow-down": "arrow-down 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
