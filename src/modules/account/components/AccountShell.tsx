import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Accent, Overline } from "@/shared/ui/Heading";

interface AccountShellProps {
  title: string;
  accent: string;
  children: ReactNode;
  /** Links abaixo do cartão. */
  footer?: ReactNode;
}

/** Moldura das páginas públicas de conta (entrar, cadastro, confirmação, convite, nova senha), no visual do login. */
export function AccountShell({ title, accent, children, footer }: AccountShellProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-noir px-4 py-12 font-sans text-bone">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(201,168,106,0.14),transparent_55%)]" />
      <img src="/brand/neonflow-simbolo.svg" alt="" aria-hidden className="pointer-events-none absolute -right-32 top-1/2 hidden w-[520px] -translate-y-1/2 opacity-[0.08] md:block" />

      <div className="relative w-full max-w-md">
        <Link to="/" aria-label="Neon Flow — início" className="mx-auto block w-fit">
          <img src="/brand/neonflow-icone-app.svg" alt="Neon Flow" className="h-28 w-auto md:h-32" />
        </Link>
        <div className="mt-10 rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-8 md:p-10">
          <Overline>Neon Flow</Overline>
          <h1 className="mt-4 font-serif text-4xl font-light leading-tight">
            {title} <Accent>{accent}</Accent>
          </h1>
          <div className="mt-8">{children}</div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-bone/50">
          {footer ?? (
            <Link to="/" className="hover:text-gold">
              ← Voltar ao site
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
