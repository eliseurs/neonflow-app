import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { inputClass } from "@/shared/ui/Field";
import { Panel } from "@/shared/ui/Panel";
import type { AreaOffer, AreaVehicle } from "../model/partnerarea.types";
import { partnerAreaService } from "../services/partnerarea.service";

interface OpenOffersProps {
  offers: AreaOffer[];
  /** Carros do motorista que também é proprietário; pode escolher um para a corrida. */
  vehicles: AreaVehicle[];
}

/** Corridas aguardando motorista: o primeiro que aceitar leva (RN-02.30, PEN-74). */
export function OpenOffers({ offers, vehicles }: OpenOffersProps) {
  const qc = useQueryClient();
  const [cars, setCars] = useState<Record<string, string>>({});
  const accept = useMutation({
    mutationFn: (rideId: string) => partnerAreaService.accept(rideId, cars[rideId] || undefined),
    onSuccess: () => toast.success("Corrida aceita. Ela aparece em Minhas corridas."),
    onError: (err) => toast.error(apiErrorMessage(err, "Não foi possível aceitar a corrida.")),
    // Aceita ou não (outro motorista pode ter levado antes), a lista é recarregada.
    onSettled: () => qc.invalidateQueries({ queryKey: ["partner-area"] }),
  });
  const usable = vehicles.filter((v) => !v.in_maintenance);

  return (
    <section className="space-y-3" aria-label="Corridas disponíveis">
      <h2 className="font-serif text-2xl font-light">Corridas disponíveis</h2>
      {offers.length === 0 ? (
        <p className="text-sm text-bone/55">Nenhuma corrida aguardando motorista agora. A central avisa no WhatsApp quando abrir uma.</p>
      ) : (
        <Panel className="divide-y divide-white/[0.08]">
          {offers.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1 space-y-1">
                <p>
                  {o.origin} → {o.destination}
                </p>
                <p className="text-sm text-bone/60">
                  {formatDateTime(o.pickup_at)} · {o.client_name} · {o.passengers} {o.passengers === 1 ? "passageiro" : "passageiros"}
                  {o.flight && ` · voo ${o.flight}`}
                </p>
              </div>
              <span className="font-serif text-xl text-gold">{formatCents(o.offer_cents)}</span>
              {usable.length > 0 && (
                <select
                  aria-label={`Carro para ${o.origin} → ${o.destination}`}
                  value={cars[o.id] ?? ""}
                  onChange={(e) => setCars({ ...cars, [o.id]: e.target.value })}
                  className={`${inputClass} mt-0 w-auto`}
                >
                  <option value="" className="bg-noir">Sem carro meu</option>
                  {usable.map((v) => (
                    <option key={v.id} value={v.id} className="bg-noir">{v.name}</option>
                  ))}
                </select>
              )}
              <Button onClick={() => accept.mutate(o.id)} disabled={accept.isPending} aria-label={`Aceitar ${o.origin} → ${o.destination}`}>
                Aceitar
              </Button>
            </div>
          ))}
        </Panel>
      )}
    </section>
  );
}
