import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { photoSrcSet, photoUrl } from "../model/fleet";

/**
 * Galeria no estilo dos classificados (Webmotors): foto grande, setas, contador e miniaturas; clique abre em
 * tela cheia (setas do teclado e Esc). Cada foto vem em 640/1280/1920 e o navegador escolhe pela tela.
 */
export function CarGallery({ photoIds, name, labels }: {
  photoIds: string[];
  name: string;
  labels: { prev: string; next: string; open: string; close: string; photo: string };
}) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const count = photoIds.length;
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full, go]);

  if (count === 0) {
    return (
      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b0b]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(232,207,158,0.28),transparent_60%)]" />
        <img src="/brand/neonflow-simbolo.svg" alt="" aria-hidden className="relative w-28 opacity-80" />
      </div>
    );
  }
  const current = photoIds[index];
  const arrow = "absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-bone backdrop-blur transition hover:bg-black/80 hover:text-gold";

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b0b]">
        <button type="button" onClick={() => setFull(true)} aria-label={labels.open} className="block w-full">
          <img
            key={current}
            src={photoUrl(current, 1280)}
            srcSet={photoSrcSet(current)}
            sizes="(min-width: 1024px) 60vw, 100vw"
            width={1280}
            height={800}
            alt={`${name} · ${labels.photo} ${index + 1}`}
            // A primeira foto é o que a pessoa veio ver: carrega já, com prioridade.
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            className="aspect-[16/10] w-full object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className={cn(arrow, "left-3")}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className={cn(arrow, "right-3")}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-bone/90 backdrop-blur">
          <Expand className="h-3.5 w-3.5" aria-hidden /> {index + 1} / {count}
        </div>
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list">
          {photoIds.map((id, i) => (
            <button
              key={id}
              type="button"
              role="listitem"
              onClick={() => setIndex(i)}
              aria-label={`${labels.photo} ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "shrink-0 overflow-hidden rounded-xl border-2 transition",
                i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img src={photoUrl(id, 640)} alt="" loading="lazy" decoding="async" width={128} height={80} className="h-16 w-24 object-cover sm:h-20 sm:w-32" />
            </button>
          ))}
        </div>
      )}

      {full && (
        <div role="dialog" aria-modal="true" aria-label={name} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <img
            src={photoUrl(current, 1920)}
            srcSet={photoSrcSet(current)}
            sizes="100vw"
            alt={`${name} · ${labels.photo} ${index + 1}`}
            decoding="async"
            className="max-h-full max-w-full object-contain"
          />
          <button type="button" onClick={() => setFull(false)} aria-label={labels.close} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-bone hover:text-gold">
            <X className="h-5 w-5" aria-hidden />
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className={cn(arrow, "left-4")}>
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={labels.next} className={cn(arrow, "right-4")}>
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-bone/70">{index + 1} / {count}</p>
        </div>
      )}
    </div>
  );
}
