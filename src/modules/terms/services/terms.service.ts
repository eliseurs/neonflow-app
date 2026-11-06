import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { PublicTerms, TermsAcceptance, TermsLink, TermsVersion } from "../model/terms.types";

export const termsService = {
  versions: async () => (await apiClient.get<ApiResponse<TermsVersion[]>>("/terms")).data,
  publish: async (body: string) => (await apiClient.post<ApiResponse<TermsVersion>>("/terms", { body })).data,
  createLink: async (bookingId: string) => (await apiClient.post<ApiResponse<TermsLink>>(`/bookings/${bookingId}/terms-link`)).data,
  acceptance: async (bookingId: string) => (await apiClient.get<ApiResponse<TermsAcceptance | null>>(`/bookings/${bookingId}/terms`)).data,
  // Sem login: o código do link é a autorização.
  public: async (token: string) => (await apiClient.get<ApiResponse<PublicTerms>>(`/public/terms/${encodeURIComponent(token)}`)).data,
  accept: async (token: string, typed_name: string, version: number) =>
    (await apiClient.post<ApiResponse<TermsAcceptance>>(`/public/terms/${encodeURIComponent(token)}/accept`, { typed_name, version })).data,
};
