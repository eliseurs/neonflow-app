import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { PublicTerms, TermsAcceptance, TermsLink, TermsOrder, TermsVersion } from "../model/terms.types";

export const termsService = {
  versions: async () => (await apiClient.get<ApiResponse<TermsVersion[]>>("/terms")).data,
  publish: async (body: string) => (await apiClient.post<ApiResponse<TermsVersion>>("/terms", { body })).data,
  createLink: async (bookingId: string) => (await apiClient.post<ApiResponse<TermsLink>>(`/bookings/${bookingId}/terms-link`)).data,
  acceptance: async (bookingId: string) => (await apiClient.get<ApiResponse<TermsAcceptance | null>>(`/bookings/${bookingId}/terms`)).data,
  // Sem login: o código do link é a autorização.
  public: async (token: string) => (await apiClient.get<ApiResponse<PublicTerms>>(`/public/terms/${encodeURIComponent(token)}`)).data,
  accept: async (token: string, typed_name: string, version: number) =>
    (await apiClient.post<ApiResponse<TermsAcceptance>>(`/public/terms/${encodeURIComponent(token)}/accept`, { typed_name, version })).data,
  // Ordem 04: versão exata, hash do texto e do quadro lidos e a caixa marcada (RN-02.3, padrão V15).
  acceptOrder: async (token: string, typed_name: string, order: TermsOrder, quadro_sha256: string) =>
    (
      await apiClient.post<ApiResponse<TermsAcceptance>>(`/public/terms/${encodeURIComponent(token)}/accept`, {
        typed_name,
        contract_version_id: order.version_id,
        sha256: order.sha256,
        quadro_sha256,
        confirm: true,
      })
    ).data,
};
