import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Customer, CustomerDetail, CustomerRequest } from "../model/customer.types";

export const customerService = {
  list: async (q = "") =>
    (await apiClient.get<ApiResponse<Customer[]>>(q ? `/customers?q=${encodeURIComponent(q)}` : "/customers")).data,
  get: async (id: string) => (await apiClient.get<ApiResponse<CustomerDetail>>(`/customers/${id}`)).data,
  create: async (req: CustomerRequest) => (await apiClient.post<ApiResponse<Customer>>("/customers", req)).data,
  update: async (id: string, req: CustomerRequest) => (await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, req)).data,
  anonymize: async (id: string) => (await apiClient.post<ApiResponse<Customer>>(`/customers/${id}/anonymize`)).data,
};
