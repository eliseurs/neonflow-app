import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import type { User } from "@/modules/auth/model/auth.types";
import { renderPage } from "@/test/render";
import type { PanelUser } from "../model/users.types";
import { usersService } from "../services/users.service";
import { UsersPage } from "./UsersPage";

vi.mock("../services/users.service", () => ({
  usersService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), resetPassword: vi.fn(), changeOwnPassword: vi.fn() },
}));

const admin: User = { id: "a1", name: "Admin Teste", email: "admin@neonflow.test", role: "admin", created_at: "", updated_at: "" };
const panelUser = (over: Partial<PanelUser> = {}): PanelUser => ({
  id: "u2", name: "Ana Teste", email: "ana@neonflow.test", role: "central", active: true, created_at: "", updated_at: "", ...over,
});
const future = () => new Date(Date.now() + 3_600_000).toISOString();

beforeEach(() => {
  vi.resetAllMocks();
  useAuthStore.getState().setSession("tok", future(), admin);
  vi.mocked(usersService.list).mockResolvedValue([
    panelUser({ id: "a1", name: "Admin Teste", email: "admin@neonflow.test", role: "admin" }),
    panelUser(),
    panelUser({ id: "u3", name: "Bia Teste", email: "bia@neonflow.test", active: false }),
  ]);
});

describe("UsersPage", () => {
  it("só administração vê a lista", async () => {
    useAuthStore.getState().setSession("tok", future(), { ...admin, role: "central" });
    renderPage(<UsersPage />);
    expect(screen.getByText("Só para administração")).toBeInTheDocument();
    expect(usersService.list).not.toHaveBeenCalled();
  });

  it("lista papéis e estados, marca você e não oferece redefinir a própria senha", async () => {
    renderPage(<UsersPage />);
    expect(await screen.findByText("Ana Teste")).toBeInTheDocument();
    expect(screen.getByText("você")).toBeInTheDocument();
    expect(screen.getByText("Desativado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redefinir senha de Ana Teste" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Redefinir senha de Admin Teste" })).toBeNull();
  });

  it("cria usuário com senha de 10+ caracteres", async () => {
    vi.mocked(usersService.create).mockResolvedValue(panelUser({ id: "new" }));
    renderPage(<UsersPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo usuário/ }))[0]);
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Nome"), { target: { value: " Caio Teste " } });
    fireEvent.change(within(dialog).getByLabelText("E-mail"), { target: { value: "caio@neonflow.test" } });
    fireEvent.change(within(dialog).getByLabelText("Senha inicial"), { target: { value: "curta" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Criar usuário" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("pelo menos 10");

    fireEvent.change(within(dialog).getByLabelText("Senha inicial"), { target: { value: "senha-forte-123" } });
    fireEvent.change(within(dialog).getByLabelText("Papel"), { target: { value: "admin" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Criar usuário" }));
    await waitFor(() =>
      expect(usersService.create).toHaveBeenCalledWith({ name: "Caio Teste", email: "caio@neonflow.test", password: "senha-forte-123", role: "admin" }),
    );
  });

  it("desativa outro usuário e não deixa o admin se trancar para fora", async () => {
    vi.mocked(usersService.update).mockResolvedValue(panelUser({ active: false }));
    renderPage(<UsersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Editar Ana Teste" }));
    let dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("E-mail")).toBeDisabled();
    fireEvent.click(within(dialog).getByLabelText(/Ativo/));
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(usersService.update).toHaveBeenCalledWith("u2", { name: "Ana Teste", role: "central", active: false }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Editar Admin Teste" }));
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Papel")).toBeDisabled();
    expect(within(dialog).getByLabelText(/Ativo/)).toBeDisabled();
  });

  it("redefine a senha de outro usuário e mostra erro da API", async () => {
    vi.mocked(usersService.resetPassword).mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce(undefined);
    renderPage(<UsersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Redefinir senha de Ana Teste" }));
    const dialog = screen.getByRole("dialog", { name: "Redefinir senha" });
    const field = within(dialog).getByLabelText("Nova senha");
    fireEvent.change(field, { target: { value: "curta" } });
    expect(within(dialog).getByRole("button", { name: "Redefinir senha" })).toBeDisabled();
    fireEvent.change(field, { target: { value: "senha-nova-1234" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Redefinir senha" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Não foi possível redefinir a senha.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Redefinir senha" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(usersService.resetPassword).toHaveBeenLastCalledWith("u2", "senha-nova-1234");
  });
});
