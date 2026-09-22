export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  // The org to open the user into: their last active org if still a member,
  // otherwise a deterministic fallback (oldest membership) — never "whatever
  // order Postgres happened to return", which is what caused a random org to
  // open after logging back in. `null` only when the user belongs to none
  // (shouldn't happen for `register`, which always creates one).
  organizationId: string | null;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
