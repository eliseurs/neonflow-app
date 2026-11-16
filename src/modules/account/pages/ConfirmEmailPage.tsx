import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { buttonClass } from "@/shared/ui/buttonClass";
import { ErrorNote, Loading } from "@/shared/ui/Panel";
import { AccountShell } from "../components/AccountShell";
import { accountService } from "../services/account.service";

/** Abre pelo link do e-mail e confirma a conta do cliente. O link vale uma vez (API RN-05.14). */
export function ConfirmEmailPage() {
  const { token = "" } = useParams();
  // useQuery, e não um efeito: a chamada acontece uma vez só, mesmo com a página montada duas vezes.
  const confirm = useQuery({ queryKey: ["confirm-email", token], queryFn: () => accountService.confirm(token), retry: false, staleTime: Infinity });

  return (
    <AccountShell title="Confirmação" accent="do e-mail.">
      {confirm.isPending && <Loading label="Confirmando..." />}
      {confirm.isError && (
        <div className="space-y-5">
          <ErrorNote>{apiErrorMessage(confirm.error, "Não foi possível confirmar o e-mail.")}</ErrorNote>
          <p className="text-sm text-bone/70">Se a conta já foi confirmada, é só entrar. Se o link venceu, cadastre de novo com o mesmo e-mail para receber outro.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className={buttonClass()}>Entrar</Link>
            <Link to="/conta/cadastro" className={buttonClass("outline")}>Cadastrar de novo</Link>
          </div>
        </div>
      )}
      {confirm.isSuccess && (
        <div className="space-y-6">
          <p role="status" className="text-sm leading-relaxed text-bone/80">E-mail confirmado. A sua conta está ativa.</p>
          <Link to="/login" className={buttonClass("primary", "w-full")}>Entrar</Link>
        </div>
      )}
    </AccountShell>
  );
}
