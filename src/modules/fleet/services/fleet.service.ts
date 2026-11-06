import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Vehicle, VehicleRequest } from "../model/fleet.types";

export const fleetService = {
  list: async () => (await apiClient.get<ApiResponse<Vehicle[]>>("/vehicles")).data,
  create: async (req: VehicleRequest) => (await apiClient.post<ApiResponse<Vehicle>>("/vehicles", req)).data,
  update: async (id: string, req: VehicleRequest) => (await apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, req)).data,
};
