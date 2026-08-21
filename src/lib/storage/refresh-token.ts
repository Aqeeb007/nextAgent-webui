const REFRESH_TOKEN_KEY = "nexagent_refresh_token";

/**
 * `proxy.ts` runs on the server and can only see cookies, never `localStorage` —
 * this lightweight marker (no token value, just presence) is what it checks to
 * decide whether a request is plausibly authenticated. It always tracks the
 * refresh token 1:1, set/cleared here so no call site can update one without
 * the other. It is NOT the source of truth for auth — that's still the backend.
 */
const SESSION_COOKIE = "nexagent_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function cookieAttributes(maxAge: number) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  return `path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  document.cookie = `${SESSION_COOKIE}=1; ${cookieAttributes(SESSION_COOKIE_MAX_AGE)}`;
}

export function clearRefreshToken() {
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE}=; ${cookieAttributes(0)}`;
}
