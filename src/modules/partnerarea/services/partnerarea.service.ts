import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { PartnerAreaData } from "../model/partnerarea.types";

export const partnerAreaService = {
  // O parceiro é o da conta logada; a API não aceita outro.
  area: async () => (await apiClient.get<ApiResponse<PartnerAreaData>>("/partner/area")).data,
  // Oferta aberta (PEN-74): o primeiro que aceita leva; o carro, se vier, é um dos do motorista.
  accept: async (rideId: string, vehicleId?: string) =>
    (await apiClient.post<ApiResponse<{ accepted: boolean }>>(`/partner/rides/${rideId}/accept`, vehicleId ? { vehicle_id: vehicleId } : {})).data,
  release: async (rideId: string) => (await apiClient.post<ApiResponse<{ released: boolean }>>(`/partner/rides/${rideId}/release`)).data,
};
