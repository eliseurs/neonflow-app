import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { Partner } from "../model/partners.types";
import { partnersService } from "../services/partners.service";
import { PartnersPage } from "./PartnersPage";

vi.mock("../services/partners.service", () => ({ partnersService: { list: vi.fn(), create: vi.fn(), update: vi.fn() } }));
vi.mock("qrcode", () => ({ default: { toDataURL: () => Promise.resolve("data:image/png;base64,QR") } }));

const partner = (over: Partial<Partner> = {}): Partner => ({
  id: "p1", name: "Hotel Teste", kinds: ["indicador"], whatsapp: "5554999990000", email: "", city: "Gramado", notes: "",
  referral_code: "HTL234", commission_percent: 10, owner_share_percent: null, driver_share_percent: null, active: true,
  created_at: "", updated_at: "", ...over,
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(partnersService.list).mockResolvedValue([
    partner(),
    partner({ id: "p2", name: "Dono Teste", kinds: ["proprietario", "motorista"], referral_code: "OWN234", commission_percent: null, owner_share_percent: 70 }),
  ]);
});

describe("PartnersPage", () => {
  it("lista com tipos, código e percentuais, e filtra por tipo", async () => {
    renderPage(<PartnersPage />);
    expect(await screen.findByText("Hotel Teste")).toBeInTheDocument();
    expect(screen.getByText("HTL234")).toBeInTheDocument();
    expect(screen.getByText("indicação 10%")).toBeInTheDocument();
    expect(screen.getByText("repasse 70%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Proprietários" }));
    expect(screen.queryByText("Hotel Teste")).toBeNull();
    expect(screen.getByText("Dono Teste")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Indicadores" }));
    expect(screen.queryByText("Dono Teste")).toBeNull();
  });

  it("cadastra com tipos e percentuais e abre o link de indicação", async () => {
    vi.mocked(partnersService.create).mockResolvedValue(partner({ id: "new", name: "Motorista Teste", referral_code: "MOT234" }));
    renderPage(<PartnersPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo parceiro/ }))[0]);
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Nome"), { target: { value: " Motorista Teste " } });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Indicador" }));
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Motorista" }));
    fireEvent.change(within(dialog).getByLabelText("Percentual do motorista (%)"), { target: { value: "75,5" } });
    fireEvent.change(within(dialog).getByLabelText("Comissão de indicação (%)"), { target: { value: "200" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cadastrar" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("entre 0 e 100");

    fireEvent.change(within(dialog).getByLabelText("Comissão de indicação (%)"), { target: { value: "" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cadastrar" }));
    await waitFor(() => expect(partnersService.create).toHaveBeenCalled());
    expect(vi.mocked(partnersService.create).mock.calls[0][0]).toMatchObject({
      name: "Motorista Teste", kinds: ["motorista"], commission_percent: null, driver_share_percent: 75.5, owner_share_percent: null,
    });
    expect(await screen.findByRole("dialog", { name: "Indicação · Motorista Teste" })).toBeInTheDocument();
    expect(screen.getByText("MOT234")).toBeInTheDocument();
  });

  it("mostra link e QR de indicação e copia o link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderPage(<PartnersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Link e QR de Hotel Teste" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(`${window.location.origin}/?ref=HTL234`)).toBeInTheDocument();
    expect(await within(dialog).findByRole("img", { name: /QR code de indicação/ })).toHaveAttribute("src", "data:image/png;base64,QR");
    expect(within(dialog).getByRole("link", { name: /Baixar QR/ })).toHaveAttribute("download", "indicacao-HTL234.png");
    fireEvent.click(within(dialog).getByRole("button", { name: /Copiar link/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/?ref=HTL234`));
  });

  it("exige ao menos um tipo e desativa um parceiro", async () => {
    vi.mocked(partnersService.update).mockResolvedValue(partner({ active: false }));
    renderPage(<PartnersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Editar Hotel Teste" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Indicador" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("ao menos um tipo");
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Indicador" }));
    fireEvent.click(within(dialog).getByLabelText("Ativo"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(partnersService.update).toHaveBeenCalledWith("p1", expect.objectContaining({ active: false, commission_percent: 10 })));
  });
});
