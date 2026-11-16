import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { AuditEntry, AuditFilter } from "../model/audit.types";

export const auditService = {
  list: async (f: AuditFilter = {}) => {
    const q = new URLSearchParams();
    if (f.userId) q.set("user_id", f.userId);
    if (f.denied) q.set("denied", "true");
    const qs = q.toString();
    return (await apiClient.get<ApiResponse<AuditEntry[]>>(`/audit${qs ? `?${qs}` : ""}`)).data;
  },
};
