import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Summary } from "../model/dashboard.types";

export const dashboardService = {
  summary: async () => (await apiClient.get<ApiResponse<Summary>>("/dashboard")).data,
};
