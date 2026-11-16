import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usersService } from "@/modules/users/services/users.service";
import { renderPage } from "@/test/render";
import { auditService } from "../services/audit.service";
import { AuditPage } from "./AuditPage";

vi.mock("../services/audit.service", () => ({ auditService: { list: vi.fn() } }));
vi.mock("@/modules/users/services/users.service", () => ({ usersService: { list: vi.fn() } }));

const entry = { id: "a1", user_id: "u2", user_name: "Ana Teste", role: "central", method: "GET", route: "/api/users", path: "/api/users", status: 403, created_at: "2026-11-16T10:00:00-03:00" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(usersService.list).mockResolvedValue([{ id: "u2", name: "Ana Teste", email: "ana@neonflow.test", role: "central", active: true, created_at: "", updated_at: "" }]);
});

describe("AuditPage", () => {
  it("lista os registros e filtra por usuário e acessos negados", async () => {
    vi.mocked(auditService.list).mockResolvedValue([entry, { ...entry, id: "a2", method: "POST", route: "/api/auth/login", path: "/api/auth/login", status: 200 }]);
    renderPage(<AuditPage />);
    expect(await screen.findByText("Acesso negado: /users")).toBeInTheDocument();
    expect(screen.getByText("Entrou no painel")).toBeInTheDocument();
    expect(screen.getByText("Negado")).toBeInTheDocument();
    expect(screen.getAllByText(/Ana Teste · Central/)).toHaveLength(2);
    expect(auditService.list).toHaveBeenLastCalledWith({ userId: "", denied: false });

    fireEvent.change(await screen.findByLabelText("Usuário"), { target: { value: "u2" } });
    fireEvent.click(screen.getByLabelText("Só acessos negados"));
    await waitFor(() => expect(auditService.list).toHaveBeenLastCalledWith({ userId: "u2", denied: true }));
  });

  it("vazio e erro", async () => {
    vi.mocked(auditService.list).mockResolvedValue([]);
    const { unmount } = renderPage(<AuditPage />);
    expect(await screen.findByText("Nada registrado")).toBeInTheDocument();
    unmount();
    vi.mocked(auditService.list).mockRejectedValue(new Error("x"));
    renderPage(<AuditPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar a auditoria.");
  });
});
