import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import type { RefreshTokenResponse } from "@/features/auth/types/auth.types";
import { endpoints } from "@/lib/api/endpoints";
import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from "@/lib/storage/refresh-token";
import { useAuthStore } from "@/stores/auth.store";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Raw axios call, deliberately bypassing `apiClient`/`publicApiClient`: this
 * runs from inside the response interceptor, so it must not carry a stale
 * bearer header or itself be subject to the retry-on-401 logic below.
 */
async function refreshSession(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<RefreshTokenResponse>(
      `${env.apiUrl}${endpoints.auth.refresh}`,
      { refreshToken }
    );
    useAuthStore.getState().setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data.accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    clearRefreshToken();
    return null;
  }
}

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableRequestConfig | undefined;

      if (error.response?.status !== 401 || !config || config._retried) {
        return Promise.reject(error);
      }

      config._retried = true;
      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null;
      });

      const accessToken = await refreshPromise;
      if (!accessToken) {
        return Promise.reject(error);
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
      return client(config);
    }
  );
}
