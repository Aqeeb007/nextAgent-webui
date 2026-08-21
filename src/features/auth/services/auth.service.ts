import { publicApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  AuthSession,
  LoginPayload,
  RefreshTokenResponse,
  RegisterPayload,
} from "../types/auth.types";

export async function login(payload: LoginPayload) {
  const { data } = await publicApiClient.post<AuthSession>(
    endpoints.auth.login,
    payload
  );
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await publicApiClient.post<AuthSession>(
    endpoints.auth.register,
    payload
  );
  return data;
}

export async function refreshAccessToken(refreshToken: string) {
  const { data } = await publicApiClient.post<RefreshTokenResponse>(
    endpoints.auth.refresh,
    { refreshToken }
  );
  return data;
}

/**
 * Revokes a specific refresh token server-side. Takes the token directly
 * (like `refreshAccessToken`) rather than relying on the access token /
 * bearer header, so logging out still works even if the access token is
 * missing or expired.
 */
export async function logout(refreshToken: string) {
  await publicApiClient.post(endpoints.auth.logout, { refreshToken });
}
