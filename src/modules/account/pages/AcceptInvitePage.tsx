import { useMutation } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { buttonClass } from "@/shared/ui/buttonClass";
import { AccountShell } from "../components/AccountShell";
import { NewPasswordForm } from "../components/NewPasswordForm";
import { accountService } from "../services/account.service";

/** O parceiro convidado pela central define a senha e a conta é criada (API RN-05.12). */
export function AcceptInvitePage() {
  const { token = "" } = useParams();
  const accept = useMutation({ mutationFn: (password: string) => accountService.acceptInvite(token, password) });

  return (
    <AccountShell title="Acesso" accent="de parceiro.">
      {accept.isSuccess ? (
        <div className="space-y-6">
          <p role="status" className="text-sm leading-relaxed text-bone/80">Conta criada. Entre com o e-mail em que recebeu o convite e a senha que acabou de criar.</p>
          <Link to="/login" className={buttonClass("primary", "w-full")}>Entrar</Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm leading-relaxed text-bone/70">A central do Neon Flow convidou você. Crie a sua senha para entrar.</p>
          <NewPasswordForm
            submitLabel="Criar acesso"
            pending={accept.isPending}
            error={accept.isError ? apiErrorMessage(accept.error, "Não foi possível criar o acesso.") : null}
            onSubmit={(password) => accept.mutate(password)}
          />
          <p className="mt-6 text-sm text-bone/55">Link vencido? Peça um novo convite à central.</p>
        </>
      )}
    </AccountShell>
  );
}
