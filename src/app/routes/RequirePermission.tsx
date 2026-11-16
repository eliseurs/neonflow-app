import { Link, Outlet } from "react-router-dom";
import { homeFor } from "@/app/layout/nav";
import type { Permission } from "@/modules/auth/model/auth.types";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { buttonClass } from "@/shared/ui/buttonClass";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState } from "@/shared/ui/Panel";

/** Guarda das telas do painel: sem a permissão, mostra o aviso e o caminho para o início do perfil. */
export function RequirePermission({ permission }: { permission: Permission }) {
  const permissions = useAuthStore((s) => s.user?.permissions);
  if (permissions?.includes(permission)) return <Outlet />;
  return (
    <section className="space-y-8">
      <PageHeader overline="Acesso" title="Tela" accent="restrita." />
      <EmptyState
        title="Seu perfil não abre esta tela"
        text="Se você precisa dela, peça ao administrador para revisar o seu papel."
        action={
          <Link to={homeFor(permissions)} className={buttonClass()}>
            Ir para o início
          </Link>
        }
      />
    </section>
  );
}
