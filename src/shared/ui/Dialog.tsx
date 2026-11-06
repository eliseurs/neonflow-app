import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Painel lateral modal. Esc e o fundo fecham. */
export function Dialog({ title, onClose, children }: DialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-white/[0.08] bg-noir p-6 md:p-10"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-3xl font-light">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-bone/60 hover:text-gold">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="mt-8">{children}</div>
      </section>
    </div>
  );
}
