# Phase 6.7 — Loading & gating audit

What blocks UI, what shows skeletons, and **hidden** dependencies (data that gates polish but not shell).

---

## Global gates (app shell)

| Gate | Source | Blocks |
|------|--------|--------|
| `AppBootGate` / `AppBootReadinessBridge` | Boot orchestration | Initial app readiness (see provider implementation) |
| `WorkspaceIdentityGate` | `isIdentityResolved` / workspace errors | Routes that require workspace |
| `WorkspaceSuspendedGuard` | Workspace suspended flag | Full app usage when suspended |
| `WorkspaceProvider` | `authReady`, `claimsReady`, `workspaceLoading`, `workspaceId` | Any `useWorkspace()` consumer |
| `isIdentityResolved` | `authReady && claimsReady && workspaceId` | Documented as gate for **subscriptions and mutations**, not necessarily shell chrome |

---

## Dashboard (`/dashboard`)

| State | Behavior |
|-------|----------|
| `!isIdentityResolved` | `showListPlaceholders` true — placeholder rows |
| `sessionsLoading && sessions.length === 0` | Placeholders |
| `useStableState(sessions, …)` | **Perception** stabilization — may hold prior list briefly on workspace change |

**Counts**: Comments in `useWorkspaceOverview` state **counts do not gate** first sessions list paint (`awaitingSessionSnapshot` gates loading flag; `isCountsReady` flips true with snapshot). UI uses **field-level skeletons** for missing counts (per hook comments).

---

## Session board (`SessionPageClient`)

| Gate | Effect |
|------|--------|
| `authLoading` / missing `authUid` / `workspaceId` | Session `getDoc` skipped; no session |
| `feedbackLoading` (initial) | From `useSessionFeedbackPaginated` `initialLoading` |
| `feedbackCountsLoading` / `!isCountsSynced` | Contextual index / totals may show **-1** or partial (`contextualPosition` uses `totalForBucket`) |
| Search | Separate `searchLoading`; forces both open+resolved sections expanded |

**Hidden dependency**: Chrome that shows position “of N” **waits** for counts sync — user may see list before counts align.

---

## Session overview

| Gate | Effect |
|------|--------|
| `!isIdentityResolved` or missing `workspaceId` | Skeleton / early empty |
| `loading && !session` | Header + main skeleton |
| Workspace mismatch | Redirect to `/dashboard` after data loads |

---

## Insights

| Gate | Effect |
|------|--------|
| `authLoading` / no user | Login empty state |
| `!isIdentityResolved` or empty `workspaceId` | Skeleton (`insightsSkeletonImmediate`) |
| `loading && !data` | Skeleton until first `onSnapshot` callback |
| Session title map | **Does not block** chart render — bars may show empty names until `getDoc` completes |

---

## Discussion

| Gate | Effect |
|------|--------|
| `!user && !loading` | Sign-in prompt layout |
| `DiscussionList` `loading` | List skeleton |
| `DiscussionThread` | Ticket + session name loading states internal to thread |
| `listLoaded` prop | Suppresses empty message while list still resolving `isEmpty` |

---

## Billing / usage UI

| Component | Gate |
|-----------|------|
| `BillingUsageCacheInitializer` | Idle-scheduled fetch — **non-blocking** for shell |
| `useBillingUsage` | `loading` until first billing fetch; workspace listener must settle |
| `UsageMeter` / `UpgradeModal` | `useWorkspaceUsageRealtime` — depends on workspace store snapshot |

---

## Public share

| Gate | Effect |
|------|--------|
| Server fetch failure | HTTP status → error UI |
| No client identity | N/A (public) |

---

## Anti-patterns / risks spotted

1. **Counts vs list sync**: Ticket list can render from Firestore while **counts** and **isCountsSynced** lag — intentional but easy to misread as bug.
2. **Insights titles**: Charts can render with **empty session names** briefly.
3. **`firebaseClient` vs `firebase`**: Same `db` export — not a split-database risk; keep import style consistent for clarity only.

---

## UI waiting on non-primary data

| Screen | Non-primary waiter |
|--------|-------------------|
| Session board | Counts for “x of y” chrome |
| Insights | Session `getDoc` for labels only (primary metrics from insights doc) |
| Discussion | Session name fetch after ticket fetch (header subtitle) |
