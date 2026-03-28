# Phase 6.7 — Listener topology (realtime / subscriptions)

All **Firestore `onSnapshot`** and closely related **subscription hooks** are enumerated. Firebase **Auth** `onAuthStateChanged` is included where it drives data mounts.

---

## Firestore `onSnapshot` (client SDK)

| Location | Listens to | Mounts when | Unmounts when | Notes |
|----------|------------|-------------|---------------|-------|
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `sessions` collection query: `workspaceId == wid`, `orderBy updatedAt`, `limit 30` | `authUid` and `workspaceId` truthy | Effect cleanup: `unsubscribe()` | **Single** listener for entire app shell via `WorkspaceOverviewProvider` |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | `feedback` collection: `workspaceId` + `sessionId` | Session page, identity ready | Session/identity change or unmount | **Full session feedback** — can be large result set |
| `app/(app)/dashboard/insights/page.tsx` | Document: workspace insights (`workspaceInsightsRef(wid)`) | Insights page, auth + workspace ready | Page unmount / workspace change | One doc; primary insights source |
| `lib/realtime/workspaceStore.ts` | Document: `workspaces/{workspaceId}` | `subscribeWorkspace` / `retainWorkspaceFirestoreListener` when retain count > 0 | `retainWorkspaceFirestoreListener` release when count 0; `clearWorkspaceSubscription` on sign-out | **Global singleton** per tab; multiplexed via `subscribeWorkspaceStore` + retain count |
| `lib/repositories/commentsRepository.ts` → `listenToCommentsRepo` | `comments` query: `workspaceId`, `sessionId`, `feedbackId`, `orderBy createdAt`, `limit 100` | Used by `useCommentsRepoSubscription` when all ids set | Unsubscribe on dep change / unmount | **One listener per selected feedback** |

---

## Hook wrappers (thin adapters)

| Hook | Underlying listener | Duplication risk |
|------|---------------------|------------------|
| `lib/hooks/useCommentsRepoSubscription.ts` | `listenToCommentsRepo` | **Per (workspace, session, feedback)**. Only one active per hook instance. |
| `lib/hooks/useWorkspaceUsageRealtime.ts` | `useWorkspaceRealtimeStore` → workspace store snapshot | **Shared** with `useBillingUsage` / other consumers — same Firestore listener if retain count > 0. |
| `lib/hooks/useBillingUsage.ts` | `retainWorkspaceFirestoreListener` + `subscribeWorkspaceStore` (not Firestore itself) | Multiple hook instances **increment retain count**; single Firestore unsub when all release. |

---

## Non-Firestore listeners (related)

| Location | Mechanism | Purpose |
|----------|-----------|---------|
| `lib/client/workspaceContext.tsx` | `onAuthStateChanged(auth, …)` | Identity; triggers workspace resolution and clears workspace listener on sign-out |
| `lib/state/sessionCountsStore.ts` | In-memory `Map` + `subscribeCounts(sessionId, cb)` | **Not Firestore** — pub/sub for count updates after API/Firestore feedback snapshots |
| `lib/store/billingStore.ts` | `useSyncExternalStore` internal subscribe | Local billing cache store |
| `components/CaptureWidget/TextFeedbackPanel.tsx` | Custom `subscribeEchlyRootTheme` | DOM/theme — not data layer |
| `echly-extension/src/auth.ts` | `subscribeToAuthState` (extension context) | Extension-only |

---

## Overlap and duplication analysis

### Duplicate listeners (same logical stream)

- **`workspaces/{id}`**: At most **one** Firestore `onSnapshot` per tab (`workspaceStore.ts`). Multiple UI surfaces (`UsageMeter`, `UpgradeModal`, `ProfileCommandPanel`, `useBillingUsage`) share it via retain count. **Not duplicated at Firestore level** unless multiple tabs/windows.

- **`sessions` list**: **One** `onSnapshot` from `WorkspaceOverviewProvider`. Dashboard + `GlobalSearch` consume context — **no second sessions listener** for those.

### Overlapping listeners (different queries, same collection)

- **`feedback`**: Session board uses a **broad** query (all feedback for one session). Discussion list uses **HTTP API**, not a second Firestore listener for the same session. **No overlap** with session page unless user opens two tabs.

- **`comments`**: **Exactly one** `useCommentsRepoSubscription` per mounted consumer. `SessionPageClient` uses `useFeedbackDetailController` (one selected ticket). `DiscussionThread` uses the hook for selected ticket. **`DiscussionPanel`** uses the same pattern but is **not mounted** on `/discussion` (page uses `DiscussionThread` only). If both panel and thread were ever mounted for the **same** `feedbackId`, you would get **two identical comment listeners** — currently avoided by route composition.

### Listener-per-item (N listeners)

- **Dashboard**: **Not** N listeners for sessions — single query.
- **Session board**: **One** feedback listener per open session page (not per ticket). **One** comments listener for **selected** ticket only — **O(1)** in N tickets while viewing one.
- **Insights**: **One** insights doc listener + **no** per-ticket realtime (only one-off `getDoc` for titles).

### High-risk areas for Phase 6.7

1. **`useSessionFeedbackPaginated`**: Subscribes to **all** feedback docs for a session with no `limit` — listener cost scales with ticket count.
2. **Counts refresh on every feedback snapshot**: Triggers **HTTP** `/api/feedback/counts` repeatedly (see `counts_system.md`) — not a duplicate Firestore listener but **paired fan-out** with the feedback listener.
3. **Orphan `DiscussionFeed.tsx`**: If wired into UI later without removing `DiscussionList`, could duplicate discussion data loading patterns (API vs Firestore).

---

## `usePublicSessionRealtime`

`components/share/usePublicSessionRealtime.ts` — **does not register Firestore listeners**; effect resets local state only. Public share is **not** realtime on the client today.
