import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { MaintenanceRecord, MaintenanceRequest, Vehicle, VehicleRequest, VehicleStats } from "../model/fleet.types";

export const fleetService = {
  list: async () => (await apiClient.get<ApiResponse<Vehicle[]>>("/vehicles")).data,
  get: async (id: string) => (await apiClient.get<ApiResponse<Vehicle>>(`/vehicles/${id}`)).data,
  create: async (req: VehicleRequest) => (await apiClient.post<ApiResponse<Vehicle>>("/vehicles", req)).data,
  update: async (id: string, req: VehicleRequest) => (await apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, req)).data,
  comparison: async () => (await apiClient.get<ApiResponse<VehicleStats[]>>("/vehicles/stats")).data,
  stats: async (id: string) => (await apiClient.get<ApiResponse<VehicleStats>>(`/vehicles/${id}/stats`)).data,
  maintenance: async (id: string) => (await apiClient.get<ApiResponse<MaintenanceRecord[]>>(`/vehicles/${id}/maintenance`)).data,
  addMaintenance: async (id: string, req: MaintenanceRequest) =>
    (await apiClient.post<ApiResponse<MaintenanceRecord>>(`/vehicles/${id}/maintenance`, req)).data,
  removeMaintenance: async (id: string) => apiClient.delete(`/maintenance/${id}`),
};
