import { useEffect, useRef } from "react";

/**
 * Revela o elemento ao entrar na tela (classe `.reveal` → `.is-visible`), uma vez só.
 * Sem IntersectionObserver (testes, navegadores antigos), mostra direto.
 */
export function useReveal<T extends HTMLElement>(delayMs = 0) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--reveal-delay", `${delayMs}ms`);
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);
  return ref;
}
