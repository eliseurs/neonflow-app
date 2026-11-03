import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { LoginRequest, LoginResponse, User } from "../model/auth.types";

export const authService = {
  login: async (req: LoginRequest) => (await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", req)).data,
  me: async () => (await apiClient.get<ApiResponse<User>>("/auth/me")).data,
};
