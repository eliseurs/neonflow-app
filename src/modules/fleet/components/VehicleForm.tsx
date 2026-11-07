import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnersService } from "@/modules/partners/services/partners.service";
import { useState, type FormEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { centsToInput, parseReais } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import { CATEGORY_LABEL, GEAR_LABEL, PLATE_PATTERN, normalizePlate, type Category, type Gear, type Vehicle, FEATURES, FUEL_LABEL, type Feature, type Fuel } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";

interface VehicleFormProps {
  vehicle?: Vehicle;
  onDone: () => void;
}

export function VehicleForm({ vehicle, onDone }: VehicleFormProps) {
  const qc = useQueryClient();
  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [name, setName] = useState(vehicle?.name ?? "");
  const [category, setCategory] = useState<Category>(vehicle?.category ?? "economy");
    const [owner, setOwner] = useState(vehicle?.owner ?? "");
  // Dono cadastrado como parceiro (RN-07.4); vazio = só o nome livre.
  const [ownerPartnerId, setOwnerPartnerId] = useState(vehicle?.owner_partner_id ?? "");
  const owners = useQuery({ queryKey: ["partners", "proprietario"], queryFn: () => partnersService.list("proprietario") });
  const [seats, setSeats] = useState(String(vehicle?.seats ?? ""));
  const [gear, setGear] = useState<Gear>(vehicle?.gear ?? "automatico");
  // A diária é sempre digitada pela central: sem valor sugerido (RN-01.5).
  const [rate, setRate] = useState(vehicle ? centsToInput(vehicle.daily_rate_cents) : "");
    const [maintenance, setMaintenance] = useState(vehicle?.in_maintenance ?? false);
  // Caução e plano de km: opcionais, digitados pela central (RN-06.4, RN-02.18, RN-01.5).
  const [deposit, setDeposit] = useState(vehicle?.deposit_cents ? centsToInput(vehicle.deposit_cents) : "");
  const [kmLimit, setKmLimit] = useState(vehicle?.km_limit_per_day ? String(vehicle.km_limit_per_day) : "");
  const [extraKm, setExtraKm] = useState(vehicle?.extra_km_cents ? centsToInput(vehicle.extra_km_cents) : "");
    const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : "");
  const [color, setColor] = useState(vehicle?.color ?? "");
  const [fuel, setFuel] = useState<Fuel | "">(vehicle?.fuel ?? "");
  const [doors, setDoors] = useState(vehicle?.doors ? String(vehicle.doors) : "");
  const [features, setFeatures] = useState<Feature[]>(vehicle?.features ?? []);
  const [description, setDescription] = useState(vehicle?.description ?? "");
  const [problem, setProblem] = useState<string | null>(null);
  const toggleFeature = (f: Feature) => setFeatures((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]));

  const save = useMutation({
    mutationFn: (req: Parameters<typeof fleetService.create>[0]) =>
      vehicle ? fleetService.update(vehicle.id, req) : fleetService.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(vehicle ? "Veículo atualizado." : "Veículo cadastrado.");
      onDone();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizePlate(plate);
    const cents = parseReais(rate);
    const seatCount = Number(seats);
    if (!PLATE_PATTERN.test(normalized)) return setProblem("Placa inválida. Use ABC1234 ou ABC1D23.");
    if (!cents) return setProblem("Informe a diária em reais, maior que zero.");
        if (!Number.isInteger(seatCount) || seatCount <= 0) return setProblem("Informe o número de lugares.");
    const depositCents = deposit.trim() ? parseReais(deposit) : null;
    if (deposit.trim() && !depositCents) return setProblem("Informe a caução em reais, maior que zero, ou deixe em branco.");
    const limit = kmLimit.trim() ? Number(kmLimit) : null;
    const extraCents = extraKm.trim() ? parseReais(extraKm) : null;
    if (kmLimit.trim() && (!Number.isInteger(limit) || (limit ?? 0) <= 0)) return setProblem("O limite de km por dia deve ser um número inteiro maior que zero.");
    if (extraKm.trim() && !extraCents) return setProblem("Informe o valor do km excedente em reais, maior que zero.");
        // Km controlado: o limite pode vir sem valor (a central define o excedente); valor sem limite, não (RN-02.18).
        if (limit === null && extraCents !== null) return setProblem("O valor do km excedente exige o limite de km por dia.");
    const yearN = year.trim() ? Number(year) : null;
    if (yearN !== null && (!Number.isInteger(yearN) || yearN < 1980 || yearN > 2100)) return setProblem("Ano inválido.");
    const doorsN = doors.trim() ? Number(doors) : null;
    if (doorsN !== null && (!Number.isInteger(doorsN) || doorsN < 2 || doorsN > 5)) return setProblem("Portas: de 2 a 5.");
    setProblem(null);
    save.mutate({
      plate: normalized,
      name: name.trim(),
      category,
            owner: owner.trim(),
      owner_partner_id: ownerPartnerId || null,
      seats: seatCount,
      gear,
            daily_rate_cents: cents,
      in_maintenance: maintenance,
      deposit_cents: depositCents,
      km_limit_per_day: limit,
            extra_km_cents: extraCents,
      year: yearN,
      color: color.trim(),
      fuel,
      doors: doorsN,
      features,
      description: description.trim(),
    });
  };

  const error = problem ?? (save.isError ? apiErrorMessage(save.error, "Não foi possível salvar o veículo.") : null);

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field id="vehicle-name" label="Modelo" className="sm:col-span-2">
        <input id="vehicle-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </Field>
      <Field id="vehicle-plate" label="Placa">
        <input
          id="vehicle-plate"
          required
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          className={`${inputClass} uppercase tracking-[0.15em]`}
        />
      </Field>
      <Field id="vehicle-category" label="Categoria">
        <select id="vehicle-category" value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputClass}>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <option key={c} value={c} className="bg-noir">{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </Field>
            <Field id="vehicle-owner-partner" label="Parceiro proprietário" hint="Cadastre o dono em Parceiros para ligar o carro a ele." className="sm:col-span-2">
        <select
          id="vehicle-owner-partner"
          value={ownerPartnerId}
          onChange={(e) => {
            const id = e.target.value;
            setOwnerPartnerId(id);
            const p = owners.data?.find((o) => o.id === id);
            if (p) setOwner(p.name);
          }}
          className={inputClass}
        >
          <option value="" className="bg-noir">Nenhum (frota própria ou dono não cadastrado)</option>
          {owners.data?.filter((o) => o.active || o.id === ownerPartnerId).map((o) => (
            <option key={o.id} value={o.id} className="bg-noir">{o.name}</option>
          ))}
        </select>
      </Field>
      <Field id="vehicle-owner" label="Proprietário" hint="Nome do dono: a empresa ou o parceiro." className="sm:col-span-2">
        <input id="vehicle-owner" required disabled={Boolean(ownerPartnerId)} value={owner} onChange={(e) => setOwner(e.target.value)} className={inputClass} />
      </Field>
      <Field id="vehicle-seats" label="Lugares">
        <input id="vehicle-seats" type="number" min={1} inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value)} className={inputClass} />
      </Field>
      <Field id="vehicle-gear" label="Câmbio">
        <select id="vehicle-gear" value={gear} onChange={(e) => setGear(e.target.value as Gear)} className={inputClass}>
          {(Object.keys(GEAR_LABEL) as Gear[]).map((g) => (
            <option key={g} value={g} className="bg-noir">{GEAR_LABEL[g]}</option>
          ))}
        </select>
      </Field>
      <Field id="vehicle-rate" label="Diária (R$)" hint="Valor cobrado por dia. Novas reservas usam este valor." className="sm:col-span-2">
        <input id="vehicle-rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />
      </Field>
            <Field id="vehicle-deposit" label="Caução (R$)" hint="Pré-autorização no cartão. Em branco: a definir." className="sm:col-span-2">
        <input id="vehicle-deposit" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={inputClass} />
      </Field>
      <Field id="vehicle-km-limit" label="Limite de km por dia" hint="Em branco: km livre.">
        <input id="vehicle-km-limit" inputMode="numeric" value={kmLimit} onChange={(e) => setKmLimit(e.target.value)} className={inputClass} />
      </Field>
      <Field id="vehicle-extra-km" label="Km excedente (R$)" hint="Valor de cada km acima da franquia. Em branco: a central define na devolução.">
        <input id="vehicle-extra-km" inputMode="decimal" value={extraKm} onChange={(e) => setExtraKm(e.target.value)} className={inputClass} />
      </Field>
            <fieldset className="grid gap-5 border-t border-white/[0.08] pt-5 sm:col-span-2 sm:grid-cols-2">
        <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Ficha do carro (aparece no site)</legend>
        <Field id="vehicle-year" label="Ano">
          <input id="vehicle-year" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
        </Field>
        <Field id="vehicle-color" label="Cor">
          <input id="vehicle-color" value={color} onChange={(e) => setColor(e.target.value)} className={inputClass} />
        </Field>
        <Field id="vehicle-fuel" label="Combustível">
          <select id="vehicle-fuel" value={fuel} onChange={(e) => setFuel(e.target.value as Fuel | "")} className={inputClass}>
            <option value="" className="bg-noir">Não informar</option>
            {(Object.keys(FUEL_LABEL) as Fuel[]).map((f) => (
              <option key={f} value={f} className="bg-noir">{FUEL_LABEL[f].pt}</option>
            ))}
          </select>
        </Field>
        <Field id="vehicle-doors" label="Portas">
          <input id="vehicle-doors" inputMode="numeric" value={doors} onChange={(e) => setDoors(e.target.value)} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/60">Itens</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <button
                key={f.key}
                type="button"
                role="checkbox"
                aria-checked={features.includes(f.key)}
                onClick={() => toggleFeature(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  features.includes(f.key) ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60",
                )}
              >
                {f.pt}
              </button>
            ))}
          </div>
        </div>
        <Field id="vehicle-description" label="Descrição" hint="Um texto curto para o site. Até 2000 caracteres." className="sm:col-span-2">
          <textarea id="vehicle-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        </Field>
      </fieldset>
      <label className="flex items-center gap-3 text-sm text-bone/80 sm:col-span-2">
        <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} className="h-4 w-4 accent-[#C9A86A]" />
        Em manutenção (não aceita reservas)
      </label>
      {error && <div className="sm:col-span-2"><ErrorNote>{error}</ErrorNote></div>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={save.isPending || !name.trim() || !owner.trim()}>
          {save.isPending ? "Salvando..." : vehicle ? "Salvar" : "Cadastrar"}
        </Button>
        <Button variant="ghost" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}
