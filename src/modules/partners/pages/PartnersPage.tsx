import { useQuery } from "@tanstack/react-query";
import { Plus, QrCode } from "lucide-react";
import { useState } from "react";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { PartnerForm } from "../components/PartnerForm";
import { ReferralCard } from "../components/ReferralCard";
import { KIND_LABEL, formatPercent, type Partner, type PartnerKind } from "../model/partners.types";
import { partnersService } from "../services/partners.service";

type Filter = "todos" | PartnerKind;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "proprietario", label: "Proprietários" },
  { value: "motorista", label: "Motoristas" },
  { value: "indicador", label: "Indicadores" },
];

function percents(p: Partner): string {
  const parts = [
    p.commission_percent !== null && `indicação ${formatPercent(p.commission_percent)}%`,
    p.owner_share_percent !== null && `repasse ${formatPercent(p.owner_share_percent)}%`,
    p.driver_share_percent !== null && `motorista ${formatPercent(p.driver_share_percent)}%`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "percentuais a definir";
}

export function PartnersPage() {
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersService.list() });
  const [filter, setFilter] = useState<Filter>("todos");
  const [editing, setEditing] = useState<Partner | "new" | null>(null);
  const [sharing, setSharing] = useState<Partner | null>(null);

  const list = (partners.data ?? []).filter((p) => filter === "todos" || p.kinds.includes(filter));
  const add = (
    <Button onClick={() => setEditing("new")}>
      <Plus className="h-4 w-4" aria-hidden /> Novo parceiro
    </Button>
  );

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Parceiros"
        title="Quem anda"
        accent="com a gente."
        description="Proprietários de veículos, motoristas e indicadores. Todos podem indicar pelo link ou QR com o próprio código."
        actions={add}
      />

      <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
              filter === f.value ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {partners.isPending && <Loading />}
      {partners.isError && <ErrorNote>{apiErrorMessage(partners.error, "Não foi possível carregar os parceiros.")}</ErrorNote>}
      {partners.isSuccess && list.length === 0 && (
        <EmptyState
          title={filter === "todos" ? "Nenhum parceiro cadastrado" : "Nenhum parceiro deste tipo"}
          text="Cadastre hotéis, motoristas e donos de veículos. Cada um ganha um link e um QR de indicação."
          action={filter === "todos" ? add : undefined}
        />
      )}

      {list.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {list.map((p) => (
            <div key={p.id} className={cn("flex flex-wrap items-center gap-4 p-5", !p.active && "opacity-50")}>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-light">{p.name}</p>
                <p className="text-sm text-bone/55">
                  {[p.city, p.whatsapp && `+${p.whatsapp}`, p.email].filter(Boolean).join(" · ") || "Sem contato"}
                </p>
                <p className="text-xs text-bone/45">{percents(p)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.kinds.map((k) => (
                  <Badge key={k} tone={k === "indicador" ? "gold" : "neutral"}>{KIND_LABEL[k]}</Badge>
                ))}
                {!p.active && <Badge tone="muted">Desativado</Badge>}
              </div>
              <span className="font-mono text-sm tracking-[0.15em] text-gold">{p.referral_code}</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSharing(p)} aria-label={`Link e QR de ${p.name}`}>
                  <QrCode className="h-4 w-4" aria-hidden /> Indicação
                </Button>
                <Button variant="outline" className="px-4 py-2" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}>Editar</Button>
              </div>
            </div>
          ))}
        </Panel>
      )}

      {editing && (
        <Dialog title={editing === "new" ? "Novo parceiro" : "Editar parceiro"} onClose={() => setEditing(null)}>
          <PartnerForm
            partner={editing === "new" ? undefined : editing}
            onDone={(p) => {
              setEditing(null);
              if (p && editing === "new") setSharing(p);
            }}
          />
        </Dialog>
      )}
      {sharing && (
        <Dialog title={`Indicação · ${sharing.name}`} onClose={() => setSharing(null)}>
          <ReferralCard partner={sharing} />
        </Dialog>
      )}
    </section>
  );
}
