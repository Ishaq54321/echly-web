# Phase 4 — Perception system verification

## 1. Screens updated

| Area | Changes |
|------|---------|
| **Dashboard** (`app/(app)/dashboard/page.tsx`) | Session list/grid loading uses `SkeletonList` / `SkeletonSessionGrid` with fixed `min-h-[456px]`. `useStableRenderState` defers pulse until identity is ready (immediate) vs. data-only loads (short reveal delay). Loaded content wrapped in `ech-content-enter`. New Session button: clearer disabled + `active:scale` feedback. |
| **Insights** (`app/(app)/dashboard/insights/page.tsx`) | Header swaps to `SkeletonHeader` while loading; body uses `SkeletonCard` composition matching chart/card regions; `min-h-[720px]` on main column. `useStableRenderState` with immediate skeleton for auth/workspace gates. Sign-in and zero-data paths use `PageEmptyState` with CTAs. Content uses `ech-content-enter`. |
| **Discussion** (`app/(app)/discussion/page.tsx`) | Project sidebar loading replaces plain “Loading…” with `DiscussionSidebarSkeleton`. Main layout `min-h-[420px]`. Empty-state CTA link gets hover/active polish. |
| **Settings** (`app/(app)/settings/page.tsx`) | Suspense shell uses `SkeletonHeader`, tab chips, and `SkeletonCard`. **General** tab shows four stacked skeleton cards while workspace is loading (avoids empty inputs). **Billing** tab replaces centered spinner with pricing grid + table skeletons. General tab content fades in via `ech-content-enter`. |
| **Related surfaces** | `discussionSkeletons.tsx` rebuilt on `SkeletonBase` with stable min-heights. `DiscussionThread` comment boot uses inline row skeletons instead of spinner. `DiscussionPanel` session name loading uses inline bar skeleton. `SessionsWorkspace` replaces row spinners with pulse placeholders (counts, optimistic title, copy-link busy). `UsageMeter` uses skeleton bars instead of spinner. |

## 2. Skeleton coverage

- **New system** (`components/ui/skeletons/`): `SkeletonBase`, `SkeletonCard`, `SkeletonList`, `SkeletonTableRow`, `SkeletonHeader`, `SkeletonSessionGrid`, plus `cx` helper.
- **Stable render hook** (`lib/client/perception/useStableRenderState.ts`): `active` + `showAnimated` with `immediate` for NBIB-style gates and `revealDelayMs` to reduce sub-100ms skeleton flashes on fast networks.
- **Transitions** (`app/globals.css`): `.ech-content-enter` keyframed fade-in; respects `prefers-reduced-motion`.
- **Optional wrapper** (`components/ui/FadeInContent.tsx`): opacity transition utility for future use.

## 3. UX improvements

- Consistent pulse styling via shared primitives; layout reservations (`min-h-*`) on dashboard, insights, discussion shell, settings general/billing loading.
- Empty and sign-in flows on Insights use shared `PageEmptyState` (`components/ui/empty/PageEmptyState.tsx`) for copy + primary CTA.
- Less aggressive center spinners; inline skeletons for comments, session metadata, usage, and billing.
- Light interaction polish: primary actions use `active:scale` where appropriate; disabled states avoid stray clicks (`pointer-events-none` on dashboard CTA when disabled).

## 4. Remaining rough edges

- **Grid vs list**: First paint always respects current view mode; cached preference is already reflected in dashboard state.
- **Session row copy action**: Busy state is a small pulse dot, not an explicit “copying” label — acceptable for micro-actions but could add `aria-busy` on the button if needed.
- **Other routes** (admin, onboarding, login, session detail sidebars): not in Phase 4 scope; some still use `Loader2` or “Loading…” where product priority is lower.
- **Settings Security / Integrations / Billing (loaded)**: unchanged structurally; Advanced sections still use `max-height` collapse (existing pattern) — not removed to avoid scope creep.

## 5. Validation checklist (manual)

- [ ] Throttle network (Slow 3G): dashboard → skeleton holds layout; no blank white main column.
- [ ] Fast navigation between Dashboard ↔ Insights: no harsh double-flash; optional brief static skeleton before pulse when only data waits.
- [ ] Discussion: sidebar skeleton while projects load; list skeleton from existing `DiscussionList`.
- [ ] Settings → General: skeleton stack until workspace snapshot arrives; switches to form without height collapse.
- [ ] Settings → Billing: skeleton grid/table until catalog loads.
- [ ] Empty workspace: dashboard empty cards unchanged; insights `PageEmptyState` with CTA.

## 6. Constraints respected

- No backend or data-layer changes.
- NBIB: identity/workspace gates still drive `immediate` skeleton paths; no changes to `useRenderReadiness` or workspace resolution logic.
