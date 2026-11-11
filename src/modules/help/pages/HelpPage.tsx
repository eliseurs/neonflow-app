import { Link } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { formatDate } from "@/shared/lib/format";
import { PageHeader } from "@/shared/ui/Heading";
import { Panel } from "@/shared/ui/Panel";
import { articlesFor } from "../content";

/** Central de ajuda: um artigo por fluxo, só os que o papel usa. */
export function HelpPage() {
  const role = useAuthStore((s) => s.user?.role);
  const list = articlesFor(role);
  return (
    <section className="space-y-8">
      <PageHeader
        overline="Ajuda"
        title="Como o sistema"
        accent="funciona."
        description="Cada fluxo passo a passo: o que fazer, o que o sistema bloqueia e por quê. Em cada tela, o link Ajuda desta tela (o ? no celular) abre o artigo certo."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <Link key={a.slug} to={`/ajuda/${a.slug}`} className="group">
            <Panel className="h-full space-y-3 p-6 transition group-hover:border-gold/40">
              <h2 className="font-serif text-2xl font-light group-hover:text-gold">{a.title}</h2>
              <p className="text-sm leading-relaxed text-bone/65">{a.summary}</p>
              {a.flow && <p className="text-xs text-bone/45">{a.flow.map((f) => f.label).join(" → ")}</p>}
              <p className="text-[10px] uppercase tracking-[0.2em] text-bone/35">Atualizado em {formatDate(a.updated)}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </section>
  );
}
