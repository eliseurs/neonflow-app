import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatPhone } from "@/modules/landing/model/whatsapp";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { CustomerForm } from "../components/CustomerForm";
import { LANGUAGE_LABEL } from "../model/customer.types";
import { customerService } from "../services/customer.service";

export function CustomersPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const customers = useQuery({ queryKey: ["customers", "list", debounced], queryFn: () => customerService.list(debounced) });

  const add = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="h-4 w-4" aria-hidden /> Novo cliente
    </Button>
  );
  const list = customers.data ?? [];

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Clientes"
        title="Quem viaja"
        accent="com a gente."
        description="Contato, idioma e o histórico de reservas e transfers. Documentos virão com a política de retenção (PEN-48)."
        actions={add}
      />

      <label className="relative block max-w-md">
        <span className="sr-only">Buscar cliente</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" aria-hidden />
        <input
          type="search"
          placeholder="Nome, WhatsApp ou e-mail"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(inputClass, "pl-11")}
        />
      </label>

      {customers.isPending && <Loading />}
      {customers.isError && <ErrorNote>{apiErrorMessage(customers.error, "Não foi possível carregar os clientes.")}</ErrorNote>}
      {customers.isSuccess && list.length === 0 && (
        <EmptyState
          title={debounced ? "Ninguém encontrado" : "Nenhum cliente cadastrado"}
          text="Cadastre aqui ou direto na nova reserva e no novo transfer."
          action={add}
        />
      )}

      {list.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {list.map((c) => (
            <Link key={c.id} to={`/clientes/${c.id}`} className={cn("flex flex-wrap items-center gap-4 p-5 hover:bg-white/[0.02]", c.anonymized_at && "opacity-50")}>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-light">{c.name}</p>
                <p className="text-sm text-bone/55">
                  {[c.whatsapp && formatPhone(c.whatsapp), c.email].filter(Boolean).join(" · ") || "Sem contato"}
                </p>
              </div>
              <span className="text-xs text-bone/50">
                {c.booking_count} {c.booking_count === 1 ? "reserva" : "reservas"} · {c.transfer_count} {c.transfer_count === 1 ? "transfer" : "transfers"}
              </span>
              {c.anonymized_at ? <Badge tone="muted">Anonimizado</Badge> : <Badge tone="neutral">{LANGUAGE_LABEL[c.language]}</Badge>}
              <ChevronRight className="h-4 w-4 text-bone/40" aria-hidden />
            </Link>
          ))}
        </Panel>
      )}

      {creating && (
        <Dialog title="Novo cliente" onClose={() => setCreating(false)}>
          <CustomerForm
            initialName={query.trim()}
            onDone={(c) => {
              setCreating(false);
              if (c) navigate(`/clientes/${c.id}`);
            }}
          />
        </Dialog>
      )}
    </section>
  );
}
