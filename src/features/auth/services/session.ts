import { clearRefreshToken, setRefreshToken } from "@/lib/storage/refresh-token";
import { useAuthStore } from "@/stores/auth.store";

import type { AuthSession, RefreshTokenResponse } from "../types/auth.types";

export function applySession(data: AuthSession) {
  useAuthStore.getState().setSession(data);
  setRefreshToken(data.refreshToken);
}

export function applyRefresh(data: RefreshTokenResponse) {
  useAuthStore.getState().setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
}

export function clearAuthSession() {
  useAuthStore.getState().clearSession();
  clearRefreshToken();
}
