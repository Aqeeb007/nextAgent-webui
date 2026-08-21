import type { AxiosError, AxiosInstance } from "axios";

import { clearToken, getToken } from "@/lib/storage/token";

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        clearToken();
      }
      return Promise.reject(error);
    }
  );
}
