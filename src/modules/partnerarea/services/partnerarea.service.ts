import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { PartnerAreaData } from "../model/partnerarea.types";

export const partnerAreaService = {
  // O parceiro é o da conta logada; a API não aceita outro.
  area: async () => (await apiClient.get<ApiResponse<PartnerAreaData>>("/partner/area")).data,
};
