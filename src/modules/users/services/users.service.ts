import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { CreateUserRequest, PanelUser, UpdateUserRequest } from "../model/users.types";

export const usersService = {
  list: async () => (await apiClient.get<ApiResponse<PanelUser[]>>("/users")).data,
  create: async (req: CreateUserRequest) => (await apiClient.post<ApiResponse<PanelUser>>("/users", req)).data,
  update: async (id: string, req: UpdateUserRequest) => (await apiClient.put<ApiResponse<PanelUser>>(`/users/${id}`, req)).data,
  resetPassword: async (id: string, password: string) => {
    await apiClient.post(`/users/${id}/password`, { password });
  },
  changeOwnPassword: async (current: string, next: string) => {
    await apiClient.post("/auth/password", { current_password: current, new_password: next });
  },
};
