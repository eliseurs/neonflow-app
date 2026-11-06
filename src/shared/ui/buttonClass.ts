import { cn } from "@/shared/lib/cn";

export type Variant = "primary" | "outline" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ease-silk disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "btn-gold px-7 py-3.5",
  outline: "border border-white/15 px-7 py-3.5 text-bone hover:border-gold/70 hover:text-gold active:scale-[0.98]",
  ghost: "px-3 py-2 text-bone/70 hover:text-gold",
  danger: "border border-rose-400/40 px-7 py-3.5 text-rose-300 hover:border-rose-400 hover:bg-rose-400/10",
};

/** Classes dos botões do sistema, também para links (âncoras e rotas). */
export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}
