import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { buttonClass } from "@/shared/ui/buttonClass";
import { ErrorNote, Loading } from "@/shared/ui/Panel";
import { AccountShell } from "../components/AccountShell";
import { NewPasswordForm } from "../components/NewPasswordForm";
import { accountService } from "../services/account.service";

/** Abre pelo link do e-mail: confirma a conta e manda à central os pedidos feitos na página do carro (RN-02.38).
 * Conta sem senha cria a senha aqui mesmo, se quiser. O link vale uma vez (API RN-05.14). */
export function ConfirmEmailPage() {
  const { token = "" } = useParams();
  // useQuery, e não um efeito: a chamada acontece uma vez só, mesmo com a página montada duas vezes.
  const confirm = useQuery({ queryKey: ["confirm-email", token], queryFn: () => accountService.confirm(token), retry: false, staleTime: Infinity });
  const passwordToken = confirm.data?.password_token ?? "";
  const setPassword = useMutation({ mutationFn: (password: string) => accountService.resetPassword(passwordToken, password) });
  const sent = confirm.data?.requests_sent ?? 0;

  return (
    <AccountShell title={sent > 0 ? "Pedido" : "Confirmação"} accent={sent > 0 ? "enviado." : "do e-mail."}>
      {confirm.isPending && <Loading label="Confirmando..." />}
      {confirm.isError && (
        <div className="space-y-5">
          <ErrorNote>{apiErrorMessage(confirm.error, "Não foi possível confirmar o e-mail.")}</ErrorNote>
          <p className="text-sm text-bone/70">Se você já confirmou, está tudo certo. Se o link venceu, faça o pedido ou o cadastro de novo para receber outro.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className={buttonClass()}>Entrar</Link>
            <Link to="/conta/cadastro" className={buttonClass("outline")}>Cadastrar de novo</Link>
          </div>
        </div>
      )}
      {confirm.isSuccess && (
        <div className="space-y-6">
          <p role="status" className="text-sm leading-relaxed text-bone/80">
            {sent > 0
              ? "E-mail confirmado e pedido enviado à central. Você recebe a resposta por e-mail."
              : "E-mail confirmado. A sua conta está ativa."}
          </p>
          {passwordToken && !setPassword.isSuccess && (
            <div className="space-y-4">
              <p className="text-sm text-bone/70">Quer acompanhar os seus pedidos pelo site? Crie uma senha (opcional).</p>
              <NewPasswordForm
                submitLabel="Criar senha"
                pending={setPassword.isPending}
                error={setPassword.isError ? apiErrorMessage(setPassword.error, "Não foi possível criar a senha.") : null}
                onSubmit={(password) => setPassword.mutate(password)}
              />
            </div>
          )}
          {(!passwordToken || setPassword.isSuccess) && (
            <Link to="/login" className={buttonClass("primary", "w-full")}>Entrar</Link>
          )}
          {setPassword.isSuccess && <p className="text-sm text-emerald-200">Senha criada. Entre com o seu e-mail e a senha nova.</p>}
        </div>
      )}
    </AccountShell>
  );
}
