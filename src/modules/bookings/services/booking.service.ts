import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Vehicle } from "@/modules/fleet/model/fleet.types";
import type { Booking, BookingEvent, CreateBookingRequest } from "../model/booking.types";

export const bookingService = {
  list: async () => (await apiClient.get<ApiResponse<Booking[]>>("/bookings")).data,
  get: async (id: string) => (await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`)).data,
  events: async (id: string) => (await apiClient.get<ApiResponse<BookingEvent[]>>(`/bookings/${id}/events`)).data,
  create: async (req: CreateBookingRequest) => (await apiClient.post<ApiResponse<Booking>>("/bookings", req)).data,
  setChecks: async (id: string, checks: Record<string, boolean>) =>
    (await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/checks`, checks)).data,
  /** at: hora real da entrega ou da devolução (AAAA-MM-DDTHH:MM, horário de Gramado); vazia, vale agora. */
    /** km: odômetro na entrega ou na devolução (obrigatório no plano limitado). */
  advance: async (id: string, at?: string, km?: number) => {
    const body = at || km !== undefined ? { ...(at ? { at } : {}), ...(km !== undefined ? { km } : {}) } : undefined;
    return (await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/advance`, body)).data;
  },
  cancel: async (id: string) => (await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`)).data,
  available: async (start: string, end: string) =>
    (await apiClient.get<ApiResponse<Vehicle[]>>(`/availability?start_at=${encodeURIComponent(start)}&end_at=${encodeURIComponent(end)}`)).data,
};
