import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type Tone = "gold" | "neutral" | "ok" | "warn" | "muted";

const tones: Record<Tone, string> = {
  gold: "border-gold/50 text-gold",
  neutral: "border-white/20 text-bone/80",
  ok: "border-emerald-300/40 text-emerald-200",
  warn: "border-amber-300/40 text-amber-200",
  muted: "border-white/10 text-bone/45",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
