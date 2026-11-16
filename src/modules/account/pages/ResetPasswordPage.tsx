import { useMutation } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { buttonClass } from "@/shared/ui/buttonClass";
import { AccountShell } from "../components/AccountShell";
import { NewPasswordForm } from "../components/NewPasswordForm";
import { accountService } from "../services/account.service";

/** Senha nova pelo link do e-mail (vale 1 hora, uma vez). */
export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const reset = useMutation({ mutationFn: (password: string) => accountService.resetPassword(token, password) });

  return (
    <AccountShell title="Senha" accent="nova.">
      {reset.isSuccess ? (
        <div className="space-y-6">
          <p role="status" className="text-sm leading-relaxed text-bone/80">Senha alterada. Entre com a senha nova.</p>
          <Link to="/login" className={buttonClass("primary", "w-full")}>Entrar</Link>
        </div>
      ) : (
        <>
          <NewPasswordForm
            submitLabel="Salvar senha"
            pending={reset.isPending}
            error={reset.isError ? apiErrorMessage(reset.error, "Não foi possível salvar a senha.") : null}
            onSubmit={(password) => reset.mutate(password)}
          />
          <p className="mt-6 text-sm text-bone/55">
            Link vencido? <Link to="/conta/esqueci-senha" className="text-gold hover:underline">Peça outro</Link>.
          </p>
        </>
      )}
    </AccountShell>
  );
}
