import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic auth gate: checks only for the presence of the session marker
 * cookie (set/cleared in src/lib/storage/refresh-token.ts), never a real
 * token. Actual auth is enforced by the backend on every API call, with the
 * axios interceptor (src/lib/api/interceptors.ts) handling silent refresh —
 * this just keeps logged-out users off protected pages and logged-in users
 * off /auth.
 */
const SESSION_COOKIE = "nexagent_session";
const PUBLIC_ROUTES = ["/auth","/"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (hasSession && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
