# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

This is an early-stage scaffold (fresh `create-next-app` + shadcn/ui setup). Almost none of the target architecture below exists yet — `src/app/page.tsx` is still the default Next.js starter page, and `src/app/(auth)/auth/page.tsx` is a stub. Treat the structure in "Target architecture" as the convention to follow when adding code, not as a description of what's already built.

## Commands

Package manager is **pnpm** (pinned via `packageManager` in package.json and `pnpm-lock.yaml`) — don't use npm/yarn despite what the generic README says.

```bash
pnpm dev      # start dev server (localhost:3000)
pnpm build    # production build
pnpm start    # run a production build
pnpm lint     # eslint
```

No test framework is configured (no test script, no Jest/Vitest/Playwright dependency) — there is currently no `pnpm test` command.

## Architecture

**Next.js 16.3.1 / React 19, App Router only.** Next 16 has real breaking changes vs. older Next you may have trained on — see `@AGENTS.md`'s instruction to read `node_modules/next/dist/docs/` before writing routing/data-fetching code.

**Tailwind CSS v4, CSS-first config** — there is no `tailwind.config.js`. Theme tokens (colors, radii, fonts) are defined directly in [globals.css](src/app/globals.css) via `@theme inline` and `:root`/`.dark` CSS custom properties. Add new design tokens there, not in a JS config.

**Dark-native brand theme, no light mode.** `<html>` in [layout.tsx](src/app/layout.tsx) always carries the `dark` class — the app has one theme (background `#0b0d10`, surface/card `#14171c`, primary `#6e5bff` indigo), not a light/dark toggle. The `:root` (light) block in globals.css is unused shadcn scaffolding left in place only in case a toggle is added later; don't build against it. Beyond the standard shadcn tokens, three brand-specific semantic colors are registered the same way: `--success` (`#4ade80`), `--warning` (`#f5a623`), `--live` (`#35d0c0`, for live/running status). They follow the existing `destructive` convention — tinted, not solid (`bg-success/10 text-success`, see [badge.tsx](src/components/ui/badge.tsx) variants) — reuse that pattern for any new status/semantic color rather than inventing a solid-fill style.

**shadcn/ui is configured but on `@base-ui/react`, not Radix.** [components.json](components.json) uses style `base-nova` with `iconLibrary: lucide`. This means generated/copied shadcn components import primitives from `@base-ui/react/*` (see [button.tsx](src/components/ui/button.tsx)) — don't assume `@radix-ui/*` imports when adding or referencing shadcn components. Variant styling uses `class-variance-authority` (cva); class merging goes through `cn()` in [src/lib/utils.ts](src/lib/utils.ts) (`clsx` + `tailwind-merge`), the standard shadcn helper.

Path alias: `@/*` → `src/*` (tsconfig.json), matching the shadcn aliases in components.json (`@/components`, `@/lib`, `@/hooks`, etc.).

**API calls go through `apiClient`/`publicApiClient` + TanStack Query, not raw `fetch`/`axios`.** [src/lib/api/client.ts](src/lib/api/client.ts) exports two axios instances sharing one base config (base URL from [src/config/env.ts](src/config/env.ts)'s `NEXT_PUBLIC_API_URL`, which already includes the `/api/v1` prefix — endpoint strings in [endpoints.ts](src/lib/api/endpoints.ts) don't repeat it): `apiClient` (interceptors attached, use for anything requiring auth) and `publicApiClient` (bare, no interceptors — use for login/register/refresh, which must never carry a stale bearer header or trigger the retry logic below). Endpoint path strings live in `endpoints.ts`, grouped by feature (e.g. `endpoints.auth.login`) — add new routes there rather than inlining path strings in a feature's `services/`. [src/lib/query/query-provider.tsx](src/lib/query/query-provider.tsx) wraps the whole app in `layout.tsx` with a `QueryClientProvider` (SSR-safe client singleton via `getQueryClient()` in `query-client.ts`); React Query Devtools are mounted but only render when `NODE_ENV === "development"`. Data-fetching hooks belong in each feature's `hooks/` (e.g. [use-login.ts](src/features/auth/hooks/use-login.ts)), built on `apiClient`/`publicApiClient` + `useQuery`/`useMutation` — see the "Community libraries" guidance in `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`, which is Next's own recommended pattern for client-side fetching in the App Router.

