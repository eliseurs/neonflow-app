import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { ErrorNote } from "@/shared/ui/Panel";
import { PHOTO_ACCEPT, photoProblem, type Photo, type PhotoStage } from "../model/photo.types";
import { photoService } from "../services/photo.service";

type Target = { kind: "veiculo"; id: string } | { kind: "reserva"; id: string; stage: PhotoStage };

/** Fotos de um veículo ou de uma etapa da reserva: enviar (várias de uma vez), ver, apagar e, no veículo, escolher a capa. */
export function PhotoGallery({ target, canUpload = true, label }: { target: Target; canUpload?: boolean; label: string }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const key = target.kind === "veiculo" ? ["photos", "veiculo", target.id] : ["photos", "reserva", target.id, target.stage];
  const photos = useQuery({
    queryKey: key,
    queryFn: () => (target.kind === "veiculo" ? photoService.vehicle(target.id) : photoService.booking(target.id, target.stage)),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const f of files) {
        if (target.kind === "veiculo") await photoService.uploadVehicle(target.id, f);
        else await photoService.uploadBooking(target.id, target.stage, f);
      }
    },
    onSuccess: (_, files) => {
      refresh();
      toast.success(files.length === 1 ? "Foto enviada." : `${files.length} fotos enviadas.`);
    },
    onSettled: refresh,
  });
  const remove = useMutation({ mutationFn: (p: Photo) => photoService.remove(p.id), onSuccess: refresh });
  const cover = useMutation({ mutationFn: (p: Photo) => photoService.cover(p.id), onSuccess: refresh });

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const bad = files.map(photoProblem).find(Boolean);
    if (bad) return setProblem(bad);
    setProblem(null);
    if (files.length) upload.mutate(files);
  };

  const error =
    problem ??
    (upload.isError ? apiErrorMessage(upload.error, "Não foi possível enviar.") : null) ??
    (remove.isError ? apiErrorMessage(remove.error, "Não foi possível apagar.") : null) ??
    (photos.isError ? apiErrorMessage(photos.error, "Não foi possível carregar as fotos.") : null);
  const list = photos.data ?? [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((p, i) => (
          <figure key={p.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <img src={p.url} alt={`${label} ${i + 1}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            {target.kind === "veiculo" && i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-noir">Capa</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/80 p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              {target.kind === "veiculo" && i > 0 && (
                <button type="button" onClick={() => cover.mutate(p)} aria-label={`Usar como capa: ${label} ${i + 1}`} className="rounded-full bg-black/60 p-2 text-bone hover:text-gold">
                  <Star className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button type="button" onClick={() => remove.mutate(p)} aria-label={`Apagar ${label} ${i + 1}`} className="rounded-full bg-black/60 p-2 text-bone hover:text-rose-300">
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </figure>
        ))}
        {canUpload && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={upload.isPending}
            className={cn(
              "flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-sm text-bone/60 transition hover:border-gold/60 hover:text-gold",
              upload.isPending && "opacity-60",
            )}
          >
            <ImagePlus className="h-6 w-6" aria-hidden />
            {upload.isPending ? "Enviando..." : "Adicionar fotos"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={PHOTO_ACCEPT} multiple onChange={pick} className="hidden" aria-label={`Enviar fotos: ${label}`} />
      {photos.isSuccess && list.length === 0 && !canUpload && <p className="text-sm text-bone/50">Sem fotos.</p>}
      {error && <ErrorNote>{error}</ErrorNote>}
      <p className="text-xs text-bone/40">JPEG, PNG ou WebP, até 10 MB cada.</p>
    </div>
  );
}
