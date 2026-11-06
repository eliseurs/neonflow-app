import type { ReactNode } from "react";

export const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-bone outline-none transition focus:border-gold/70 disabled:opacity-50 [color-scheme:dark]";

export const labelClass = "block text-[11px] font-medium uppercase tracking-[0.2em] text-bone/60";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-bone/45">{hint}</p>}
    </div>
  );
}
