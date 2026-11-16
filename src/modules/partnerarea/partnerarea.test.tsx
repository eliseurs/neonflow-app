import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { PartnerArea } from "./components/PartnerArea";
import { payoutLabel, totals, type PartnerAreaData } from "./model/partnerarea.types";
import { partnerAreaService } from "./services/partnerarea.service";

vi.mock("./services/partnerarea.service", () => ({ partnerAreaService: { area: vi.fn(), accept: vi.fn(), release: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("qrcode", () => ({ default: { toDataURL: () => Promise.resolve("data:image/png;base64,QR") } }));

beforeEach(() => vi.resetAllMocks());

const area = (over: Partial<PartnerAreaData> = {}): PartnerAreaData => ({
  partner: { id: "p1", name: "Pedro", kinds: ["proprietario"], referral_code: "PEDRO2" },
  vehicles: [{ id: "v1", name: "Jetta Pedro", plate: "AAA1A11", in_maintenance: true }],
  bookings: [
    {
      id: "b1", vehicle_name: "Jetta Pedro", start_at: "2026-12-10T13:00:00Z", end_at: "2026-12-12T13:00:00Z", stage: "encerrada", days: 2,
      extra_minutes: 30, excess_km: 0, payout: { base_cents: 40000, percent_bp: 7000, amount_cents: 28000, paid_at: "2026-12-20T15:00:00Z" },
    },
    { id: "b2", vehicle_name: "Jetta Pedro", start_at: "2026-12-20T13:00:00Z", end_at: "2026-12-21T13:00:00Z", stage: "confirmada", days: 1, extra_minutes: 0, excess_km: 0, payout: null },
  ],
  rides: [],
  offers: [],
  referrals: [{ id: "r1", kind: "transfer", at: "2026-12-05T12:00:00Z", stage: "concluido", payout: { base_cents: 50000, percent_bp: null, amount_cents: null, paid_at: null } }],
  ...over,
});

describe("modelo", () => {
  it("descreve o pagamento e soma pago e pendente", () => {
    expect(payoutLabel({ base_cents: 40000, percent_bp: 7000, amount_cents: 28000, paid_at: "2026-12-20T15:00:00Z" })).toMatch(/R\$\s280,00 · 70% de R\$\s400,00 · pago em 20\/12\/2026/);
    expect(payoutLabel({ base_cents: 40000, percent_bp: 1250, amount_cents: 5000, paid_at: null })).toMatch(/12,5% de .* · pendente/);
    expect(payoutLabel({ base_cents: 40000, percent_bp: null, amount_cents: null, paid_at: null })).toContain("percentual a definir");
    expect(payoutLabel(null)).toBe("A receber: gerado no encerramento");
    expect(totals([{ base_cents: 1, percent_bp: 1, amount_cents: 100, paid_at: "x" }, { base_cents: 1, percent_bp: 1, amount_cents: 50, paid_at: null }, null])).toEqual({ paid: 100, pending: 50 });
  });
});

describe("área do parceiro", () => {
  it("proprietário vê carros, reservas com o repasse e indicações, sem corridas", async () => {
    vi.mocked(partnerAreaService.area).mockResolvedValue(area());
    renderPage(<PartnerArea />);
    const bookings = await screen.findByRole("region", { name: "Reservas dos meus carros" });
    expect(within(bookings).getByText(/70% de/)).toBeInTheDocument();
    expect(within(bookings).getByText(/atraso de 30 min/)).toBeInTheDocument();
    expect(within(bookings).getByText(/gerado no encerramento/)).toBeInTheDocument();
    expect(screen.getByText("Em manutenção")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Minhas corridas" })).toBeNull();
    expect(within(screen.getByRole("region", { name: "Minhas indicações" })).getByText(/percentual a definir/)).toBeInTheDocument();
    expect(screen.getByText(/Recebido:/)).toHaveTextContent("280,00");
    expect(screen.getByText("PEDRO2")).toBeInTheDocument();
    expect(screen.queryByText(/Indicado por/)).toBeNull();
  });

  it("motorista vê as corridas com o cliente, sem carros", async () => {
    vi.mocked(partnerAreaService.area).mockResolvedValue(
      area({
        partner: { id: "p2", name: "Mário", kinds: ["motorista"], referral_code: "MARIO2" },
        vehicles: [], bookings: [], referrals: [],
        rides: [{ id: "t1", pickup_at: "2026-12-10T11:30:00Z", origin: "POA", destination: "Gramado", flight: "G3 1", passengers: 2, client_name: "Ana", stage: "com_motorista", driver_cents: 30000, payout: null }],
      }),
    );
    renderPage(<PartnerArea />);
    const rides = await screen.findByRole("region", { name: "Minhas corridas" });
    expect(within(rides).getByText(/Ana · 2 passageiros · voo G3 1/)).toBeInTheDocument();
    expect(within(rides).getByText(/300,00 · gerado na conclusão/)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Meus carros" })).toBeNull();
    expect(screen.getByText(/Nenhuma indicação ainda/)).toBeInTheDocument();
  });

  it("motorista aceita a corrida da oferta com um carro dele e desiste de outra", async () => {
    vi.mocked(partnerAreaService.area).mockResolvedValue(
      area({
        partner: { id: "p2", name: "Mário", kinds: ["proprietario", "motorista"], referral_code: "MARIO2" },
        vehicles: [{ id: "v7", name: "Spin Mário", plate: "CCC3C33", in_maintenance: false }],
        bookings: [], referrals: [],
        offers: [{ id: "t9", pickup_at: "2026-12-11T11:30:00Z", origin: "CXJ", destination: "Canela", flight: "", passengers: 1, client_name: "Bia", offer_cents: 25000 }],
        rides: [{ id: "t1", pickup_at: "2026-12-10T11:30:00Z", origin: "POA", destination: "Gramado", flight: "", passengers: 2, client_name: "Ana", stage: "com_motorista", driver_cents: 30000, payout: null }],
      }),
    );
    vi.mocked(partnerAreaService.accept).mockResolvedValue({ accepted: true });
    vi.mocked(partnerAreaService.release).mockResolvedValue({ released: true });
    renderPage(<PartnerArea />);
    const offers = await screen.findByRole("region", { name: "Corridas disponíveis" });
    expect(within(offers).getByText(/Bia · 1 passageiro/)).toBeInTheDocument();
    fireEvent.change(within(offers).getByLabelText("Carro para CXJ → Canela"), { target: { value: "v7" } });
    fireEvent.click(within(offers).getByRole("button", { name: "Aceitar CXJ → Canela" }));
    await waitFor(() => expect(partnerAreaService.accept).toHaveBeenCalledWith("t9", "v7"));

    fireEvent.click(screen.getByRole("button", { name: "Desistir da corrida" }));
    expect(partnerAreaService.release).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar a desistência" }));
    await waitFor(() => expect(partnerAreaService.release).toHaveBeenCalledWith("t1"));
  });

  it("outro motorista levou antes: mostra o aviso", async () => {
    vi.mocked(partnerAreaService.area).mockResolvedValue(
      area({
        partner: { id: "p2", name: "Mário", kinds: ["motorista"], referral_code: "MARIO2" },
        vehicles: [], bookings: [], rides: [], referrals: [],
        offers: [{ id: "t9", pickup_at: "2026-12-11T11:30:00Z", origin: "CXJ", destination: "Canela", flight: "", passengers: 1, client_name: "Bia", offer_cents: 25000 }],
      }),
    );
    vi.mocked(partnerAreaService.accept).mockRejectedValue(new Error("x"));
    const { toast } = await import("sonner");
    renderPage(<PartnerArea />);
    expect(screen.queryByLabelText(/Carro para/)).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Aceitar CXJ → Canela" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Não foi possível aceitar a corrida."));
    expect(partnerAreaService.accept).toHaveBeenCalledWith("t9", undefined);
  });

  it("mostra o erro da API", async () => {
    vi.mocked(partnerAreaService.area).mockRejectedValue(new Error("x"));
    renderPage(<PartnerArea />);
    expect(await screen.findByText("Não foi possível carregar a sua área.")).toBeInTheDocument();
  });
});
