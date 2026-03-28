# Phase 6.7 — Firestore usage audit (client + notable server paths)

## Client initialization

| File | Behavior |
|------|----------|
| `lib/firebase.ts` | `getFirestore(app)` — **default** persistence (browser cache) applies; no explicit `initializeFirestore` with `persistentLocalCache` in this file |
| `lib/firebaseClient.ts` | Re-exports `db` from `lib/firebase.ts` — **same** Firestore instance; import path alias only |

**Implication**: Cache leverage is SDK-default; no explicit `getDocFromServer` on hot paths except identity resolution (below).

---

## `getDocs` (one-shot queries, client)

| Location | Collection / pattern |
|----------|----------------------|
| `lib/repositories/feedbackRepository.ts` | Paginated session feedback, `getSessionFeedbackByResolvedRepo`, workspace variants, etc. |
| `lib/repositories/sessionsRepository.ts` | Workspace session lists |
| `lib/repositories/commentsRepository.ts` | Recent session comments; insights comments (bounded) |
| `components/discussion/DiscussionFeed.tsx` | `feedback` with `commentCount > 0`, limit 100 (**unused in routes**) |

---

## `getDoc` / `getDocFromServer` (client)

| Location | Usage |
|----------|-------|
| `lib/client/workspaceContext.tsx` | `getDoc(users/{uid})` fast path for `workspaceId` |
| `lib/repositories/usersRepository.ts` | `getUserWorkspaceIdRepo`: **`getDocFromServer` first**, fallback `getDoc` — **forced server read** when server path succeeds |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `getDoc(sessions/{sessionId})` for session header/meta |
| `lib/repositories/feedbackRepository.ts` | Cursor resolution: `getDoc(feedback/{cursorId})`; `getFeedbackByIdsRepo`: **N parallel `getDoc`** |
| `insights/page.tsx` | `getDoc(sessions/{id})` for title map |
| `DiscussionFeed.tsx` | Chunked `getDoc(sessions/{id})` after feedback query (**unused component**) |

---

## `onSnapshot` (client)

See `audit/listener_topology.md` for full table. Summary:

- `sessions` (dashboard)
- `feedback` per session (session board)
- Workspace `insights` doc
- `workspaces/{id}` (singleton store)
- `comments` per selected ticket

---

## `getCountFromServer` (client)

| Location | Purpose |
|----------|---------|
| `lib/repositories/sessionsRepository.ts` | `getWorkspaceSessionCountRepo` fallback when workspace counters missing |
| `lib/repositories/feedbackRepository.ts` | Internal aggregate helpers (see repo ~338+) |

---

## Server / Admin SDK (API routes, scripts)

| Area | Pattern |
|------|---------|
| `app/api/feedback/counts/route.ts` | `sessionRef.get()` then possibly `resolveSessionFeedbackCounts` → **collection `.get()` scan** on inconsistency |
| `app/api/public/share/[token]/route.ts` | Admin reads session + feedback for share |
| `lib/repositories/*.server.ts` | Standard Admin `get`, `query.get`, transactions |
| Scripts under `scripts/` | Bulk `getDocs`, `getCountFromServer`, backfills |

---

## Forced server reads vs cache

| Call | Forced server? |
|------|----------------|
| `getDocFromServer` in `getUserWorkspaceIdRepo` | **Yes** (primary attempt) |
| Typical `getDoc` / `getDocs` / `onSnapshot` | Uses client cache + backend rules per SDK semantics |
| HTTP `authFetch` with `cache: "no-store"` | **Bypasses browser HTTP cache** for that request (not Firestore) |

---

## Re-fetch loops / churn risks

1. **Feedback `onSnapshot` + counts**: Every snapshot schedules `fetchCountsDedup` → network + Admin session read — can feel like a loop under heavy realtime writes.
2. **Workspace store + `useBillingUsage`**: Every workspace doc change after first snapshot schedules idle invalidation + billing refetch — intentional but increases API load on frequent workspace updates.
3. **Dashboard `hydrateCountsForSessionIds`**: Runs on every sessions snapshot; parallel counts burst.

---

## Missing cache leverage (observations)

- No broad use of `persistentLocalCache` tuning in repo — relying on defaults.
- **`firebase.ts` vs `firebaseClient.ts`**: Same underlying `db` — no split cache from dual init.
