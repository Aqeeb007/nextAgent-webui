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

### Target architecture

New code should follow this feature-based layout (create directories as needed — most don't exist yet):

- `src/app/` — routing only (App Router). Route groups: `(auth)` for unauthenticated pages, `(dashboard)` for the authenticated app shell (with its own `layout.tsx`). Pages should stay thin and delegate to `src/features/`.
- `src/features/<feature>/` — feature-scoped code (`components/`, `hooks/`, `services/`, `schemas/`, `types/`, `utils/`), e.g. `auth`, `workflows`, `organizations`, `users`. This is where most business logic and feature UI belongs, not in `src/app/`.
- `src/components/ui/` — shadcn primitives. `src/components/layout/` — app chrome (header, sidebar). `src/components/common/` — shared non-feature UI (empty states, loading, error states).
- `src/lib/` — cross-cutting infrastructure: `api/` (client + interceptors + endpoints), `auth/`, `query/`, `storage/`, `utils/`.
- `src/hooks/`, `src/stores/`, `src/types/`, `src/constants/`, `src/config/` — app-wide (not feature-specific) hooks, state stores, shared types, constants, and env/app config.
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — once a test framework is added, tests live here rather than co-located, per the intended structure.

Only add an `api/` route under `src/app/api/` if a Next.js API route is actually needed (e.g. a proxy or webhook) — the primary backend is expected to live outside this app.
