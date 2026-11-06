import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Partner, PartnerKind, PartnerRequest } from "../model/partners.types";

export const partnersService = {
  list: async (kind?: PartnerKind) =>
    (await apiClient.get<ApiResponse<Partner[]>>(kind ? `/partners?kind=${kind}` : "/partners")).data,
  create: async (req: PartnerRequest) => (await apiClient.post<ApiResponse<Partner>>("/partners", req)).data,
  update: async (id: string, req: PartnerRequest) => (await apiClient.put<ApiResponse<Partner>>(`/partners/${id}`, req)).data,
};
