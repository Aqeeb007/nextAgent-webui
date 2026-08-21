import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthUser } from "@/features/auth/types/auth.types";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (session: { accessToken: string; user: AuthUser }) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: ({ accessToken, user }) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "nexagent_auth_user",
      // `accessToken` is deliberately excluded — it must stay memory-only.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
