import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { AcceptInvitePage } from "./pages/AcceptInvitePage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignupPage } from "./pages/SignupPage";
import { accountService } from "./services/account.service";

vi.mock("./services/account.service", () => ({
  accountService: { signup: vi.fn(), confirm: vi.fn(), forgotPassword: vi.fn(), resetPassword: vi.fn(), acceptInvite: vi.fn(), invitePartner: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("Conta", () => {
  it("cadastro confere a senha e mostra o aviso do e-mail", async () => {
    vi.mocked(accountService.signup).mockResolvedValue({ message: "ok" });
    renderPage(<SignupPage />);
    type("Nome", "Ana Teste");
    type("E-mail", "ana@neonflow.test");
    type("Senha", "curta");
    type("Confirmar senha", "curta");
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(await screen.findByText(/pelo menos 10 caracteres/)).toBeInTheDocument();
    expect(accountService.signup).not.toHaveBeenCalled();

    type("Senha", "senha-forte-1");
    type("Confirmar senha", "senha-forte-1");
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(accountService.signup).toHaveBeenCalledWith({ name: "Ana Teste", email: "ana@neonflow.test", password: "senha-forte-1" }));
    expect(await screen.findByRole("status")).toHaveTextContent("ana@neonflow.test");
  });

  it("confirma o e-mail pelo link", async () => {
    vi.mocked(accountService.confirm).mockResolvedValue({ confirmed: true });
    renderPage(<ConfirmEmailPage />, { path: "/conta/confirmar/:token", route: "/conta/confirmar/abc" });
    expect(await screen.findByText(/E-mail confirmado/)).toBeInTheDocument();
    expect(accountService.confirm).toHaveBeenCalledTimes(1);
    expect(accountService.confirm).toHaveBeenCalledWith("abc");
  });

  it("link de confirmação inválido oferece entrar ou cadastrar de novo", async () => {
    vi.mocked(accountService.confirm).mockRejectedValue(new Error("x"));
    renderPage(<ConfirmEmailPage />, { path: "/conta/confirmar/:token", route: "/conta/confirmar/abc" });
    expect(await screen.findByText(/Não foi possível confirmar/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cadastrar de novo" })).toHaveAttribute("href", "/conta/cadastro");
  });

  it("esqueci a senha envia o e-mail e mostra a mesma resposta", async () => {
    vi.mocked(accountService.forgotPassword).mockResolvedValue({ message: "ok" });
    renderPage(<ForgotPasswordPage />);
    type("E-mail da conta", "bia@neonflow.test");
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByRole("status")).toHaveTextContent("1 hora");
    expect(accountService.forgotPassword).toHaveBeenCalledWith("bia@neonflow.test");
  });

  it("nova senha e aceite do convite usam o código do link", async () => {
    vi.mocked(accountService.resetPassword).mockResolvedValue({ password_changed: true });
    renderPage(<ResetPasswordPage />, { path: "/conta/nova-senha/:token", route: "/conta/nova-senha/r1" });
    type("Senha", "senha-nova-123");
    type("Confirmar senha", "outra-senha-12");
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));
    expect(await screen.findByText(/não confere/)).toBeInTheDocument();
    type("Confirmar senha", "senha-nova-123");
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));
    expect(await screen.findByText(/Senha alterada/)).toBeInTheDocument();
    expect(accountService.resetPassword).toHaveBeenCalledWith("r1", "senha-nova-123");
  });

  it("parceiro convidado cria o acesso", async () => {
    vi.mocked(accountService.acceptInvite).mockResolvedValue({ account_created: true });
    renderPage(<AcceptInvitePage />, { path: "/conta/convite/:token", route: "/conta/convite/i1" });
    type("Senha", "senha-pedro-123");
    type("Confirmar senha", "senha-pedro-123");
    fireEvent.click(screen.getByRole("button", { name: "Criar acesso" }));
    expect(await screen.findByText(/Conta criada/)).toBeInTheDocument();
    expect(accountService.acceptInvite).toHaveBeenCalledWith("i1", "senha-pedro-123");
  });
});
