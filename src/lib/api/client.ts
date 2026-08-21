import axios from "axios";

import { env } from "@/config/env";

import { attachInterceptors } from "./interceptors";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

attachInterceptors(apiClient);
