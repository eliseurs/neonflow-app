import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { CreateTransferRequest, Driver, Transfer, TransferEvent } from "../model/transfer.types";

type R = ApiResponse<Transfer>;

export const transferService = {
  list: async () => (await apiClient.get<ApiResponse<Transfer[]>>("/transfers")).data,
  get: async (id: string) => (await apiClient.get<R>(`/transfers/${id}`)).data,
  events: async (id: string) => (await apiClient.get<ApiResponse<TransferEvent[]>>(`/transfers/${id}/events`)).data,
  create: async (req: CreateTransferRequest) => (await apiClient.post<R>("/transfers", req)).data,
    drivers: async (id: string) => (await apiClient.get<ApiResponse<Driver[]>>(`/transfers/${id}/drivers`)).data,
  offer: async (id: string, offer_cents: number) => (await apiClient.post<R>(`/transfers/${id}/offer`, { offer_cents })).data,
  notify: async (id: string, driver_partner_id: string) => (await apiClient.post<R>(`/transfers/${id}/notify`, { driver_partner_id })).data,
  /** offer_cents: valor final, se mudou; vehicle_id: carro da corrida, opcional. */
  accept: async (id: string, driver_partner_id: string, offer_cents?: number, vehicle_id?: string) =>
    (await apiClient.post<R>(`/transfers/${id}/accept`, {
      driver_partner_id, ...(offer_cents !== undefined ? { offer_cents } : {}), ...(vehicle_id ? { vehicle_id } : {}),
    })).data,
  release: async (id: string) => (await apiClient.post<R>(`/transfers/${id}/release`)).data,
  setPaid: async (id: string, paid: boolean) => (await apiClient.patch<R>(`/transfers/${id}/paid`, { paid })).data,
  start: async (id: string) => (await apiClient.post<R>(`/transfers/${id}/start`)).data,
  complete: async (id: string, extra_wait_cents: number) => (await apiClient.post<R>(`/transfers/${id}/complete`, { extra_wait_cents })).data,
  cancel: async (id: string, flight_cancelled: boolean) => (await apiClient.post<R>(`/transfers/${id}/cancel`, { flight_cancelled })).data,
};
