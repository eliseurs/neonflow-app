import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./AppRoutes";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { authService } from "@/modules/auth/services/auth.service";
import type { User } from "@/modules/auth/model/auth.types";

vi.mock("@/modules/auth/services/auth.service", () => ({
  authService: { login: vi.fn(), me: vi.fn() },
}));

const user: User = { id: "u1", name: "Maria Central", email: "maria@neonflow.test", role: "central", created_at: "", updated_at: "" };
const future = () => new Date(Date.now() + 3_600_000).toISOString();

function renderAt(path: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(authService.me).mockResolvedValue(user);
  useAuthStore.getState().clear();
});

describe("rotas", () => {
  it("redireciona para o login sem sessão", () => {
    renderAt("/frota");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("mostra o painel com sessão válida e carrega /auth/me", async () => {
    useAuthStore.getState().setSession("tok", future(), user);
    renderAt("/reservas");
    expect(screen.getByRole("heading", { name: "Reservas" })).toBeInTheDocument();
    await waitFor(() => expect(authService.me).toHaveBeenCalled());
  });

  it("login com sucesso grava a sessão e volta para a rota pedida", async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: "tok", expires_at: future(), user });
    renderAt("/frota");
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "maria@neonflow.test" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-forte-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { name: "Veículos" })).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe("tok");
    expect(vi.mocked(authService.login).mock.calls[0][0]).toEqual({ email: "maria@neonflow.test", password: "senha-forte-123" });
  });

  it("login com erro mostra a mensagem", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("x"));
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "a@b.test" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível entrar.");
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("sair limpa a sessão e volta ao login", async () => {
    useAuthStore.getState().setSession("tok", future(), user);
    renderAt("/central");
    expect(await screen.findByRole("heading", { name: "Olá, Maria" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sair/ }));
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("rota desconhecida volta para a landing", () => {
    renderAt("/nao-existe");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Serra Gaúcha.");
  });

  it("a landing é pública e o painel fica em /central", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: /Área da central|Staff area/ })).toHaveAttribute("href", "/login");
    renderAt("/central");
    expect(screen.getAllByRole("button", { name: "Entrar" }).length).toBeGreaterThan(0);
  });

  it("login sem rota pedida leva à central", async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: "tok", expires_at: future(), user });
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "maria@neonflow.test" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-forte-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("CENTRAL DE MOBILIDADE")).toBeInTheDocument();
  });
});
