import { describe, expect, it } from "vitest";
import { content } from "./landing.content";
import { composeMessage, whatsappNumber, whatsappUrl } from "./whatsapp";

describe("whatsapp", () => {
  it("normaliza o número e trata vazio como canal desligado", () => {
    expect(whatsappNumber("+55 (54) 99999-0000")).toBe("5554999990000");
    expect(whatsappNumber(undefined)).toBe("");
    expect(whatsappUrl("")).toBeNull();
    expect(whatsappUrl("5554999990000")).toBe("https://wa.me/5554999990000");
    expect(whatsappUrl("55", "a b")).toBe("https://wa.me/55?text=a%20b");
  });

  it("monta a mensagem só com os campos preenchidos", () => {
    const msg = composeMessage(
      { service: "transfer", name: " Ana Teste ", start: "2026-12-10", end: "", route: "POA → Gramado", notes: "" },
      content.pt.contact,
      "pt",
    );
    expect(msg).toBe("Olá! Quero fazer um pedido ao Neon Flow.\n\nServiço: Transfer\nNome: Ana Teste\nInício: 10/12/2026\nTrajeto/local: POA → Gramado");
  });

  it("usa o idioma da página", () => {
    const msg = composeMessage(
      { service: "aluguel-motorista", name: "", start: "2026-12-10", end: "2026-12-12", route: "", notes: "2 malas" },
      content.en.contact,
      "en",
    );
    expect(msg).toBe("Hello! I would like to make a request to Neon Flow.\n\nService: Rental with a driver\nStart: 2026-12-10\nEnd: 2026-12-12\nNotes: 2 malas");
  });

  it("as duas línguas têm as mesmas chaves", () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? keys(v).map((s) => `${k}.${s}`) : [k]));
    expect(keys(content.en)).toEqual(keys(content.pt));
    expect(content.en.conditions.rental.items).toHaveLength(content.pt.conditions.rental.items.length);
  });
});
