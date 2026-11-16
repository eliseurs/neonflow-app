import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { describe as describeRequest, priceLabel, whatsappMessage, type ClientCar, type RequestDetail } from "./model/requests.types";
import { MyRequestPage } from "./pages/MyRequestPage";
import { NewRequestPage } from "./pages/NewRequestPage";
import { RequestPage } from "./pages/RequestPage";
import { RequestsPage } from "./pages/RequestsPage";
import { clientRequestsService, requestsService } from "./services/requests.service";

vi.mock("./services/requests.service", () => ({
  clientRequestsService: { cars: vi.fn(), list: vi.fn(), get: vi.fn(), create: vi.fn(), resubmit: vi.fn(), cancel: vi.fn() },
  requestsService: { list: vi.fn(), get: vi.fn(), confirm: vi.fn(), adjust: vi.fn(), refuse: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => vi.resetAllMocks());

const car: ClientCar = {
  id: "v1", name: "Jetta Teste", category: "economy", seats: 5, gear: "manual",
  days: 2, daily_rate_cents: 20000, total_cents: 40000, deposit_cents: 35000, km_limit_per_day: 200, extra_km_cents: null,
};

const rental = (over: Partial<RequestDetail> = {}): RequestDetail => ({
  id: "r1", kind: "aluguel", status: "solicitado", customer_id: "c1", customer_name: "Ana Teste", email: "ana@neonflow.test", whatsapp: "5554999990001",
  notes: "", referred_by_partner_id: null, vehicle_id: "v1", vehicle_name: "Jetta Teste", start_at: "2026-12-10T13:00:00Z", end_at: "2026-12-12T13:00:00Z",
  place: "", km_plan: "", days: 2, daily_rate_cents: 20000, total_cents: 40000, deposit_cents: 35000, km_limit_per_day: 200, extra_km_cents: null,
  origin: "", destination: "", pickup_at: null, passengers: null, flight: "", central_note: "", booking_id: null, transfer_id: null,
  created_at: "2026-11-16T13:00:00Z", updated_at: "", events: [{ from_status: null, to_status: "solicitado", note: "", user_id: "u1", created_at: "2026-11-16T13:00:00Z" }],
  ...over,
});

const transfer = (over: Partial<RequestDetail> = {}): RequestDetail =>
  rental({
    id: "r2", kind: "transfer", vehicle_id: null, vehicle_name: "", start_at: null, end_at: null, days: null, daily_rate_cents: null, total_cents: null,
    deposit_cents: null, km_limit_per_day: null, origin: "POA", destination: "Gramado", pickup_at: "2026-12-10T11:30:00Z", passengers: 2, ...over,
  });

describe("modelo", () => {
  it("descreve, mostra o valor e monta a mensagem do WhatsApp", () => {
    expect(describeRequest(rental())).toBe("Aluguel · Jetta Teste · 10/12/2026 10:00 → 12/12/2026 10:00");
    expect(describeRequest(transfer())).toBe("Transfer · POA → Gramado · 10/12/2026 08:30");
    expect(priceLabel(transfer())).toBe("Sob consulta");
    expect(whatsappMessage(rental({ status: "ajuste_pedido", central_note: "Pode ser no dia 11?" }))).toContain("Olá, Ana! Sobre o seu pedido de aluguel do Jetta Teste");
    expect(whatsappMessage(rental({ status: "confirmado" }))).toContain("Confirmamos o seu pedido");
    expect(whatsappMessage(transfer({ status: "recusado", central_note: "Sem motorista" }))).toContain("transfer POA → Gramado");
  });
});

describe("cliente", () => {
  it("pede aluguel: escolhe o período, vê os carros com valor e envia", async () => {
    vi.mocked(clientRequestsService.cars).mockResolvedValue([car]);
    vi.mocked(clientRequestsService.create).mockResolvedValue(rental());
    renderPage(<NewRequestPage />);
    fireEvent.change(screen.getByLabelText("Retirada"), { target: { value: "2026-12-10T10:00" } });
    fireEvent.change(screen.getByLabelText("Devolução"), { target: { value: "2026-12-12T10:00" } });
    expect(await screen.findByText("Jetta Teste")).toBeInTheDocument();
    expect(clientRequestsService.cars).toHaveBeenCalledWith("2026-12-10T10:00", "2026-12-12T10:00");

    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    expect(await screen.findByText(/WhatsApp com DDI/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "+55 54 99999-0001" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    expect(await screen.findByText(/Escolha um carro/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio"));
    expect(screen.getByText(/Valor estimado/)).toHaveTextContent("400,00");
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    await waitFor(() =>
      expect(clientRequestsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "aluguel", vehicle_id: "v1", start_at: "2026-12-10T10:00", end_at: "2026-12-12T10:00", whatsapp: "+55 54 99999-0001" }),
      ),
    );
    expect(await screen.findByText("outra rota")).toBeInTheDocument();
  });

  it("pede transfer sem valor", async () => {
    vi.mocked(clientRequestsService.create).mockResolvedValue(transfer());
    renderPage(<NewRequestPage />);
    fireEvent.click(screen.getByRole("button", { name: "Transfer" }));
    expect(screen.getByText(/valor do transfer é informado pela central/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Origem"), { target: { value: "POA" } });
    fireEvent.change(screen.getByLabelText("Destino"), { target: { value: "Gramado" } });
    fireEvent.change(screen.getByLabelText("Data e horário"), { target: { value: "2026-12-10T08:30" } });
    fireEvent.change(screen.getByLabelText("Passageiros"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "5554999990001" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    await waitFor(() =>
      expect(clientRequestsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "transfer", origin: "POA", destination: "Gramado", pickup_at: "2026-12-10T08:30", passengers: 3 }),
      ),
    );
  });

  it("em ajuste, mostra a mensagem, reenvia e cancela", async () => {
    vi.mocked(clientRequestsService.get).mockResolvedValue(rental({ status: "ajuste_pedido", central_note: "Pode devolver um dia depois?" }));
    vi.mocked(clientRequestsService.cars).mockResolvedValue([car]);
    vi.mocked(clientRequestsService.resubmit).mockResolvedValue(rental());
    vi.mocked(clientRequestsService.cancel).mockResolvedValue(rental({ status: "cancelado" }));
    renderPage(<MyRequestPage />, { path: "/minha-conta/pedidos/:id", route: "/minha-conta/pedidos/r1" });
    expect(await screen.findByText("Pode devolver um dia depois?")).toBeInTheDocument();
    expect(screen.getByText("Ajuste pedido")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Alterar e reenviar" }));
    expect(screen.getByLabelText("Retirada")).toHaveValue("2026-12-10T10:00");
    expect(screen.queryByRole("group", { name: "Tipo de pedido" })).toBeNull();
    fireEvent.click(await screen.findByRole("radio"));
    fireEvent.click(screen.getByRole("button", { name: "Reenviar pedido" }));
    await waitFor(() => expect(clientRequestsService.resubmit).toHaveBeenCalledWith("r1", expect.objectContaining({ vehicle_id: "v1", whatsapp: "5554999990001" })));

    fireEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    expect(clientRequestsService.cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar o cancelamento" }));
    await waitFor(() => expect(clientRequestsService.cancel).toHaveBeenCalledWith("r1"));
  });
});

describe("central", () => {
  it("lista os pedidos aguardando e filtra", async () => {
    vi.mocked(requestsService.list).mockResolvedValue([rental()]);
    renderPage(<RequestsPage />);
    expect(await screen.findByText("Ana Teste")).toBeInTheDocument();
    expect(requestsService.list).toHaveBeenCalledWith("solicitado");
    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    await waitFor(() => expect(requestsService.list).toHaveBeenCalledWith(undefined));
  });

  it("confirma o transfer com o preço e avisa no WhatsApp", async () => {
    vi.mocked(requestsService.get).mockResolvedValue(transfer());
    vi.mocked(requestsService.confirm).mockResolvedValue(transfer({ status: "confirmado" }));
    renderPage(<RequestPage />, { path: "/pedidos/:id", route: "/pedidos/r2" });
    const chat = await screen.findByRole("link", { name: "Avisar no WhatsApp" });
    expect(chat.getAttribute("href")).toContain("https://wa.me/5554999990001?text=");

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));
    expect(await screen.findByText("Informe o preço do transfer.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Preço do transfer (R$)"), { target: { value: "350,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));
    await waitFor(() => expect(requestsService.confirm).toHaveBeenCalledWith("r2", 35000));
  });

  it("pede ajuste com mensagem e mostra o erro da API", async () => {
    vi.mocked(requestsService.get).mockResolvedValue(rental());
    vi.mocked(requestsService.adjust).mockRejectedValue(new Error("x"));
    renderPage(<RequestPage />, { path: "/pedidos/:id", route: "/pedidos/r1" });
    fireEvent.click(await screen.findByRole("button", { name: "Pedir ajuste" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Pedir ajuste" }).at(-1)!);
    expect(await screen.findByText("Escreva a mensagem para o cliente.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("O que o cliente precisa mudar"), { target: { value: "Outro dia?" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Pedir ajuste" }).at(-1)!);
    await waitFor(() => expect(requestsService.adjust).toHaveBeenCalledWith("r1", "Outro dia?"));
    expect(await screen.findByText("Não foi possível registrar a resposta.")).toBeInTheDocument();
  });

  it("confirmado mostra o atalho para a reserva e sem ações", async () => {
    vi.mocked(requestsService.get).mockResolvedValue(rental({ status: "confirmado", booking_id: "b1" }));
    renderPage(<RequestPage />, { path: "/pedidos/:id", route: "/pedidos/r1" });
    expect(await screen.findByRole("link", { name: "Abrir a reserva" })).toHaveAttribute("href", "/reservas/b1");
    expect(screen.queryByRole("button", { name: "Confirmar" })).toBeNull();
  });
});
