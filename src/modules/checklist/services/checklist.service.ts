import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { ChecklistItem, ChecklistItemRequest } from "../model/checklist.types";

export const checklistService = {
  list: async () => (await apiClient.get<ApiResponse<ChecklistItem[]>>("/checklist-items")).data,
  create: async (req: ChecklistItemRequest) => (await apiClient.post<ApiResponse<ChecklistItem>>("/checklist-items", req)).data,
  update: async (id: string, req: ChecklistItemRequest) =>
    (await apiClient.put<ApiResponse<ChecklistItem>>(`/checklist-items/${id}`, req)).data,
};
