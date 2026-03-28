# Dashboard progressive rendering

## 1. Blocking logic removed

- **`useWorkspaceOverview.ts`**
  - Session list `loading` (exported as `loading` for `GlobalSearch` and the dashboard) now means **awaiting the first Firestore sessions snapshot** for the current workspace, not count hydration.
  - On each `onSnapshot` callback, after `setAllSessions`, the hook calls `setAwaitingSessionSnapshot(false)` and `setIsCountsReady(true)`, then runs **`void hydrateCountsForSessionIds(...)`** with the existing generation guard (`sessionsSnapshotGenRef`) plus **`workspaceIdRef.current === wid`** so late responses do not apply after workspace switch.
  - **`refreshSessions`** no longer awaits counts or toggles session-list loading; it uses **`refreshCountsGenRef`** and passes `shouldApply` into `hydrateCountsForSessionIds` so overlapping refreshes do not stomp state.
  - **`hydrateCountsForSessionIds`**: on fetch failure, state is **not** filled with `{ total: 0, open: 0, resolved: 0 }` (avoids fake zeros).
  - **Optimistic create**: temp sessions no longer get placeholder count objects; real IDs rely on snapshot + background hydration.
  - **Delete rollback**: restores counts from **`getCounts(sessionId)`** when present instead of inventing zeros.

## 2. Skeleton fields added

- **`SessionsWorkspace.tsx` (`SessionWorkspaceRow`)**
  - Open / resolved: when counts are unknown (non-optimistic), two pill-sized placeholders with **`h-4 w-8`**-style pulse bars inside fixed min-width shells (stable height **`min-h-[36px]`**).
  - When counts exist, values use real numbers (no `?? 0` for the unknown state); pills still only render for **> 0** to match prior behavior.
  - **Date**: if `formatSessionUpdatedShort` yields empty and the row is not optimistic, a pill-sized skeleton matches the calendar chip layout (**`min-w-[5.5rem]`**, **`h-4 w-16`** pulse).

- **`WorkspaceCard.tsx`**
  - **Updated** line: `session.updatedAt` parsed via **`toDate`** / string (Firestore timestamps), with a **`w-28`** pulse when no parseable date.
  - **Counts**: when `counts` is missing (non-optimistic), three **`h-6`** rounded skeletons (feedback / open / resolved). When `counts` exists, chips only show for **> 0** counts (real zeros stay hidden).

## 3. Before vs after behavior

| Phase | Before | After |
|--------|--------|--------|
| T1 Identity | Gate unchanged | Unchanged |
| T2 Firestore snapshot | UI often stayed in “loading” until **all** per-session count fetches finished | Sessions render as soon as the snapshot commits; **`loading`** clears at that point |
| T3 Counts | Arrived together with “ready” flip | Fill **progressively**; cards/rows show **field-level** skeletons until each session’s counts resolve |

## 4. Dashboard page / global skeletons

- **`dashboard/page.tsx`**
  - **`useStableState(sessions, true, workspaceId)`** — session list is no longer held back until `!sessionsLoading`; workspace changes still reset via `workspaceId`.
  - Full **`SkeletonList` / `SkeletonSessionGrid`** removed. Placeholder is only when **`!isIdentityResolved`** or **`loading && sessions.length === 0`** (first snapshot with no rows yet), using a **compact** dashed panel + short pulse + copy (“Resolving workspace…” / “Loading sessions…”).

## 5. Remaining delays (if any)

- **First paint with no cache**: Until the first `onSnapshot`, the list is empty and the compact placeholder shows (no multi-row skeleton).
- **Per-session counts**: Still network-bound (`fetchCounts`); UI no longer waits on them—only individual fields skeleton until data arrives.
- **Firestore / identity**: Unchanged; identity gating and subscription setup still bound upstream latency.

## 6. Success criteria check

- Sessions visible immediately after snapshot — **yes** (counts no longer gate `loading`).
- Counts not blocking UI — **yes**.
- Skeleton only where data is missing — **yes** (rows/cards); minimal shell placeholder only for empty list + snapshot pending.
- No intentional fake zero counts from hydration errors — **yes** (errors leave counts undefined).
- Layout: pill shells and `min-h` on rows reduce shift; some collapse remains when counts resolve to **all zero** (badges hidden by design).
