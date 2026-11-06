import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-[14px] border border-white/[0.08] bg-white/[0.03]", className)}>{children}</div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <Panel className="flex flex-col items-start gap-4 p-8 md:p-10">
      <h2 className="font-serif text-2xl font-light">{title}</h2>
      <p className="max-w-xl text-bone/60">{text}</p>
      {action}
    </Panel>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">
      {children}
    </p>
  );
}

export function Loading({ label = "Carregando..." }: { label?: string }) {
  return (
    <p role="status" className="text-sm text-bone/50">
      {label}
    </p>
  );
}
