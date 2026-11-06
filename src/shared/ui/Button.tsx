import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-b from-gold-soft to-gold px-6 py-3 text-noir hover:brightness-110",
  outline: "border border-gold/60 px-6 py-3 text-bone hover:border-gold hover:bg-gold hover:text-noir",
  ghost: "px-3 py-2 text-bone/70 hover:text-gold",
  danger: "border border-rose-400/40 px-6 py-3 text-rose-300 hover:border-rose-400 hover:bg-rose-400/10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(base, variants[variant], className)} {...props} />;
}
