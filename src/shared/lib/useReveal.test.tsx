import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/shared/ui/Reveal";

describe("Reveal", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sem IntersectionObserver, mostra direto", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Reveal delay={120}>conteúdo</Reveal>);
    const el = screen.getByText("conteúdo");
    expect(el).toHaveClass("reveal", "is-visible");
    expect(el.style.getPropertyValue("--reveal-delay")).toBe("120ms");
  });

  it("revela quando entra na tela e para de observar", () => {
    let callback: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((cb: IntersectionObserverCallback) => {
        callback = cb;
        return { observe: vi.fn(), disconnect };
      }),
    );
    render(<Reveal>bloco</Reveal>);
    const el = screen.getByText("bloco");
    expect(el).not.toHaveClass("is-visible");
    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(el).toHaveClass("is-visible");
    expect(disconnect).toHaveBeenCalled();
  });
});
