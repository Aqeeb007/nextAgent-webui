import axios from "axios";

import { env } from "@/config/env";

import { attachInterceptors } from "./interceptors";

const baseConfig = {
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
};

/** Unauthenticated calls (login, register, refresh) — no bearer header, no retry-on-401. */
export const publicApiClient = axios.create(baseConfig);

/** Authenticated app calls — bearer header and silent refresh-on-401 attached below. */
export const apiClient = axios.create(baseConfig);

attachInterceptors(apiClient);
