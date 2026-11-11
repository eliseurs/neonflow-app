import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { ContractAction, ContractDocument, ContractEvent, ContractSummary, ContractVersion } from "../model/contract.types";

export const contractService = {
  list: async () => (await apiClient.get<ApiResponse<ContractDocument[]>>("/contracts")).data,
  versions: async (code: string) => (await apiClient.get<ApiResponse<ContractSummary[]>>(`/contracts/${code}/versions`)).data,
  // O navegador lê o arquivo e envia o texto; a API grava a versão nova com o hash.
  createVersion: async (code: string, label: string, body: string) =>
    (await apiClient.post<ApiResponse<ContractSummary>>(`/contracts/${code}/versions`, { label, body })).data,
  // Na aprovação vão o hash do texto lido e a confirmação expressa (RN-08.5).
  addEvent: async (id: string, body: { action: ContractAction; note?: string; sha256?: string; confirm?: boolean }) =>
    (await apiClient.post<ApiResponse<ContractEvent>>(`/contract-versions/${id}/events`, body)).data,
  version: async (id: string) => (await apiClient.get<ApiResponse<ContractVersion>>(`/contract-versions/${id}`)).data,
};
