const REFRESH_TOKEN_KEY = "nexagent_refresh_token";

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken() {
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
