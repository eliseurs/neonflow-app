import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usersService } from "../services/users.service";
import { ChangePasswordForm } from "./ChangePasswordForm";

vi.mock("../services/users.service", () => ({ usersService: { changeOwnPassword: vi.fn() } }));

function renderForm(onDone = vi.fn()) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <ChangePasswordForm onDone={onDone} />
    </QueryClientProvider>,
  );
  return onDone;
}

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => vi.resetAllMocks());

describe("ChangePasswordForm", () => {
  it("confere tamanho e confirmação antes de enviar", () => {
    renderForm();
    fill("Senha atual", "senha-antiga-123");
    fill("Nova senha", "curta");
    fill("Confirmar nova senha", "curta");
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(screen.getByRole("alert")).toHaveTextContent("pelo menos 10");
    fill("Nova senha", "senha-nova-1234");
    fill("Confirmar nova senha", "senha-nova-9999");
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(screen.getByRole("alert")).toHaveTextContent("não confere");
    expect(usersService.changeOwnPassword).not.toHaveBeenCalled();
  });

  it("envia a senha atual e a nova; mostra o erro da API", async () => {
    vi.mocked(usersService.changeOwnPassword).mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce(undefined);
    const onDone = renderForm();
    fill("Senha atual", "senha-antiga-123");
    fill("Nova senha", "senha-nova-1234");
    fill("Confirmar nova senha", "senha-nova-1234");
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível alterar a senha.");
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(usersService.changeOwnPassword).toHaveBeenLastCalledWith("senha-antiga-123", "senha-nova-1234");
  });
});
