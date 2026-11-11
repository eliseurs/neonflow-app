import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { TermsPanel } from "./components/TermsPanel";
import { suggestedTermsBody, termsMessage, type PublicTerms, type TermsOrder } from "./model/terms.types";
import { PublicTermsPage } from "./pages/PublicTermsPage";
import { TermsAdminPage } from "./pages/TermsAdminPage";
import { termsService } from "./services/terms.service";

vi.mock("./services/terms.service", () => ({
  termsService: { versions: vi.fn(), publish: vi.fn(), createLink: vi.fn(), acceptance: vi.fn(), public: vi.fn(), accept: vi.fn(), acceptOrder: vi.fn() },
}));
vi.mock("@/modules/customers/services/customer.service", () => ({
  customerService: { get: () => Promise.resolve({ id: "c1", name: "Ana Teste", whatsapp: "5554999990001" }) },
}));

beforeEach(() => vi.resetAllMocks());

const publicTerms: PublicTerms = {
  client_name: "Ana Teste", vehicle_name: "Jetta Teste", place: "", start_at: "2026-12-10T10:00:00-03:00", end_at: "2026-12-12T10:00:00-03:00",
  total_cents: 30000, deposit_cents: null, km_limit_per_day: null, extra_km_cents: null, quadro_sha256: "q".repeat(64), order: null,
  terms: { id: "t2", version: 2, body: "1. O condutor...\n2. A caução...", created_at: "" }, accepted: null,
  expires_at: "2026-12-17T10:00:00-03:00",
};

const order: TermsOrder = {
  version_id: "cv1", version: 1, label: "v0.4", title: "Ordem de Locação de Veículo sem Motorista",
  body: "### 1. Objeto e formação\n1.1. O LOCADOR disponibiliza...", sha256: "a".repeat(64),
};

