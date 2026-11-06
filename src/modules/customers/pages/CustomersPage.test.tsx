import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { Customer } from "../model/customer.types";
import { customerService } from "../services/customer.service";
import { CustomersPage } from "./CustomersPage";

vi.mock("../services/customer.service", () => ({ customerService: { list: vi.fn(), create: vi.fn() } }));

export const customer = (over: Partial<Customer> = {}): Customer => ({
  id: "c1", name: "Ana Teste", whatsapp: "5554999990001", email: "ana@exemplo.test", language: "pt", notes: "",
  anonymized_at: null, created_at: "", updated_at: "", booking_count: 2, transfer_count: 1, ...over,
});

beforeEach(() => vi.resetAllMocks());

describe("CustomersPage", () => {
  it("lista com contato, contagem e idioma, e busca", async () => {
    vi.mocked(customerService.list).mockResolvedValue([
      customer(),
      customer({ id: "c2", name: "Cliente anonimizado", whatsapp: "", email: "", anonymized_at: "2026-11-06T10:00:00-03:00", booking_count: 1, transfer_count: 0 }),
    ]);
    renderPage(<CustomersPage />);
    expect(await screen.findByText("Ana Teste")).toBeInTheDocument();
    expect(screen.getByText(/\+55 54 99999-0001 · ana@exemplo.test/)).toBeInTheDocument();
    expect(screen.getByText("2 reservas · 1 transfer")).toBeInTheDocument();
    expect(screen.getByText("Português")).toBeInTheDocument();
    expect(screen.getByText("Anonimizado")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Buscar cliente"), { target: { value: "ana" } });
    await waitFor(() => expect(customerService.list).toHaveBeenCalledWith("ana"));
  });

  it("cadastra um cliente", async () => {
    vi.mocked(customerService.list).mockResolvedValue([]);
    vi.mocked(customerService.create).mockResolvedValue(customer({ id: "novo" }));
    renderPage(<CustomersPage />, { path: "/clientes", route: "/clientes" });
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo cliente/ }))[0]);
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Nome"), { target: { value: " Ana Teste " } });
    fireEvent.change(within(dialog).getByLabelText("WhatsApp"), { target: { value: "+55 54 99999-0001" } });
    fireEvent.change(within(dialog).getByLabelText("Idioma"), { target: { value: "en" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cadastrar" }));
    await waitFor(() => expect(customerService.create).toHaveBeenCalledWith({
      name: "Ana Teste", whatsapp: "+55 54 99999-0001", email: "", language: "en", notes: "",
    }));
  });

  it("mostra o erro de WhatsApp repetido", async () => {
    vi.mocked(customerService.list).mockResolvedValue([]);
    vi.mocked(customerService.create).mockRejectedValue(new Error("já existe"));
    renderPage(<CustomersPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo cliente/ }))[0]);
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Nome"), { target: { value: "Ana" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cadastrar" }));
    expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
  });
});
