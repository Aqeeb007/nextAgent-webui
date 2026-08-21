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
