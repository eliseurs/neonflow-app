import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { transfer } from "@/test/transferFixture";
import type { Driver } from "../model/transfer.types";
import { transferService } from "../services/transfer.service";
import { TransferDetailPage } from "./TransferDetailPage";

vi.mock("../services/transfer.service", () => ({
  transferService: {
    get: vi.fn(), events: vi.fn(), drivers: vi.fn(), offer: vi.fn(), notify: vi.fn(), accept: vi.fn(), release: vi.fn(),
    setPaid: vi.fn(), start: vi.fn(), complete: vi.fn(), cancel: vi.fn(),
  },
}));
vi.mock("@/modules/fleet/services/fleet.service", () => ({
  fleetService: {
    list: () => Promise.resolve([
      { id: "v1", name: "Jetta Teste" },
      { id: "v2", name: "C180 Teste" },
    ]),
  },
}));

const open = () => renderPage(<TransferDetailPage />, { path: "/transfers/:id", route: "/transfers/t1" });

const drivers: Driver[] = [
  { partner_id: "d1", name: "Pedro Motorista", whatsapp: "5554999990001", kinds: ["motorista"], same_day: ["2026-12-10T15:00:00-03:00"], vehicles: [] },
  { partner_id: "d2", name: "João Dono", whatsapp: "5554999990002", kinds: ["proprietario"], same_day: [], vehicles: [{ id: "v2", name: "C180 Teste", plate: "ABC1D23" }] },
  { partner_id: "d3", name: "Sem Zap", whatsapp: "", kinds: ["motorista"], same_day: [], vehicles: [] },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(transferService.events).mockResolvedValue([
    { action: "criado", detail: "", user_name: "Central Teste", created_at: "2026-12-01T10:00:00-03:00" },
    { action: "valor_aumentado", detail: "R$ 300,00 → R$ 350,00", user_name: null, created_at: "2026-12-01T11:00:00-03:00" },
  ]);
  vi.mocked(transferService.drivers).mockResolvedValue(drivers);
});

