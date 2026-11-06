import { describe, expect, it } from "vitest";
import { photoStageOpen } from "./photo.types";

describe("photoStageOpen", () => {
  it("espelha a API", () => {
    expect(photoStageOpen("entrega", "confirmada")).toBe(true);
    expect(photoStageOpen("entrega", "devolvida")).toBe(false);
    expect(photoStageOpen("devolucao", "devolvida")).toBe(true);
    expect(photoStageOpen("devolucao", "encerrada")).toBe(false);
  });
});
