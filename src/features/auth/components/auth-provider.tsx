"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { getRefreshToken } from "@/lib/storage/refresh-token";
import { useAuthStore } from "@/stores/auth.store";

import { onSessionExpired, refreshSession } from "../services/session";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * `accessToken` is memory-only, so it's gone after every reload even when a
 * valid refresh token still sits in localStorage — and nothing else
 * proactively uses that refresh token until some protected API call happens
 * to 401. This runs once on mount to restore the access token eagerly
 * instead of waiting on that reactive path.
 *
 * Calls the same `refreshSession()` the axios interceptor uses (not a
 * separate request) — a protected query can 401 and trigger the
 * interceptor's own refresh in the same tick as this effect, and without a
 * single shared in-flight promise, two concurrent refreshes racing on one
 * (possibly single-use) refresh token would let one succeed and the other
 * fail, expiring the session the first had just renewed.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const hasRun = useRef(false);

  // The only place with router access, so this is where expireSession()'s
  // event (fired from session.ts on a failed refresh) turns into an actual
  // navigation.
  useEffect(() => onSessionExpired(() => router.push("/auth")), [router]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (useAuthStore.getState().accessToken) return;
    if (!getRefreshToken()) return;

    refreshSession();
  }, []);

  return children;
}
