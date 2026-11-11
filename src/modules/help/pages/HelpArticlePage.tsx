import { ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { navFor } from "@/app/layout/nav";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { formatDate } from "@/shared/lib/format";
import { PageHeader } from "@/shared/ui/Heading";
import { Panel } from "@/shared/ui/Panel";
import { articlesFor } from "../content";
import type { HelpArticle } from "../model/help.types";

function Flow({ a }: { a: HelpArticle }) {
  if (!a.flow) return null;
  return (
    <Panel className="p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">Etapas</h2>
      <ol className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {a.flow.map((f, i) => (
          <li key={f.label} className="flex flex-1 items-stretch gap-3">
            <div className="flex-1 rounded-xl border border-gold/30 bg-gold/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Etapa {i + 1}</p>
              <p className="mt-1 font-medium text-bone">{f.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-bone/60">{f.detail}</p>
            </div>
            {i < a.flow!.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-gold/60 lg:block" aria-hidden />}
          </li>
        ))}
      </ol>
      {a.flowExits && (
        <ul className="mt-4 space-y-1 text-sm text-bone/60">
          {a.flowExits.map((e) => (
            <li key={e.label}>
              <strong className="text-bone/80">{e.label}:</strong> {e.detail}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Artigo de ajuda de um fluxo. Papel sem acesso volta para o índice. */
export function HelpArticlePage() {
  const { slug = "" } = useParams();
  const role = useAuthStore((s) => s.user?.role);
  const a = articlesFor(role).find((x) => x.slug === slug);
  if (!a) return <Navigate to="/ajuda" replace />;
  // Só os atalhos para telas que o papel pode abrir.
  const allowed = new Set(navFor(role).flatMap((g) => g.items.map((i) => i.to)));
  const routes = a.routes.filter((r) => allowed.has(r));

  return (
    <section className="space-y-8">
      <Link to="/ajuda" className="text-[11px] uppercase tracking-[0.2em] text-bone/60 hover:text-bone">
        ← Ajuda
      </Link>
      <PageHeader overline={`Ajuda · atualizado em ${formatDate(a.updated)}`} title={a.title} description={a.summary} />
      {routes.length > 0 && (
      <p className="text-sm">
        {routes.map((r, i) => (
          <span key={r}>
            {i > 0 && " · "}
            <Link to={r} className="text-gold hover:underline">
              Abrir {r.slice(1)}
            </Link>
          </span>
        ))}
      </p>
      )}
      <Flow a={a} />
      {a.sections.map((s) => (
        <Panel key={s.title} className="space-y-3 p-6 md:p-8">
          <h2 className="font-serif text-2xl font-light">{s.title}</h2>
          {s.text && <p className="text-sm leading-relaxed text-bone/75">{s.text}</p>}
          {s.steps && (
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-bone/80 marker:text-gold">
              {s.steps.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          )}
          {s.items && (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-bone/65 marker:text-bone/40">
              {s.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </Panel>
      ))}
      {a.faq && (
        <Panel className="p-6 md:p-8">
          <h2 className="font-serif text-2xl font-light">Dúvidas comuns</h2>
          <div className="mt-4 divide-y divide-white/[0.08]">
            {a.faq.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="cursor-pointer text-sm text-bone/85 marker:text-gold group-open:text-gold">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-bone/65">{f.a}</p>
              </details>
            ))}
          </div>
        </Panel>
      )}
      <p className="text-xs text-bone/40">Regras de negócio de origem: {a.rules.join(", ")}.</p>
    </section>
  );
}
