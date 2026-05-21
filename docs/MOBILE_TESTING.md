# Mobile Testing

## Audit summary

The mobile audit identified ~61 hours of work across the app to reach mobile
parity with desktop. The dominant issues are: fixed-width sidebars/rails that
overflow narrow viewports, tables that need a card layout below `md:`, modals
and dropdowns sized for desktop, and onboarding/auth flows that assume a wide
canvas. Desktop must remain pixel-identical — every mobile change is additive,
scoped behind Tailwind `md:`+ prefixes.

## Chrome DevTools setup

- Open the device toolbar with **Cmd+Shift+M** (macOS) / **Ctrl+Shift+M** (Win/Linux).
- Recommended test viewports:
  - iPhone SE — 375 × 667 (smallest realistic phone)
  - iPhone 14 Pro — 390 × 844 (modern phone baseline)
  - iPad Mini — 768 × 1024 (tablet / `md:` boundary)

## Desktop-preservation contract

- Every PR must be diffed at 1440px wide before merge.
- Zero visual changes to desktop are allowed in mobile-track PRs.
- Use `md:`, `lg:`, `xl:` prefixes to **scope mobile additions** — mobile styles
  live in the base class, desktop styles live behind the responsive prefix.

## Reference patterns

- [DashboardMetricsStrip.tsx](../components/dashboard/DashboardMetricsStrip.tsx) — responsive grid layout.
- [admin/customers/page.tsx](../app/admin/customers/page.tsx) — table-to-card pattern below `md:`.
- [discussion/page.tsx](../app/(app)/discussion/page.tsx) — list/detail pane navigation on narrow viewports.

## Phase plan

- **Phase 0 — foundations (this work):** viewport meta, `useIsMobile` hook, testing doc.
- **Phase 1 — GlobalRail drawer:** mobile drawer for the global navigation rail.
- **Phase 2 — critical screens:** session detail, settings, public viewer.
- **Phase 3 — important polish:** dashboard, sessions list, modals, dropdowns, onboarding.
- **Phase 4 — typography, auth, settings deep pass.**
