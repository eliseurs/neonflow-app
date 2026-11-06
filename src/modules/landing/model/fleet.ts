import { API_BASE_URL, apiClient, type ApiResponse } from "@/app/providers/api/client";

// Espelha GET /api/public/fleet: carros fora de manutenção, com a foto de capa (RN-01.7).
export interface PublicCar {
  id: string;
  name: string;
  category: "economy" | "premium";
  seats: number;
  gear: "manual" | "automatico";
  photo_id: string | null;
}

export const PHOTO_WIDTHS = [640, 1280, 1920] as const;

export async function loadPublicFleet(): Promise<PublicCar[]> {
  return (await apiClient.get<ApiResponse<PublicCar[]>>("/public/fleet")).data;
}

/** Endereço fixo de cada versão da foto, com cache de um ano na API. */
export function photoUrl(photoId: string, width: number, base: string = API_BASE_URL): string {
  return `${base}/public/photos/${encodeURIComponent(photoId)}/w/${width}`;
}

/** srcset com as três larguras: o navegador baixa só a que a tela precisa. */
export function photoSrcSet(photoId: string, base: string = API_BASE_URL): string {
  return PHOTO_WIDTHS.map((w) => `${photoUrl(photoId, w, base)} ${w}w`).join(", ");
}
