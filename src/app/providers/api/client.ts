import axios, { AxiosError, type AxiosInstance } from "axios";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export interface ApiErrorBody {
  error: string;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);

/** Retorna o envelope `{ status, data }` da API — acesse o payload via `.data`. */
export const apiClient = {
  get: async <T>(url: string) => (await axiosInstance.get<T>(url)).data,
  post: async <T>(url: string, body?: unknown) => (await axiosInstance.post<T>(url, body)).data,
  put: async <T>(url: string, body?: unknown) => (await axiosInstance.put<T>(url, body)).data,
  patch: async <T>(url: string, body?: unknown) => (await axiosInstance.patch<T>(url, body)).data,
  delete: async <T>(url: string) => (await axiosInstance.delete<T>(url)).data,
};

export function apiErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação."): string {
  if (axios.isAxiosError<ApiResponse<ApiErrorBody>>(error)) {
    if (!error.response) return "Sem conexão com a API.";
    return error.response.data?.data?.error ?? fallback;
  }
  return fallback;
}
