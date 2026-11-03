import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../model/auth.types";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  user: User | null;
  setSession: (token: string, expiresAt: string, user: User) => void;
  setUser: (user: User) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      setSession: (token, expiresAt, user) => set({ token, expiresAt, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, expiresAt: null, user: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        return Boolean(token && expiresAt && new Date(expiresAt).getTime() > Date.now());
      },
    }),
    { name: "neonflow-auth" },
  ),
);
