// Espelha internal/domain/photo da API (RN-01.6, RN-01.7, ADR-0014).
export type PhotoStage = "entrega" | "devolucao";

export interface Photo {
  id: string;
  owner_type: "veiculo" | "reserva";
  owner_id: string;
  stage: "" | PhotoStage;
  content_type: string;
  size_bytes: number;
  position: number;
  /** Link temporário (15 min) para ver a foto. */
  url: string;
  created_at: string;
}

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

export const STAGE_LABEL: Record<PhotoStage, string> = { entrega: "Entrega", devolucao: "Devolução" };

/** Confere no navegador antes de enviar; a API confere de novo pelo conteúdo. */
export function photoProblem(file: File): string | null {
  if (!PHOTO_ACCEPT.split(",").includes(file.type)) return `${file.name}: envie JPEG, PNG ou WebP.`;
  if (file.size > MAX_PHOTO_BYTES) return `${file.name}: passa de 10 MB.`;
  return null;
}

/** Espelha a API: entrega até a locação começar; devolução na devolução e até aprovar o checklist. */
export function photoStageOpen(photoStage: PhotoStage, bookingStage: string): boolean {
  return photoStage === "entrega"
    ? bookingStage === "confirmada" || bookingStage === "em_locacao"
    : bookingStage === "em_locacao" || bookingStage === "devolvida";
}
