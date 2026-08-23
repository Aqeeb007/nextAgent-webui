const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const env = {
  apiUrl,
  // Socket.IO is mounted on the same Nest app/port as the REST API, but the
  // `api/v1` prefix (set via app.setGlobalPrefix) only applies to HTTP
  // routes, not the WebSocket gateway — so it's stripped here rather than
  // introducing a second env var for what's really the same origin.
  wsUrl: apiUrl.replace(/\/api\/v1\/?$/, ""),
} as const;
