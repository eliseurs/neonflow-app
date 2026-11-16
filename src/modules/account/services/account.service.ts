import { apiClient, type ApiResponse } from "@/app/providers/api/client";

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface Invite {
  sent_to: string;
  expires_at: string;
}

// Rotas públicas da API (RN-05.12 a 05.14): o código do link enviado por e-mail é a autorização.
export const accountService = {
  signup: async (req: SignupRequest) => (await apiClient.post<ApiResponse<{ message: string }>>("/public/accounts/signup", req)).data,
  confirm: async (token: string) => (await apiClient.post<ApiResponse<{ confirmed: boolean }>>("/public/accounts/confirm", { token })).data,
  forgotPassword: async (email: string) =>
    (await apiClient.post<ApiResponse<{ message: string }>>("/public/accounts/forgot-password", { email })).data,
  resetPassword: async (token: string, password: string) =>
    (await apiClient.post<ApiResponse<{ password_changed: boolean }>>("/public/accounts/reset-password", { token, password })).data,
  acceptInvite: async (token: string, password: string) =>
    (await apiClient.post<ApiResponse<{ account_created: boolean }>>("/public/accounts/accept-invite", { token, password })).data,
  // A central convida o parceiro: o link de criar senha vai para o e-mail dele.
  invitePartner: async (partnerId: string) => (await apiClient.post<ApiResponse<Invite>>(`/partners/${partnerId}/invite`)).data,
};
