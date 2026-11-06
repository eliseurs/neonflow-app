import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { TermsPanel } from "./components/TermsPanel";
import { termsMessage } from "./model/terms.types";
import { PublicTermsPage } from "./pages/PublicTermsPage";
import { TermsAdminPage } from "./pages/TermsAdminPage";
import { termsService } from "./services/terms.service";

vi.mock("./services/terms.service", () => ({
  termsService: { versions: vi.fn(), publish: vi.fn(), createLink: vi.fn(), acceptance: vi.fn(), public: vi.fn(), accept: vi.fn() },
}));
vi.mock("@/modules/customers/services/customer.service", () => ({
  customerService: { get: () => Promise.resolve({ id: "c1", name: "Ana Teste", whatsapp: "5554999990001" }) },
}));

beforeEach(() => vi.resetAllMocks());

const publicTerms = {
  client_name: "Ana Teste", vehicle_name: "Jetta Teste", start_at: "2026-12-10T10:00:00-03:00", end_at: "2026-12-12T10:00:00-03:00",
  total_cents: 30000, terms: { id: "t2", version: 2, body: "1. O condutor...\n2. A caução...", created_at: "" }, accepted: null,
  expires_at: "2026-12-17T10:00:00-03:00",
};

describe("Termos", () => {
  it("admin publica a primeira versão e depois uma nova", async () => {
    vi.mocked(termsService.versions).mockResolvedValue([]);
    vi.mocked(termsService.publish).mockResolvedValue({ id: "t1", version: 1, body: "Texto", created_at: "" });
    renderPage(<TermsAdminPage />);
    expect(await screen.findByText(/Nenhuma versão publicada/)).toBeInTheDocument();
    const field = screen.getByLabelText("Texto dos termos");
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
    fireEvent.change(field, { target: { value: "Texto do jurídico" } });
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));
    await waitFor(() => expect(termsService.publish).toHaveBeenCalledWith("Texto do jurídico"));
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
    vi.mocked(termsService.acceptance).mockResolvedValue({ version: 2, typed_name: "Ana Teste", accepted_at: "2026-11-06T15:00:00-03:00" });
    renderPage(<TermsPanel bookingId="b1" clientName="Ana Teste" customerId={null} canSend />);
    expect(await screen.findByText(/Aceitos por/)).toHaveTextContent("Ana Teste em 06/11/2026 15:00 (versão 2)");
    expect(screen.getByRole("button", { name: "Gerar novo link" })).toBeInTheDocument();
  });

  it("cliente lê e aceita pelo link, com a versão que leu", async () => {
    vi.mocked(termsService.public).mockResolvedValue(publicTerms);
    vi.mocked(termsService.accept).mockResolvedValue({ version: 2, typed_name: "Ana Teste", accepted_at: "2026-11-06T15:00:00-03:00" });
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
