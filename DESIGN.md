# Design principles

Reference for staying visually consistent as the app grows past its initial premium-UI pass. These are constants, not suggestions — if a new component needs something outside this list, extend the list (add a token, add a rule) rather than inventing a one-off in place. `CLAUDE.md` covers the base theming setup (Tailwind v4 CSS-first config, dark-native theme, brand tokens); this file covers the rules for *using* that system consistently.

## Color

One job per color — never decorative:

- `primary` (indigo) — primary actions, and **the one active/selected state per view** (active nav item, active tab, selected org in the switcher). Not a default accent for every icon or avatar.
- `live` (teal), `warning` (amber), `success` (green) — domain status only (tool type, member role, connection state). Never used just because a spot needs a splash of color.
- Everything else — `foreground` / `muted-foreground` / `border` / `muted`. Neutral is the default; color is the exception that earns attention.

Current known violation: `primary` is over-applied across icon avatars, stat cards, and ambient background blobs on multiple pages, diluting its "this is the one active thing" meaning. Worth a dedicated pass before this is airtight — see chat history for the specific spots.

## Radius

Scale by element role, not by page:

| Role | Radius |
|---|---|
| Interactive controls (buttons, inputs, nav items, badges' inner elements) | `rounded-lg` |
| Containers (cards, dialogs, panels, dropdown/select popups) | `rounded-xl` |
| Hero / pill elements (auth card, message bubbles, composer bar) | `rounded-2xl` |
| Avatars, badges, pill buttons | `rounded-full` |

## Elevation (shadow)

Named tokens live in `globals.css` (`--shadow-elevation-xs/sm/md/lg/xl`, wired into Tailwind's `shadow-xs…xl` scale via `@theme inline`) plus two brand-specific glow tokens: `--shadow-button-primary` (resting-state tactile edge on the primary button) and `--shadow-glow-primary` / `--shadow-glow-primary-sm` (primary-tinted hover glow, used by the primary button and the sidebar `Logomark`).

**Rule: never write a raw `shadow-[...]` arbitrary value.** If an effect needs a shadow that isn't one of the existing tokens, add a new named `--shadow-*` custom property in `globals.css` and reference it via `shadow-(--token-name)` (same pattern as `w-(--anchor-width)` elsewhere in the codebase) — don't inline it. A repeated arbitrary shadow is exactly how two components (the primary button and the logomark) ended up with near-duplicate hand-written glow values before this was written down.

- Base surface (card, panel) → `shadow-sm`
- Hover-lift (interactive cards) → `shadow-md` / `shadow-lg`
- Modal / popover / dropdown → `shadow-lg` / `shadow-xl`
- Primary CTA → `--shadow-button-primary` at rest, `--shadow-glow-primary` on hover

## Spacing rhythm

- `gap-6` between page-level sections (the stack inside every page's root `<div>`)
- `gap-4` inside card grids
- `gap-2.5` for icon+label rows (nav items, panel headers)
- `gap-1.5` for label+input pairs in forms

## Typography

Page title → section heading → body → meta, enforced mostly by shared components so new pages inherit it automatically:

- Page title: `PageHeader`'s `text-2xl` / `text-[1.75rem]` (`src/components/layout/PageHeader.tsx`)
- Section heading: `text-lg font-medium tracking-tight`
- Body: `text-sm`
- Meta / label: `text-xs font-medium tracking-wide text-muted-foreground uppercase`

## Icon sizing

- Inline / nav / button icons: `size-4`
- Empty state / error state icons: `size-5`
- Avatar-circle icons: roughly 40% of the circle's diameter (e.g. `size-3.5` icon inside a `size-7` circle, `size-4` inside `size-8`/`size-9`)

This one drifted slightly during the redesign (chat avatars at `size-3.5` vs. nav at `size-4`) — the rule above is descriptive of current intent, not yet fully audited.

## Motion

- `fade-up-item` (defined in `globals.css`) — only on primary page content at first paint: grids, empty/error states, hero sections. Stagger via inline `animationDelay`, not a second animation class.
- Never stack `fade-up-item` on something that already animates on its own (dialogs, sheets, dropdowns, selects all have built-in open/close transitions via `tw-animate-css` — don't double up).
- Transition duration default: `duration-150` for interactive state changes (button/input focus, hover), `duration-200` for layout-affecting hovers (card lift).

## Interactive states

- Hover: background/border shift, optionally `-translate-y-0.5` for "liftable" cards
- Focus: `ring-4 ring-ring/20` (inputs/textareas/selects) or `ring-3 ring-ring/50` (buttons — see `button.tsx`)
- Disabled: `opacity-50 pointer-events-none`
- Active/selected (nav, tabs, list rows): left accent bar (`absolute` `w-[3px]` `bg-primary` at `left-0`) + `bg-primary/10` background — see `Sidebar.tsx` nav items and `conversation-list.tsx` for the canonical implementation to copy from.

## Empty / loading / error states

Always go through the shared components — never hand-roll a "no data" message inline:

- `src/components/common/EmptyState.tsx` — icon in a soft gradient circle, title, optional description + action
- `src/components/common/ErrorState.tsx` — same shape, destructive-tinted
- `src/components/common/Loading.tsx` — centered spinner, for non-grid contexts
- `src/components/common/CardGridSkeleton.tsx` — for grid list pages specifically, instead of a spinner (perceived-performance win)

## Checklist for new UI

Before adding a new page or component:

1. Does it need a new color, or does an existing semantic one (`primary`/`live`/`warning`/`success`/neutral) already fit its actual meaning?
2. Does it need a new shadow, or does an elevation token already fit? If genuinely new, name it in `globals.css` — don't inline it.
3. Is the page title/section/body/meta hierarchy using the existing scale, ideally via `PageHeader` rather than hand-rolled headings?
4. Does the empty/loading/error state reuse the shared components?
5. Radius and icon size matching the tables above?