describe("Termos", () => {
  it("sem versão publicada, abre com as condições do site para revisar e publicar", async () => {
    vi.mocked(termsService.versions).mockResolvedValue([]);
    vi.mocked(termsService.publish).mockResolvedValue({ id: "t1", version: 1, body: "Texto", created_at: "" });
    renderPage(<TermsAdminPage />);
    expect(await screen.findByText(/Nenhuma versão publicada/)).toBeInTheDocument();
    expect(screen.getByText(/sugestão com as condições do aluguel que o site já mostra/)).toBeInTheDocument();
    const field = screen.getByLabelText("Texto dos termos");
    expect(field).toHaveValue(suggestedTermsBody());
    // O admin pode publicar como está ou ajustar antes.
    fireEvent.change(field, { target: { value: "Texto do jurídico" } });
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));
    await waitFor(() => expect(termsService.publish).toHaveBeenCalledWith("Texto do jurídico"));
  });

  it("texto sugerido traz as condições do aluguel do site, numeradas", () => {
    const body = suggestedTermsBody();
    expect(body.split("\n")[0]).toBe("Condições do aluguel sem motorista");
    expect(body).toContain("1. Condutor com 21 anos ou mais e habilitação há pelo menos 1 ano.");
    expect(body).toContain("Cancelamento grátis até 48 horas antes da retirada.");
    expect(body).not.toContain("Transfer");
  });

  it("admin vê a versão atual e as anteriores", async () => {
    vi.mocked(termsService.versions).mockResolvedValue([
      { id: "t2", version: 2, body: "Texto 2", created_at: "2026-11-06T10:00:00-03:00" },
      { id: "t1", version: 1, body: "Texto 1", created_at: "2026-11-05T10:00:00-03:00" },
    ]);
    renderPage(<TermsAdminPage />);
    expect(await screen.findByText(/Versão atual: 2/)).toBeInTheDocument();
    expect(screen.getByLabelText("Texto dos termos")).toHaveValue("Texto 2");
    expect(screen.getByRole("button", { name: "Publicar nova versão" })).toBeDisabled();
    expect(screen.getByText(/Versão 1 ·/)).toBeInTheDocument();
  });

  it("na reserva, gera o link e monta o WhatsApp para o número do cliente", async () => {
    vi.mocked(termsService.acceptance).mockResolvedValue(null);
    vi.mocked(termsService.createLink).mockResolvedValue({ token: "abc", path: "/termos/abc", expires_at: "2026-12-17T10:00:00-03:00" });
    renderPage(<TermsPanel bookingId="b1" clientName="Ana Teste" customerId="c1" canSend />);
    expect(await screen.findByText(/ainda não aceitou/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gerar link de aceite" }));
    expect(await screen.findByText(`${window.location.origin}/termos/abc`)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("link", { name: /Enviar no WhatsApp/ }).getAttribute("href")).toContain("wa.me/5554999990001"));
  });

  it("na reserva, mostra o aceite registrado", async () => {
    vi.mocked(termsService.acceptance).mockResolvedValue({ document: "termos", version: 2, typed_name: "Ana Teste", accepted_at: "2026-11-06T15:00:00-03:00" });
    renderPage(<TermsPanel bookingId="b1" clientName="Ana Teste" customerId={null} canSend />);
    expect(await screen.findByText(/Aceitos por/)).toHaveTextContent("Ana Teste em 06/11/2026 15:00 (versão 2)");
    expect(screen.getByRole("button", { name: "Gerar novo link" })).toBeInTheDocument();
  });

  it("cliente lê e aceita pelo link, com a versão que leu", async () => {
    vi.mocked(termsService.public).mockResolvedValue(publicTerms);
    vi.mocked(termsService.accept).mockResolvedValue({ document: "termos", version: 2, typed_name: "Ana Teste", accepted_at: "2026-11-06T15:00:00-03:00" });
    renderPage(<PublicTermsPage />, { path: "/termos/:token", route: "/termos/abc" });
    expect(await screen.findByText("Jetta Teste")).toBeInTheDocument();
    expect(screen.getByText(/Termos \(versão 2\)/)).toBeInTheDocument();
    expect(screen.getByText(/A caução/)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "Aceitar os termos" });
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Seu nome completo"), { target: { value: "Ana Teste" } });
    expect(btn).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Li e aceito/));
    fireEvent.click(btn);
    await waitFor(() => expect(termsService.accept).toHaveBeenCalledWith("abc", "Ana Teste", 2));
    expect(await screen.findByRole("status")).toHaveTextContent("Termos aceitos por Ana Teste");
  });

  it("com a Ordem 04 publicada, o cliente lê a Ordem e o quadro e aceita com versão e hashes", async () => {
    vi.mocked(termsService.public).mockResolvedValue({
      ...publicTerms, terms: null, order, place: "Hotel Teste, Gramado", deposit_cents: 35000, km_limit_per_day: 200, extra_km_cents: 150,
    });
    vi.mocked(termsService.acceptOrder).mockResolvedValue({
      document: "ordem_04", version: 1, sha256: order.sha256, typed_name: "Ana Teste", accepted_at: "2026-11-08T15:00:00-03:00",
    });
    renderPage(<PublicTermsPage />, { path: "/termos/:token", route: "/termos/abc" });
    expect(await screen.findByText(/Ordem de Locação de Veículo sem Motorista \(versão 1\)/)).toBeInTheDocument();
    expect(screen.getByText(/O LOCADOR disponibiliza/)).toBeInTheDocument();
    expect(screen.getByText(`SHA-256 ${order.sha256}`)).toBeInTheDocument();
    expect(screen.getByText("Local: Hotel Teste, Gramado")).toBeInTheDocument();
    expect(screen.getByText(/Caução: R\$\s?350,00/)).toBeInTheDocument();
    expect(screen.getByText(/200 km por dia, excedente R\$\s?1,50 por km/)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "Aceitar a Ordem de Locação" });
    fireEvent.change(screen.getByLabelText("Seu nome completo"), { target: { value: "Ana Teste" } });
    expect(btn).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Li a íntegra da Ordem de Locação/));
    fireEvent.click(btn);
    await waitFor(() => expect(termsService.acceptOrder).toHaveBeenCalledWith("abc", "Ana Teste", order, "q".repeat(64)));
    expect(termsService.accept).not.toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent("Ordem de Locação aceita por Ana Teste");
  });

  it("na reserva, mostra o aceite da Ordem 04", async () => {
    vi.mocked(termsService.acceptance).mockResolvedValue({
      document: "ordem_04", version: 1, sha256: order.sha256, typed_name: "Ana Teste", accepted_at: "2026-11-08T15:00:00-03:00",
    });
    renderPage(<TermsPanel bookingId="b1" clientName="Ana Teste" customerId={null} canSend />);
    expect(await screen.findByText(/Ordem de Locação aceita por/)).toHaveTextContent("Ana Teste em 08/11/2026 15:00 (versão 1)");
  });

  it("link vencido mostra o aviso", async () => {
    vi.mocked(termsService.public).mockRejectedValue(new Error("404"));
    renderPage(<PublicTermsPage />, { path: "/termos/:token", route: "/termos/velho" });
    expect(await screen.findByText(/Link inválido ou vencido/)).toBeInTheDocument();
  });

  it("monta a mensagem para o cliente", () => {
    expect(termsMessage("Ana Teste", "https://x/termos/a")).toBe(
      "Olá, Ana! Aqui é a central da Neon Flow. Para confirmar a sua reserva, leia e aceite os termos do aluguel neste link: https://x/termos/a",
    );
  });
});
