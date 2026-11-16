import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { ClientCar, RequestDetail, RequestInput, RequestStatus, SiteRequest } from "../model/requests.types";

const q = (start: string, end: string) => `start_at=${encodeURIComponent(start)}&end_at=${encodeURIComponent(end)}`;

// Cliente logado (área do cliente): só os próprios pedidos.
export const clientRequestsService = {
  cars: async (start: string, end: string) => (await apiClient.get<ApiResponse<ClientCar[]>>(`/client/cars?${q(start, end)}`)).data,
  list: async () => (await apiClient.get<ApiResponse<SiteRequest[]>>("/client/requests")).data,
  get: async (id: string) => (await apiClient.get<ApiResponse<RequestDetail>>(`/client/requests/${id}`)).data,
  create: async (input: RequestInput) => (await apiClient.post<ApiResponse<SiteRequest>>("/client/requests", input)).data,
  resubmit: async (id: string, input: RequestInput) => (await apiClient.put<ApiResponse<SiteRequest>>(`/client/requests/${id}`, input)).data,
  cancel: async (id: string) => (await apiClient.post<ApiResponse<SiteRequest>>(`/client/requests/${id}/cancel`)).data,
};

// Central: todos os pedidos e as respostas.
export const requestsService = {
  list: async (status?: RequestStatus) => (await apiClient.get<ApiResponse<SiteRequest[]>>(status ? `/requests?status=${status}` : "/requests")).data,
  get: async (id: string) => (await apiClient.get<ApiResponse<RequestDetail>>(`/requests/${id}`)).data,
  confirm: async (id: string, priceCents?: number) =>
    (await apiClient.post<ApiResponse<SiteRequest>>(`/requests/${id}/confirm`, priceCents ? { price_cents: priceCents } : {})).data,
  adjust: async (id: string, note: string) => (await apiClient.post<ApiResponse<SiteRequest>>(`/requests/${id}/adjust`, { note })).data,
  refuse: async (id: string, note: string) => (await apiClient.post<ApiResponse<SiteRequest>>(`/requests/${id}/refuse`, { note })).data,
};
