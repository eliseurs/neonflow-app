import { describe as group, expect, it } from "vitest";
import { describe, outcome } from "./audit.types";

group("auditoria: textos", () => {
  it("descreve a ação pela rota", () => {
    expect(describe({ method: "POST", route: "/api/auth/login", status: 200 })).toBe("Entrou no painel");
    expect(describe({ method: "POST", route: "/api/bookings/:id/cancel", status: 200 })).toBe("Criou ou executou /bookings/:id/cancel");
    expect(describe({ method: "PUT", route: "/api/users/:id", status: 200 })).toBe("Alterou /users/:id");
    expect(describe({ method: "DELETE", route: "/api/photos/:id", status: 204 })).toBe("Apagou /photos/:id");
    expect(describe({ method: "GET", route: "/api/users", status: 403 })).toBe("Acesso negado: /users");
    expect(describe({ method: "OPTIONS", route: "/api/x", status: 200 })).toBe("OPTIONS /x");
  });

  it("resultado", () => {
    expect(outcome(201)).toEqual({ label: "Feito", tone: "ok" });
    expect(outcome(403)).toEqual({ label: "Negado", tone: "warn" });
    expect(outcome(409)).toEqual({ label: "Recusado (409)", tone: "muted" });
  });
});
