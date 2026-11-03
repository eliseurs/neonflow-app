import { describe, expect, it } from "vitest";
import { useAuthStore } from "./auth.store";
import type { User } from "../model/auth.types";

const user: User = { id: "u1", name: "Central", email: "c@neonflow.test", role: "central", created_at: "", updated_at: "" };
const future = new Date(Date.now() + 3_600_000).toISOString();
const past = new Date(Date.now() - 1_000).toISOString();

describe("useAuthStore", () => {
  it("autentica com token não expirado", () => {
    useAuthStore.getState().setSession("tok", future, user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe("Central");
  });

  it("não autentica com token expirado", () => {
    useAuthStore.getState().setSession("tok", past, user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("clear remove a sessão", () => {
    useAuthStore.getState().setSession("tok", future, user);
    useAuthStore.getState().clear();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("setUser atualiza só o usuário", () => {
    useAuthStore.getState().setSession("tok", future, user);
    useAuthStore.getState().setUser({ ...user, name: "Outro" });
    expect(useAuthStore.getState().user?.name).toBe("Outro");
    expect(useAuthStore.getState().token).toBe("tok");
  });
});
