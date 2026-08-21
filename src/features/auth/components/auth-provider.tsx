"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { refreshAccessToken } from "@/features/auth/services/auth.service";
import { getRefreshToken } from "@/lib/storage/refresh-token";
import { useAuthStore } from "@/stores/auth.store";

import { applyRefresh, clearAuthSession } from "../services/session";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * `accessToken` is memory-only, so it's gone after every reload even when a
 * valid refresh token still sits in localStorage — and nothing else
 * proactively uses that refresh token until some protected API call happens
 * to 401. This runs once on mount to restore the access token eagerly
 * instead of waiting on that reactive path.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (useAuthStore.getState().accessToken) return;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    refreshAccessToken(refreshToken).then(applyRefresh).catch(clearAuthSession);
  }, []);

  return children;
}