**Auth session: access token in memory (Zustand) only, refresh token in `localStorage`, `user` persisted separately — three different lifetimes on purpose.** [src/stores/auth.store.ts](src/stores/auth.store.ts) (`useAuthStore`) uses Zustand's `persist` middleware with `partialize: (state) => ({ user: state.user })` — `user` survives a reload, `accessToken` never does; don't remove that `partialize` or the access token starts landing in `localStorage`. [src/lib/storage/refresh-token.ts](src/lib/storage/refresh-token.ts) is the only thing that touches the refresh token itself (also `localStorage`, under a different key). Three call sites need to sync store + storage together — [session.ts](src/features/auth/services/session.ts) is the single place that does it (`applySession` for login/register's full `{accessToken, user}`, `applyRefresh` for refresh's `{accessToken}`-only shape, `clearAuthSession` for both) — add new session-mutating code by calling these, not by touching `useAuthStore`/`refresh-token.ts` directly inline. [src/lib/api/interceptors.ts](src/lib/api/interceptors.ts) request interceptor reads `useAuthStore.getState().accessToken` for the bearer header; on a 401, the response interceptor calls the refresh endpoint via a **raw `axios.post`** (not `publicApiClient` — importing the client here would create `client.ts` → `interceptors.ts` → `client.ts` circularity, and `session.ts` is deliberately import-safe for this reason too, see below), then `applyRefresh`s the result and retries the original request once (`config._retried` guards against loops; concurrent 401s share one in-flight `refreshPromise`). That interceptor path is reactive, though — it only fires once some `apiClient` call actually 401s. [auth-provider.tsx](src/features/auth/components/auth-provider.tsx), mounted in `layout.tsx`, closes that gap: on first app mount it eagerly calls `/auth/refresh` if a refresh token exists and no access token is in the store yet, so the session comes back even on a page that makes no protected API calls (`/dashboard` doesn't, today). [src/features/auth/services/auth.service.ts](src/features/auth/services/auth.service.ts)'s three functions (`login`/`register`/`refreshAccessToken`) are pure `publicApiClient` wrappers with no side effects. `session.ts` imports only `refresh-token.ts` + `auth.store.ts` (never `client.ts` or `auth.service.ts`), which is exactly what lets `interceptors.ts` use it without recreating the circular-import problem above. The `AuthSession`/`AuthUser` response shape in [auth.types.ts](src/features/auth/types/auth.types.ts) (`accessToken`, `refreshToken`, `user: { id, email, firstName, lastName }`) is an assumption — there was no reachable backend to confirm against (only a `curl` example for `register`'s request body), so verify it against the real API and adjust the types/services together if it differs.

**Route protection is `src/proxy.ts`, not `middleware.ts`.** Next.js renamed the file convention in v16 (`middleware.ts` still works but is deprecated — don't create one; see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). `proxy.ts` does an **optimistic** check only: it looks for the presence of a `nexagent_session` cookie (no value/signature check — it's a plain `=1` marker, not the token itself) and redirects unauthenticated requests to `/auth`, or authenticated ones away from `/auth` to `/dashboard`. `/auth` is the only entry in `PUBLIC_ROUTES`; everything else is default-deny. This cookie can't be httpOnly/server-set the way Next's own auth guide recommends, because sessions here come from an external backend via client-side axios calls, not a Next.js Server Action — so it's written from the client in [refresh-token.ts](src/lib/storage/refresh-token.ts), set/cleared in lockstep with the refresh token by the same two functions (`setRefreshToken`/`clearRefreshToken`), which is why no other call site (login/register mutations, the interceptor's silent refresh, Sidebar's logout) needed to change. Real authorization still happens at the backend on every request; proxy.ts only prevents flashing protected UI or the login form to the wrong user. One known gap: if the interceptor's silent refresh fails on an already-open protected page (expired refresh token), the session/cookie are cleared but there's no client-side redirect to `/auth` until the next navigation — proxy only runs on navigation, not silently mid-session.

### Target architecture

New code should follow this feature-based layout (create directories as needed — most don't exist yet):

- `src/app/` — routing only (App Router). Route groups: `(auth)` for unauthenticated pages, `(dashboard)` for the authenticated app shell (with its own `layout.tsx`). Pages should stay thin and delegate to `src/features/`.
- `src/features/<feature>/` — feature-scoped code (`components/`, `hooks/`, `services/`, `schemas/`, `types/`, `utils/`), e.g. `auth`, `workflows`, `organizations`, `users`. This is where most business logic and feature UI belongs, not in `src/app/`.
- `src/components/ui/` — shadcn primitives. `src/components/layout/` — app chrome (header, sidebar). `src/components/common/` — shared non-feature UI (empty states, loading, error states).
- `src/lib/` — cross-cutting infrastructure: `api/` (client + interceptors + endpoints), `auth/`, `query/`, `storage/`, `utils/`.
- `src/hooks/`, `src/stores/`, `src/types/`, `src/constants/`, `src/config/` — app-wide (not feature-specific) hooks, state stores, shared types, constants, and env/app config.
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — once a test framework is added, tests live here rather than co-located, per the intended structure.

Only add an `api/` route under `src/app/api/` if a Next.js API route is actually needed (e.g. a webhook receiver) — the primary backend is expected to live outside this app. (Don't confuse this with [src/proxy.ts](src/proxy.ts), Next's routing-interception file — unrelated despite the name overlap.)
