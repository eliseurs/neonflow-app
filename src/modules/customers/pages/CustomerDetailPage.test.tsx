import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { renderPage } from "@/test/render";
import type { CustomerDetail } from "../model/customer.types";
import { customerService } from "../services/customer.service";
import { CustomerDetailPage } from "./CustomerDetailPage";

vi.mock("../services/customer.service", () => ({ customerService: { get: vi.fn(), update: vi.fn(), anonymize: vi.fn() } }));

const detail = (over: Partial<CustomerDetail> = {}): CustomerDetail => ({
  id: "c1", name: "Ana Teste", whatsapp: "5554999990001", email: "ana@exemplo.test", language: "en", notes: "Prefere SUV",
  anonymized_at: null, created_at: "", updated_at: "", booking_count: 1, transfer_count: 1,
  orders: [
    { kind: "transfer", id: "t1", at: "2026-12-20T08:00:00-03:00", summary: "Aeroporto POA → Gramado", stage: "com_motorista", total_cents: 45000 },
    { kind: "reserva", id: "b1", at: "2026-12-10T10:00:00-03:00", summary: "Jetta · 2 diárias", stage: "confirmada", total_cents: 20000 },
  ],
  ...over,
});

const open = () => renderPage(<CustomerDetailPage />, { path: "/clientes/:id", route: "/clientes/c1" });
const login = (role: "admin" | "central") =>
  useAuthStore.setState({ token: "t", expiresAt: "2099-01-01T00:00:00Z", user: { id: "u1", name: "Central", email: "c@neonflow.test", role } } as never);

beforeEach(() => vi.resetAllMocks());

describe("CustomerDetailPage", () => {
  it("mostra contato, observações e o histórico com links", async () => {
    login("central");
    vi.mocked(customerService.get).mockResolvedValue(detail());
    open();
    expect(await screen.findByText("Ana Teste")).toBeInTheDocument();
    expect(screen.getByText("Inglês")).toBeInTheDocument();
    expect(screen.getByText("Prefere SUV")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Aeroporto POA → Gramado/ })).toHaveAttribute("href", "/transfers/t1");
    expect(screen.getByRole("link", { name: /Jetta · 2 diárias/ })).toHaveAttribute("href", "/reservas/b1");
    expect(screen.getByText("Com motorista")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/5554999990001");
    expect(screen.queryByRole("button", { name: "Anonimizar cliente" })).toBeNull();
  });

  it("edita o cliente", async () => {
    login("central");
    vi.mocked(customerService.get).mockResolvedValue(detail());
    vi.mocked(customerService.update).mockResolvedValue(detail({ name: "Ana Maria" }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Nome"), { target: { value: "Ana Maria" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(customerService.update).toHaveBeenCalledWith("c1", expect.objectContaining({ name: "Ana Maria", language: "en" })));
  });

  it("admin anonimiza depois de confirmar", async () => {
    login("admin");
    vi.mocked(customerService.get).mockResolvedValue(detail());
    vi.mocked(customerService.anonymize).mockResolvedValue(detail({ name: "Cliente anonimizado", anonymized_at: "2026-11-06T10:00:00-03:00" }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Anonimizar cliente" }));
    const dialog = screen.getByRole("dialog", { name: "Anonimizar cliente" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Sim, anonimizar" }));
    await waitFor(() => expect(customerService.anonymize).toHaveBeenCalledWith("c1"));
  });

  it("anonimizado não tem edição nem contato", async () => {
    login("admin");
    vi.mocked(customerService.get).mockResolvedValue(detail({ name: "Cliente anonimizado", whatsapp: "", email: "", notes: "", anonymized_at: "2026-11-06T10:00:00-03:00", orders: [] }));
    open();
    expect((await screen.findAllByText("Cliente anonimizado")).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Anonimizar cliente" })).toBeNull();
    expect(screen.getByText("Nenhum pedido ainda.")).toBeInTheDocument();
  });

  it("mostra erro quando não encontra", async () => {
    login("central");
    vi.mocked(customerService.get).mockRejectedValue(new Error("404"));
    open();
    expect(await screen.findByText(/Cliente não encontrado/)).toBeInTheDocument();
  });
});
