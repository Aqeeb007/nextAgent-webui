import axios from "axios";

import { env } from "@/config/env";
import { endpoints } from "@/lib/api/endpoints";
import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from "@/lib/storage/refresh-token";
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

const SESSION_EXPIRED_EVENT = "nexagent:session-expired";

/**
 * For a session that died unexpectedly (refresh failed, not an intentional
 * logout) — clears local state and signals that the app should return to
 * /auth. This runs from places with no React Router context (the axios
 * interceptor, the session-bootstrap effect), so it can't call
 * `router.push` itself; it dispatches an event instead, which AuthProvider
 * listens for and turns into a real `router.push`. Without this, a page
 * already open when the refresh token expires clears its session silently
 * and just sits there with every query failing — nothing else re-checks
 * auth until the next navigation.
 */
export function expireSession() {
  clearAuthSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

/** Subscribe to `expireSession()` calls. Returns an unsubscribe function. */
export function onSessionExpired(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SESSION_EXPIRED_EVENT, callback);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, callback);
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * The one place that actually calls POST /auth/refresh. Both the axios
 * response interceptor (reactive, on a 401) and AuthProvider's bootstrap
 * effect (proactive, on first mount) need a fresh access token, and both can
 * fire in the same tick of a page load — a protected query with no
 * `enabled` gate 401s before the bootstrap refresh resolves. If each fired
 * its own request, two concurrent calls would race on the same refresh
 * token; a backend that rotates/invalidates it on use lets one succeed and
 * the other fail, and the failing one would call `expireSession()` and
 * destroy the session the first call had just legitimately renewed — the
 * exact "still asking me to log in" bug this fixes. Sharing one in-flight
 * promise means only one request is ever sent; every caller in that window
 * gets the same result.
 *
 * Raw axios, not `publicApiClient`: this file must stay free of any import
 * from client.ts/auth.service.ts — interceptors.ts imports this file, and
 * client.ts -> interceptors.ts -> session.ts would cycle back to client.ts
 * if this used publicApiClient.
 */
export function refreshSession(): Promise<string | null> {
  refreshPromise ??= performRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<RefreshTokenResponse>(
      `${env.apiUrl}${endpoints.auth.refresh}`,
      { refreshToken }
    );
    applyRefresh(data);
    return data.accessToken;
  } catch {
    expireSession();
    return null;
  }
}
