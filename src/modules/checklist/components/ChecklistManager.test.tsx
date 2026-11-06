import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { ChecklistItem } from "../model/checklist.types";
import { checklistService } from "../services/checklist.service";
import { ChecklistManager } from "./ChecklistManager";

vi.mock("../services/checklist.service", () => ({
  checklistService: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

const item = (key: string, label: string, position: number, active = true): ChecklistItem => ({
  id: `id-${key}`, key, label, position, active, created_at: "", updated_at: "",
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(checklistService.list).mockResolvedValue([
    item("oleo", "Nível de óleo", 30),
    item("combustivel", "Combustível", 10),
    item("fotos", "Fotos", 90, false),
  ]);
  vi.mocked(checklistService.update).mockImplementation(async (id, req) => ({ ...item("x", req.label, req.position), id }));
  vi.mocked(checklistService.create).mockImplementation(async (req) => item("novo", req.label, req.position));
});

describe("ChecklistManager", () => {
  it("lista em ordem, com os inativos desligados", async () => {
    renderPage(<ChecklistManager />);
    const labels = (await screen.findAllByRole("switch")).map((s) => s.getAttribute("aria-label"));
    expect(labels).toEqual(["Combustível ativo", "Nível de óleo ativo", "Fotos ativo"]);
    expect(screen.getByRole("switch", { name: "Fotos ativo" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "Subir Combustível" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Descer Fotos" })).toBeDisabled();
  });

  it("liga e desliga, renomeia e troca a ordem", async () => {
    renderPage(<ChecklistManager />);
    fireEvent.click(await screen.findByRole("switch", { name: "Fotos ativo" }));
    await waitFor(() =>
      expect(checklistService.update).toHaveBeenCalledWith("id-fotos", { label: "Fotos", position: 90, active: true }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Renomear Nível de óleo" }));
    fireEvent.change(screen.getByLabelText("Novo nome de Nível de óleo"), { target: { value: "Óleo e filtro" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(checklistService.update).toHaveBeenCalledWith("id-oleo", { label: "Óleo e filtro", position: 30, active: true }),
    );

    vi.mocked(checklistService.update).mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Descer Combustível" }));
    await waitFor(() => expect(checklistService.update).toHaveBeenCalledTimes(2));
    expect(checklistService.update).toHaveBeenNthCalledWith(1, "id-combustivel", { label: "Combustível", position: 30, active: true });
    expect(checklistService.update).toHaveBeenNthCalledWith(2, "id-oleo", { label: "Nível de óleo", position: 10, active: true });
  });

  it("adiciona no fim da lista e mostra erro da API", async () => {
    renderPage(<ChecklistManager />);
    fireEvent.change(await screen.findByLabelText("Nome do novo item"), { target: { value: " Estepe " } });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar/ }));
    await waitFor(() => expect(checklistService.create).toHaveBeenCalledWith({ label: "Estepe", position: 100 }));
    await waitFor(() => expect(screen.getByLabelText("Nome do novo item")).toHaveValue(""));
  });

  it("falha ao carregar", async () => {
    vi.mocked(checklistService.list).mockRejectedValue(new Error("x"));
    renderPage(<ChecklistManager />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar o checklist.");
  });
});
