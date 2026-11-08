import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { ContractDocument, ContractSummary, ContractVersion } from "../model/contract.types";

export const contractService = {
  list: async () => (await apiClient.get<ApiResponse<ContractDocument[]>>("/contracts")).data,
  versions: async (code: string) => (await apiClient.get<ApiResponse<ContractSummary[]>>(`/contracts/${code}/versions`)).data,
  // O navegador lê o arquivo e envia o texto; a API grava a versão nova com o hash.
  createVersion: async (code: string, label: string, body: string) =>
    (await apiClient.post<ApiResponse<ContractSummary>>(`/contracts/${code}/versions`, { label, body })).data,
  version: async (id: string) => (await apiClient.get<ApiResponse<ContractVersion>>(`/contract-versions/${id}`)).data,
};
