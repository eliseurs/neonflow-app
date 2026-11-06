import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { inputClass } from "@/shared/ui/Field";
import { ErrorNote, Loading } from "@/shared/ui/Panel";
import type { ChecklistItem } from "../model/checklist.types";
import { checklistService } from "../services/checklist.service";

/** Configura o checklist de devolução (RN-01.6): nome, ordem e itens ativos. */
export function ChecklistManager() {
  const qc = useQueryClient();
  const items = useQuery({ queryKey: ["checklist-items"], queryFn: checklistService.list });
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["checklist-items"] });
  const onError = (e: unknown) => toast.error(apiErrorMessage(e, "Não foi possível salvar o item."));

  const update = useMutation({
    mutationFn: ({ item, changes }: { item: ChecklistItem; changes: Partial<ChecklistItem> }) =>
      checklistService.update(item.id, {
        label: changes.label ?? item.label,
        position: changes.position ?? item.position,
        active: changes.active ?? item.active,
      }),
    onSuccess: refresh,
    onError,
  });

  // Troca a posição com o vizinho: duas gravações, a lista relê no fim.
  const move = useMutation({
    mutationFn: async ({ a, b }: { a: ChecklistItem; b: ChecklistItem }) => {
      await checklistService.update(a.id, { label: a.label, position: b.position, active: a.active });
      await checklistService.update(b.id, { label: b.label, position: a.position, active: b.active });
    },
    onSettled: refresh,
    onError,
  });

  const create = useMutation({
    mutationFn: (label: string) => {
      const last = items.data?.reduce((max, i) => Math.max(max, i.position), 0) ?? 0;
      return checklistService.create({ label, position: last + 10 });
    },
    onSuccess: () => {
      setNewLabel("");
      refresh();
      toast.success("Item adicionado ao checklist.");
    },
    onError,
  });

  const saveLabel = (e: FormEvent, item: ChecklistItem) => {
    e.preventDefault();
    if (!draft.trim()) return;
    update.mutate({ item, changes: { label: draft.trim() } }, { onSuccess: () => setEditing(null) });
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (newLabel.trim()) create.mutate(newLabel.trim());
  };

  if (items.isPending) return <Loading />;
  if (items.isError) return <ErrorNote>{apiErrorMessage(items.error, "Não foi possível carregar o checklist.")}</ErrorNote>;

  const list = [...items.data].sort((a, b) => a.position - b.position);
  const busy = update.isPending || move.isPending;

  return (
    <div className="space-y-6">
      <p className="text-sm text-bone/60">
        O carro devolvido só volta a ficar disponível depois que todos os itens ativos forem conferidos. Desativar um item não apaga as conferências já feitas.
      </p>
      <ul className="divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08]">
        {list.map((item, i) => (
          <li key={item.id} className={cn("flex items-center gap-3 px-4 py-3", !item.active && "opacity-50")}>
            <div className="flex flex-col">
              <button
                type="button"
                aria-label={`Subir ${item.label}`}
                disabled={busy || i === 0}
                onClick={() => move.mutate({ a: item, b: list[i - 1] })}
                className="text-bone/50 hover:text-gold disabled:opacity-20"
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Descer ${item.label}`}
                disabled={busy || i === list.length - 1}
                onClick={() => move.mutate({ a: item, b: list[i + 1] })}
                className="text-bone/50 hover:text-gold disabled:opacity-20"
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>

            {editing === item.id ? (
              <form onSubmit={(e) => saveLabel(e, item)} className="flex flex-1 gap-2">
                <input
                  aria-label={`Novo nome de ${item.label}`}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className={cn(inputClass, "mt-0 py-2")}
                />
                <Button type="submit" variant="outline" className="px-4 py-2" disabled={!draft.trim() || busy}>Salvar</Button>
              </form>
            ) : (
              <span className="flex-1 text-bone/90">{item.label}</span>
            )}

            {editing !== item.id && (
              <button
                type="button"
                aria-label={`Renomear ${item.label}`}
                onClick={() => {
                  setEditing(item.id);
                  setDraft(item.label);
                }}
                className="p-1 text-bone/50 hover:text-gold"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={item.active}
              aria-label={`${item.label} ativo`}
              disabled={busy}
              onClick={() => update.mutate({ item, changes: { active: !item.active } })}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
                item.active ? "border-gold bg-gold/80" : "border-white/20 bg-white/[0.06]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-bone transition-all duration-300 ease-silk",
                  item.active ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="flex gap-2">
        <input
          aria-label="Nome do novo item"
          placeholder="Novo item (ex.: Estepe)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className={cn(inputClass, "mt-0")}
        />
        <Button type="submit" variant="outline" className="shrink-0 px-4" disabled={!newLabel.trim() || create.isPending}>
          <Plus className="h-4 w-4" aria-hidden /> Adicionar
        </Button>
      </form>
    </div>
  );
}
