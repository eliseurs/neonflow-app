import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { apiErrorMessage, axiosInstance } from "./client";
import { useAuthStore } from "@/modules/auth/store/auth.store";

type Handler<T> = { fulfilled: (v: T) => T; rejected: (e: unknown) => unknown };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers = (axiosInstance.interceptors as any) as {
  request: { handlers: Handler<InternalAxiosRequestConfig>[] };
  response: { handlers: Handler<unknown>[] };
};

const axiosError = (status?: number, data?: unknown) =>
  new AxiosError("x", "ERR", undefined, undefined, status ? ({ status, data, statusText: "", headers: {}, config: {} } as never) : undefined);

afterEach(() => useAuthStore.getState().clear());

describe("interceptors", () => {
  it("injeta o token Bearer", () => {
    useAuthStore.getState().setSession("tok", new Date(Date.now() + 60_000).toISOString(), {} as never);
    const cfg = handlers.request.handlers[0].fulfilled({ headers: new AxiosHeaders() } as InternalAxiosRequestConfig);
    expect(cfg.headers.Authorization).toBe("Bearer tok");
  });

  it("não envia header sem token", () => {
    const cfg = handlers.request.handlers[0].fulfilled({ headers: new AxiosHeaders() } as InternalAxiosRequestConfig);
    expect(cfg.headers.Authorization).toBeUndefined();
  });

  it("401 com sessão limpa a sessão", async () => {
    useAuthStore.getState().setSession("tok", new Date(Date.now() + 60_000).toISOString(), {} as never);
    await expect(handlers.response.handlers[0].rejected(axiosError(401))).rejects.toBeInstanceOf(AxiosError);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("outros erros mantêm a sessão", async () => {
    useAuthStore.getState().setSession("tok", new Date(Date.now() + 60_000).toISOString(), {} as never);
    await expect(handlers.response.handlers[0].rejected(axiosError(500))).rejects.toBeInstanceOf(AxiosError);
    expect(useAuthStore.getState().token).toBe("tok");
  });
});

describe("apiErrorMessage", () => {
  it("usa a mensagem do envelope da API", () => {
    expect(apiErrorMessage(axiosError(401, { status: 401, data: { error: "e-mail ou senha inválidos" } }))).toBe("e-mail ou senha inválidos");
  });
  it("sem resposta = sem conexão", () => {
    expect(apiErrorMessage(axiosError())).toBe("Sem conexão com a API.");
  });
  it("fallback para erros desconhecidos", () => {
    expect(apiErrorMessage(new Error("x"), "padrão")).toBe("padrão");
    expect(apiErrorMessage(axiosError(500, {}), "padrão")).toBe("padrão");
  });
});
