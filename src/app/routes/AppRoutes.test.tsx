import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./AppRoutes";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { authService } from "@/modules/auth/services/auth.service";
import type { User } from "@/modules/auth/model/auth.types";
import { PERMS } from "@/test/permissions";

vi.mock("@/modules/auth/services/auth.service", () => ({
  authService: { login: vi.fn(), me: vi.fn() },
}));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/modules/bookings/services/booking.service", () => ({ bookingService: { list: vi.fn().mockResolvedValue([]) } }));
// A landing busca a frota pública; sem o mock, o teste tentaria a rede.
vi.mock("@/modules/landing/model/fleet", async (orig) => ({
  ...(await orig<typeof import("@/modules/landing/model/fleet")>()),
  loadPublicFleet: () => Promise.resolve([]),
}));
// A tela inicial busca os indicadores; sem o mock, o teste tentaria a rede.
vi.mock("@/modules/dashboard/services/dashboard.service", () => ({
  dashboardService: {
    summary: () => Promise.resolve({ month: "2026-11", pickup_revenue_cents: 0, pickup_count: 0, paid_cents: 0, paid_count: 0, rented_today: 0, fleet_size: 0, occupancy_percent: 0 }),
  },
}));

const user: User = { id: "u1", name: "Maria Central", email: "maria@neonflow.test", role: "central", permissions: PERMS.central, created_at: "", updated_at: "" };
const adminUser: User = { ...user, role: "admin", permissions: PERMS.admin };
const lawyer: User = { ...user, name: "Rita Jurídico", role: "legal_reviewer", permissions: PERMS.legal_reviewer };
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
    expect(screen.getByRole("heading", { name: /^Reservas/ })).toBeInTheDocument();
    await waitFor(() => expect(authService.me).toHaveBeenCalled());
  });

  it("login com sucesso grava a sessão e volta para a rota pedida", async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: "tok", expires_at: future(), user });
    renderAt("/frota");
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "maria@neonflow.test" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-forte-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { name: /^Veículos/ })).toBeInTheDocument();
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
    expect(await screen.findByRole("heading", { name: /^Olá, Maria\./ })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /Sair/ })[0]);
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
    expect(await screen.findByRole("heading", { name: /^Olá, Maria\./ })).toBeInTheDocument();
  });

  it("o menu mostra Usuários só para administração", async () => {
    useAuthStore.getState().setSession("tok", future(), user);
    const { unmount } = renderAt("/central");
    expect(await screen.findAllByRole("link", { name: /Reservas/ })).not.toHaveLength(0);
    expect(screen.queryAllByRole("link", { name: /Usuários/ })).toHaveLength(0);
    unmount();
    useAuthStore.getState().setSession("tok", future(), adminUser);
    vi.mocked(authService.me).mockResolvedValue(adminUser);
    renderAt("/central");
    expect((await screen.findAllByRole("link", { name: /Usuários/ }))[0]).toHaveAttribute("href", "/usuarios");
    expect(screen.getAllByRole("button", { name: /Trocar senha/ }).length).toBeGreaterThan(0);
  });

  it("tela sem permissão mostra o aviso e o caminho para o início do perfil", async () => {
    useAuthStore.getState().setSession("tok", future(), user);
    renderAt("/usuarios");
    expect(await screen.findByText("Seu perfil não abre esta tela")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/central");
    expect(screen.queryByRole("heading", { name: /Quem usa/ })).toBeNull();
  });

  it("jurídico tem o layout de foco, só com contratos, e não abre a operação", async () => {
    vi.mocked(authService.me).mockResolvedValue(lawyer);
    useAuthStore.getState().setSession("tok", future(), lawyer);
    const { container } = renderAt("/reservas");
    expect(await screen.findByText("Seu perfil não abre esta tela")).toBeInTheDocument();
    expect(container.querySelector("[data-layout='foco']")).not.toBeNull();
    expect(screen.getByText("Revisão jurídica")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(within(nav).getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual(["/contratos"]);
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/contratos");
  });

  it("operação tem o layout completo", async () => {
    useAuthStore.getState().setSession("tok", future(), user);
    const { container } = renderAt("/central");
    expect(await screen.findByRole("heading", { name: /^Olá, Maria\./ })).toBeInTheDocument();
    expect(container.querySelector("[data-layout='completo']")).not.toBeNull();
  });

  it("sessão antiga sem permissões espera o /auth/me e aplica o papel atual", async () => {
    useAuthStore.getState().setSession("tok", future(), { ...user, permissions: undefined });
    vi.mocked(authService.me).mockResolvedValue(adminUser);
    renderAt("/usuarios");
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
    expect(screen.queryByText("Seu perfil não abre esta tela")).toBeNull();
    expect(await screen.findByRole("heading", { name: /Quem usa/ })).toBeInTheDocument();
    expect(useAuthStore.getState().user?.permissions).toEqual(PERMS.admin);
  });

  it("login do jurídico leva aos contratos", async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: "tok", expires_at: future(), user: lawyer });
    vi.mocked(authService.me).mockResolvedValue(lawyer);
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "rita@neonflow.test" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-forte-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Revisão jurídica")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("link", { name: /Contratos/ }).length).toBeGreaterThan(0));
  });
});
