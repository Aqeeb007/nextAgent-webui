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

**Auth session: access token in memory (Zustand), refresh token in `localStorage` — deliberately not symmetric.** [src/stores/auth.store.ts](src/stores/auth.store.ts) (`useAuthStore`) holds `accessToken`/`user` in memory only, with no `persist` middleware — it's wiped on every reload by design. [src/lib/storage/refresh-token.ts](src/lib/storage/refresh-token.ts) is the only thing that touches `localStorage`. [src/lib/api/interceptors.ts](src/lib/api/interceptors.ts) is what ties them together: the request interceptor reads `useAuthStore.getState().accessToken` for the bearer header; the response interceptor, on a 401, calls the refresh endpoint directly via a **raw `axios.post`** (not `publicApiClient` — importing the client here would create `client.ts` → `interceptors.ts` → `client.ts` circularity), repopulates the store + `localStorage` on success, and retries the original request once (`config._retried` guards against loops; concurrent 401s share one in-flight `refreshPromise`). [src/features/auth/services/auth.service.ts](src/features/auth/services/auth.service.ts)'s three functions (`login`/`register`/`refreshAccessToken`) are pure `publicApiClient` wrappers with no side effects — the mutation hooks in `features/auth/hooks/` are what call `setSession`/`setRefreshToken` on success. The `AuthSession`/`AuthUser` response shape in [auth.types.ts](src/features/auth/types/auth.types.ts) (`accessToken`, `refreshToken`, `user: { id, email, firstName, lastName }`) is an assumption — there was no reachable backend to confirm against (only a `curl` example for `register`'s request body), so verify it against the real API and adjust the types/services together if it differs.

### Target architecture

New code should follow this feature-based layout (create directories as needed — most don't exist yet):

- `src/app/` — routing only (App Router). Route groups: `(auth)` for unauthenticated pages, `(dashboard)` for the authenticated app shell (with its own `layout.tsx`). Pages should stay thin and delegate to `src/features/`.
- `src/features/<feature>/` — feature-scoped code (`components/`, `hooks/`, `services/`, `schemas/`, `types/`, `utils/`), e.g. `auth`, `workflows`, `organizations`, `users`. This is where most business logic and feature UI belongs, not in `src/app/`.
- `src/components/ui/` — shadcn primitives. `src/components/layout/` — app chrome (header, sidebar). `src/components/common/` — shared non-feature UI (empty states, loading, error states).
- `src/lib/` — cross-cutting infrastructure: `api/` (client + interceptors + endpoints), `auth/`, `query/`, `storage/`, `utils/`.
- `src/hooks/`, `src/stores/`, `src/types/`, `src/constants/`, `src/config/` — app-wide (not feature-specific) hooks, state stores, shared types, constants, and env/app config.
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — once a test framework is added, tests live here rather than co-located, per the intended structure.

Only add an `api/` route under `src/app/api/` if a Next.js API route is actually needed (e.g. a proxy or webhook) — the primary backend is expected to live outside this app.
