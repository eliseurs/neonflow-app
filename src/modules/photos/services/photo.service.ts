import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Photo, PhotoStage } from "../model/photo.types";

export const photoService = {
  vehicle: async (id: string) => (await apiClient.get<ApiResponse<Photo[]>>(`/vehicles/${id}/photos`)).data,
  uploadVehicle: async (id: string, file: File) => (await apiClient.upload<ApiResponse<Photo>>(`/vehicles/${id}/photos`, file)).data,
  booking: async (id: string, stage: PhotoStage) =>
    (await apiClient.get<ApiResponse<Photo[]>>(`/bookings/${id}/photos?stage=${stage}`)).data,
  uploadBooking: async (id: string, stage: PhotoStage, file: File) =>
    (await apiClient.upload<ApiResponse<Photo>>(`/bookings/${id}/photos?stage=${stage}`, file)).data,
  remove: async (id: string) => apiClient.delete(`/photos/${id}`),
  cover: async (id: string) => (await apiClient.post<ApiResponse<Photo>>(`/photos/${id}/cover`)).data,
};