describe("TransferDetailPage", () => {
  it("lista motoristas e proprietários com WhatsApp pessoal e corrida no mesmo dia", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer({ offer_cents: 35000 }));
    vi.mocked(transferService.notify).mockResolvedValue(transfer({ offer_cents: 35000 }));
    open();
    expect(await screen.findByText("Pedro Motorista")).toBeInTheDocument();
    expect(screen.getByText("Valor aumentado")).toBeInTheDocument();
    expect(screen.getByText(/R\$ 300,00 → R\$ 350,00/)).toBeInTheDocument();
    expect(screen.getByLabelText("Valor para o motorista (R$)")).toHaveValue("350,00");
    expect(screen.getByText(/já tem corrida às 15:00/)).toBeInTheDocument();
    expect(screen.getByText("Proprietário")).toBeInTheDocument();
    expect(screen.getByText("Sem WhatsApp no cadastro")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Chamar Sem Zap no WhatsApp" })).toBeNull();

    const zap = screen.getByRole("link", { name: "Chamar João Dono no WhatsApp" });
    const href = decodeURIComponent(zap.getAttribute("href") ?? "");
    expect(href).toContain("https://wa.me/5554999990002?text=");
    expect(href).toContain("Olá, João!");
    expect(href).toMatch(/Valor para você: R\$\s350,00/);
    fireEvent.click(zap);
    await waitFor(() => expect(transferService.notify).toHaveBeenCalledWith("t1", "d2"));
  });

  it("aumenta o valor e não deixa diminuir", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer({ offer_cents: 35000 }));
    vi.mocked(transferService.offer).mockResolvedValue(transfer({ offer_cents: 40000 }));
    open();
    const field = await screen.findByLabelText("Valor para o motorista (R$)");
    fireEvent.change(field, { target: { value: "300,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Aumentar valor" }));
    expect(screen.getByRole("alert")).toHaveTextContent("não pode ser menor");
    fireEvent.change(field, { target: { value: "400,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Aumentar valor" }));
    await waitFor(() => expect(transferService.offer).toHaveBeenCalledWith("t1", 40000));
  });

  it("marca quem aceitou com o carro dele sugerido, ou outro carro", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer());
    vi.mocked(transferService.accept).mockResolvedValue(
      transfer({ stage: "com_motorista", driver_name: "João Dono", driver_cents: 35000, vehicle_name: "C180 Teste" }),
    );
    open();
    fireEvent.click(await screen.findByRole("button", { name: "João Dono aceitou" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe o valor");
    fireEvent.change(screen.getByLabelText("Valor para o motorista (R$)"), { target: { value: "350,00" } });
    fireEvent.click(screen.getByRole("button", { name: "João Dono aceitou" }));
    const vehicle = await screen.findByLabelText("Carro da corrida");
    await waitFor(() => expect(vehicle).toHaveValue("v2"));
    expect(within(vehicle).getByRole("option", { name: "C180 Teste (dele)" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Confirmar João por R\$\s350,00/ }));
    await waitFor(() => expect(transferService.accept).toHaveBeenCalledWith("t1", "d2", 35000, "v2"));
    expect(await screen.findByText(/Carro: C180 Teste\./)).toBeInTheDocument();
  });

  it("motorista que não é dono escolhe o carro de outro", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer({ offer_cents: 35000 }));
    vi.mocked(transferService.accept).mockResolvedValue(transfer({ stage: "com_motorista", driver_name: "Pedro Motorista", driver_cents: 35000 }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Pedro Motorista aceitou" }));
    const vehicle = screen.getByLabelText("Carro da corrida");
    expect(vehicle).toHaveValue("");
    await waitFor(() => expect(within(vehicle).getByRole("option", { name: "Jetta Teste" })).toBeInTheDocument());
    fireEvent.change(vehicle, { target: { value: "v1" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar Pedro/ }));
    await waitFor(() => expect(transferService.accept).toHaveBeenCalledWith("t1", "d1", undefined, "v1"));
  });

  it("sem ninguém para chamar, leva ao cadastro de parceiros", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer());
    vi.mocked(transferService.drivers).mockResolvedValue([]);
    open();
    expect(await screen.findByText(/Ninguém para chamar/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parceiros" })).toHaveAttribute("href", "/parceiros");
  });

  it("com motorista: marca o pagamento, registra a desistência e inicia", async () => {
    const assigned = transfer({ stage: "com_motorista", driver_name: "Pedro Motorista", driver_cents: 20000 });
    vi.mocked(transferService.get).mockResolvedValue(assigned);
    vi.mocked(transferService.setPaid).mockResolvedValue({ ...assigned, paid_at: "2026-12-05T10:00:00-03:00" });
    vi.mocked(transferService.start).mockResolvedValue({ ...assigned, stage: "em_andamento" });
    open();
    fireEvent.click(await screen.findByLabelText(/Cliente pagou/));
    await waitFor(() => expect(transferService.setPaid).toHaveBeenCalledWith("t1", true));
    expect(screen.getByRole("button", { name: "Motorista desistiu" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Iniciar corrida" }));
    await waitFor(() => expect(transferService.start).toHaveBeenCalledWith("t1"));
    expect(await screen.findByRole("button", { name: "Concluir corrida" })).toBeInTheDocument();
  });

  it("em andamento: exige pagamento antes de concluir", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer({ stage: "em_andamento", driver_name: "Pedro", driver_cents: 20000 }));
    open();
    expect(await screen.findByText("Marque o pagamento do cliente antes de concluir.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Concluir corrida" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Cancelar transfer" })).toBeNull();
  });

  it("conclui com espera extra", async () => {
    const onTrip = transfer({ stage: "em_andamento", driver_name: "Pedro", driver_cents: 20000, paid_at: "2026-12-05T10:00:00-03:00" });
    vi.mocked(transferService.get).mockResolvedValue(onTrip);
    vi.mocked(transferService.complete).mockResolvedValue({ ...onTrip, stage: "concluido", extra_wait_cents: 5000 });
    open();
    fireEvent.change(await screen.findByLabelText("Espera extra (R$)"), { target: { value: "50,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Concluir corrida" }));
    await waitFor(() => expect(transferService.complete).toHaveBeenCalledWith("t1", 5000));
    expect(await screen.findByText(/R\$\s250,00/)).toBeInTheDocument();
  });

  it("cancela mostrando a multa e sem multa com voo cancelado", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer({ pickup_at: new Date(Date.now() + 3600_000).toISOString() }));
    vi.mocked(transferService.cancel).mockResolvedValue(transfer({ stage: "cancelado", flight_cancelled: true }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar transfer" }));
    expect(screen.getByText(/multa de R\$\s225,00 \(50%\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("A companhia aérea cancelou o voo"));
    expect(screen.getByText(/Sem multa\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar cancelamento" }));
    await waitFor(() => expect(transferService.cancel).toHaveBeenCalledWith("t1", true));
    expect(await screen.findByText(/voo cancelado/)).toBeInTheDocument();
  });

  it("mostra erro quando não encontra", async () => {
    vi.mocked(transferService.get).mockRejectedValue(new Error("404"));
    open();
    expect(await screen.findByText(/Transfer não encontrado/)).toBeInTheDocument();
  });
});
