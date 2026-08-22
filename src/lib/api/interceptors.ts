import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { refreshSession } from "@/features/auth/services/session";
import { useAuthStore } from "@/stores/auth.store";
import { useOrganizationStore } from "@/stores/organization.store";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const selectedOrgId = useOrganizationStore.getState().selectedOrgId;
    if (selectedOrgId) {
      config.headers["X-Organization-Id"] = selectedOrgId;
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
      const accessToken = await refreshSession();
      if (!accessToken) {
        return Promise.reject(error);
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
      return client(config);
    }
  );
}
