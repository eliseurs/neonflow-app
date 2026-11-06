import { apiClient, type ApiResponse } from "@/app/providers/api/client";
import type { Payout, PayoutKind, PayoutStatus } from "../model/payouts.types";

export const payoutsService = {
  list: async (kind: PayoutKind, status: PayoutStatus) =>
    (await apiClient.get<ApiResponse<Payout[]>>(`/payouts?kind=${kind}&status=${status}`)).data,
  pay: async (id: string) => (await apiClient.post<ApiResponse<Payout>>(`/payouts/${id}/pay`)).data,
};
