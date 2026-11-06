import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatPhone, whatsappUrl } from "@/modules/landing/model/whatsapp";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { centsToInput, formatCents, parseReais } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote, Panel } from "@/shared/ui/Panel";
import { driverMessage, sameDayLabel, type Driver, type Transfer } from "../model/transfer.types";
import { transferService } from "../services/transfer.service";

/**
 * Despacho de operação pequena (2 a 5 motoristas): a central define o valor, chama cada motorista no
 * WhatsApp e marca quem aceitou, com o carro da corrida (o motorista nem sempre é o dono).
 */
export function DriverPanel({ transfer: t, onChange }: { transfer: Transfer; onChange: (t: Transfer) => void }) {
  const qc = useQueryClient();
  const drivers = useQuery({ queryKey: ["transfers", t.id, "drivers"], queryFn: () => transferService.drivers(t.id) });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  const [value, setValue] = useState(t.offer_cents !== null ? centsToInput(t.offer_cents) : "");
  const [accepting, setAccepting] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const cents = value.trim() ? parseReais(value) : null;
  const changed = cents !== null && cents !== t.offer_cents;
  const lower = cents !== null && t.offer_cents !== null && cents < t.offer_cents;

  const act = useMutation({
    mutationFn: (fn: () => Promise<Transfer>) => fn(),
    onSuccess: (out) => {
      onChange(out);
      qc.invalidateQueries({ queryKey: ["transfers", t.id, "drivers"] });
      setProblem(null);
    },
  });

  const saveValue = () => {
    if (!cents) return setProblem("Informe o valor para o motorista em reais.");
    if (lower) return setProblem("O valor não pode ser menor que o já oferecido.");
    act.mutate(() => transferService.offer(t.id, cents));
  };
  const call = (d: Driver) => {
    // O aviso fica no histórico; o WhatsApp abre numa nova aba com a mensagem pessoal.
    act.mutate(() => transferService.notify(t.id, d.partner_id));
  };
  const startAccept = (d: Driver) => {
    if (!cents) return setProblem("Informe o valor para o motorista antes de marcar quem aceitou.");
    if (lower) return setProblem("O valor não pode ser menor que o já oferecido.");
    setProblem(null);
    setAccepting(d);
    // Dono de um carro só: sugere o carro dele.
    setVehicle(d.vehicles.length === 1 ? d.vehicles[0].id : "");
  };
  const confirmAccept = () => {
    if (!accepting || !cents) return;
    act.mutate(() => transferService.accept(t.id, accepting.partner_id, changed ? cents : undefined, vehicle || undefined));
  };

  const error = problem ?? (act.isError ? apiErrorMessage(act.error, "Não foi possível concluir a ação.") : null);
  const list = drivers.data ?? [];

  return (
    <Panel className="space-y-5 p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">Motorista</h2>
      <div className="flex flex-wrap items-end gap-3">
        <Field id="driver-value" label="Valor para o motorista (R$)" hint="Pode aumentar se ninguém topar; não pode diminuir." className="min-w-[14rem] flex-1">
          <input id="driver-value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
        </Field>
        {changed && (
          <Button variant="outline" className="px-4 py-2" onClick={saveValue} disabled={act.isPending}>
            {t.offer_cents === null ? "Salvar valor" : "Aumentar valor"}
          </Button>
        )}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {drivers.isError && <ErrorNote>{apiErrorMessage(drivers.error, "Não foi possível carregar os motoristas.")}</ErrorNote>}

      {drivers.isSuccess && list.length === 0 ? (
        <p className="text-sm text-bone/60">
          Ninguém para chamar. Cadastre em <Link to="/parceiros" className="text-gold hover:underline">Parceiros</Link> marcando
          "Motorista" ou "Proprietário", com o WhatsApp.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.08]">
          {list.map((d) => {
            const link = d.whatsapp ? whatsappUrl(d.whatsapp, driverMessage(t, d.name, cents)) : null;
            return (
              <li key={d.partner_id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-bone/90">{d.name}</p>
                    <p className="text-xs text-bone/50">
                      {d.whatsapp ? formatPhone(d.whatsapp) : "Sem WhatsApp no cadastro"}
                      {d.same_day.length > 0 && <span className="text-amber-200"> · já tem corrida às {sameDayLabel(d.same_day)}</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {d.kinds.map((k) => (
                      <Badge key={k} tone="neutral">{k === "motorista" ? "Motorista" : "Proprietário"}</Badge>
                    ))}
                  </div>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => call(d)}
                      aria-label={`Chamar ${d.name} no WhatsApp`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/80 hover:border-gold/60 hover:text-gold"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                    </a>
                  ) : null}
                  <Button className="px-4 py-2" onClick={() => startAccept(d)} disabled={act.isPending} aria-label={`${d.name} aceitou`}>
                    <Check className="h-4 w-4" aria-hidden /> Aceitou
                  </Button>
                </div>

                {accepting?.partner_id === d.partner_id && (
                  <div className="space-y-3 rounded-2xl border border-gold/30 bg-gold/[0.04] p-4">
                    <Field id="accept-vehicle" label="Carro da corrida" hint="O motorista nem sempre é o dono do carro.">
                      <select id="accept-vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={inputClass}>
                        <option value="" className="bg-noir">Não informar agora</option>
                        {(vehicles.data ?? []).map((v) => (
                          <option key={v.id} value={v.id} className="bg-noir">
                            {v.name}{d.vehicles.some((own) => own.id === v.id) ? " (dele)" : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={confirmAccept} disabled={act.isPending}>
                        Confirmar {d.name.split(" ")[0]} por {formatCents(cents ?? 0)}
                      </Button>
                      <Button variant="ghost" onClick={() => setAccepting(null)}>Voltar</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
