# Dashboard Dead Code Analysis

Forensic analysis only: **no code was modified**. Conclusions follow static analysis, import tracing, and execution-path reasoning for the scoped files.

---

## Active Execution Flow

### User opens main dashboard (`app/(app)/dashboard/page.tsx`, `sessions/page.tsx`)

- **Runs:** `useWorkspaceOverview` → `authFetch("/api/sessions")` → per-session `fetchCountsDedup` / `sessionCountsStore` (`getCounts` / `setCounts`).
- **Does not run:** `useSessionFeedbackPaginated`, `SessionPageClient`, `subscribeFeedbackSession`, `feedbackStore` realtime, `GET /api/feedback` for a session list, `lib/server/cache/feedbackCache`.
- **Branches:** Normal path is session list + counts; no ticket-level infinite scroll on these routes.

### User opens a session (`/dashboard/[sessionId]` → `SessionPageClient.tsx`)

1. **Auth / session doc**
   - **Runs:** `useAuthGuard`, Firestore `getDoc(sessions/{sessionId})` for title/ownership; `recordSessionViewIfNew` when applicable.
   - **Does not run:** Feedback list until `feedbackSessionId` is defined (`!authLoading && authUser && sessionId`).

2. **Initial load (ticket list + counts)**
   - **Runs:** `useSessionFeedbackPaginated(feedbackSessionId, listScrollRef, listScrollReady, onNewTicketFromRealtime)`.
   - On `sessionId` present: `useLayoutEffect` clears list/cursor/scroll flags; `useEffect` loads counts (`getCounts` → fast path **or** `fetchCountsDedup` → `setStoreCounts`), `subscribeFeedbackSession(sessionId)` → `onSnapshot` in `feedbackStore.ts` (limit **30**, `orderBy createdAt desc)`).
   - `subscribeCounts(sessionId, …)` keeps hook `counts` state aligned with `sessionCountsStore`.
   - When realtime snapshot finishes loading (`feedbackRealtime.loading === false`): `mergeRealtimeIntoCanonical(realtimeItems)` updates `items`; on **first** completed snapshot, `initialLoadDone` / `initialLoading` flip and **one** API seed runs: `GET /api/feedback?sessionId=…&cursor=&limit=20` via `cachedFetch` → `appendPaginationIntoCanonical` for extra rows not deduped, `setCursor` / `setHasMore` from response.
   - **Does not run (on happy path):** `refetchFirstPage` (never called from `SessionPageClient`; see Dead Code). `clearFeedbackSubscription` is never invoked anywhere in the repo.

3. **Scroll / “load more”**
   - **Runs:** Scroll listener on `listScrollRef` (threshold ~150px from bottom) calls `loadMore` after the first non-ignored scroll event (`hasUserScrolledRef`). Separate **IntersectionObserver** on `loadMoreRef` + `root: scrollEl` also calls `loadMore`, but **only if** `hasUserScrolledRef.current` is true.
   - **Does not run until user scrolls:** Sentinel path (observer) without prior user scroll (guards against auto-load on paint).
   - **Branches rarely reached:** `loadMore` early-exits when `!initialLoadDone`, `loadingMore` / `isFetchingRef`, cap `FEEDBACK_LOAD_CAP`, `loadedCount >= total` when `total > 0`, or `!hasMore`.

4. **Realtime after first paint**
   - **Runs:** Every snapshot: `mergeRealtimeIntoCanonical` (reference-inequality per id → replace + sort). If snapshot length increases vs `previousFeedbackCountRef`, `onNewTicketFromRealtime` → `SessionPageClient` sets selection + highlight.
   - **Pagination vs realtime:** Pagination **appends** older pages; realtime **merges** the newest window (up to 30 docs). They overlap by id; `appendPaginationIntoCanonical` skips existing ids. Neither path “wins” globally—they compose.

5. **Edits (optimistic + server)**
   - **Runs:** `setFeedback` → `setCanonicalFeedback` (dedupe by id + sort) for title/action steps/tags/resolve/skip/mark-all/delete, plus `ECHLY_FEEDBACK_CREATED` custom event (extension) inserting a row with `clientTimestamp`. Counts adjusted via `sessionCountsStore` (`ensureCountsSeeded`, `updateCachedCounts`, etc.).
   - **Does not run:** No call chain from these flows to `refetchFirstPage`.

---

## Dead Code

| Location | Reason |
|----------|--------|
| **`useSessionFeedbackPaginated` → `refetchFirstPage`** | Implemented and returned from the hook; **no importer calls it** (only consumer is `SessionPageClient`, which does not destructure or invoke it). |
| **`useSessionFeedbackPaginated` → `fetchNextPage`** | Alias of `loadMore`; **not passed or called** by `SessionPageClient`. Loading is driven by internal `loadMore` from scroll + observer only. |
| **`feedbackStore.ts` → `clearFeedbackSubscription`** | **No references** in the codebase (grep). Subscription is created by `subscribeFeedbackSession`; nothing tears down via this API on navigation. |
| **`SessionPageClient.tsx` → `{false && <SessionPremiumLoader />}`** | Condition is **always false**; component never mounts. |
| **`app/(app)/dashboard/hooks/useCommandCenterData.ts`** | **No `import` of `useCommandCenterData` anywhere** in `.ts`/`.tsx` files. The hook is an orphan under `dashboard/hooks`. (Related presentation components in `components/dashboard/` that mention it in comments are also unused by imports.) |

---

## Shadow Logic

| Location | Explanation |
|----------|-------------|
| **`useSessionFeedbackPaginated` `loadMore` JSON typing** | Parses `total`, `activeCount`, `resolvedCount` on the **session-scoped** `GET /api/feedback` response. **`app/api/feedback/route.ts` only returns `feedback`, `nextCursor`, `hasMore`** for that path—no `total` / per-status counts. So `typeof data.total === "number"` is effectively **never true** from the live API; `serverTotal` always falls through to `s.total` from **counts state**, not from the pagination response. |
| **`feedbackStore` snapshot `error`** | Set on snapshot failure, but **`useSessionFeedbackPaginated` never reads `feedbackRealtime.error`**. Loading gate uses `feedbackRealtime.loading` only. Error state is **not surfaced** to the session UI. |
| **`mergeRealtimeIntoCanonical` change detection** | Uses **reference inequality** (`existing !== item`). Firestore `onSnapshot` typically yields **new object references** per tick, so `changed` is often true even when data is unchanged; the branch is “active” but **not a reliable dedupe** for semantic equality (behavioral shadow vs intent to skip no-op updates). |
| **`getTimestamp` “legacy” `createdAt.seconds` branch** | Defensive for older shapes; **may be rare** if API + Firestore always supply ISO or `Timestamp`. Still reachable if malformed/legacy docs exist. |

---

## Active Mutation Paths (`items` / canonical feedback list)

| Path | Mechanism | Active? | Redundant? |
|------|-----------|---------|------------|
| **Realtime merge** | `mergeRealtimeIntoCanonical` | **Yes** | No—drives newest window and keeps fields updated from Firestore. |
| **Pagination API** | `appendPaginationIntoCanonical` in `loadMore` + first-page seed after first realtime snapshot | **Yes** | No—loads beyond realtime limit and fills when realtime is partial. |
| **Optimistic + PATCH** | `setFeedback` / `setCanonicalFeedback` from `SessionPageClient` | **Yes** | No—immediate UI; server PATCH reconciles. |
| **Extension create event** | `ECHLY_FEEDBACK_CREATED` → `setFeedback` prepend | **Yes** | No—local-first path before realtime catches up. |
| **Refetch** | `refetchFirstPage` | **No** (not invoked) | N/A—would merge first page only if something called it. |

**Collision note:** Scroll listener and IntersectionObserver **both** call `loadMore`; overlap is **intentional redundancy** with `isFetchingRef` / `loadingMore` locks, not duplicate competing sources of truth.

---

## Cache Utilization

| Layer | Hit / bypass |
|-------|----------------|
| **`lib/server/cache/feedbackCache.ts`** | Used only in **`GET /api/feedback`** when **`cursor` is empty** (`isFirstPage`). **Hit** returns cached JSON; **miss** runs `getSessionFeedbackPageForUserWithStringCursorRepo` then **SET**. Invalidated on feedback create (`invalidateFeedbackCache` in `post.ts`), not on every PATCH. |
| **`lib/client/requestCache.ts` `cachedFetch`** | **10s TTL** per URL key; dedupes in-flight identical requests. Session list uses distinct URLs per `cursor`, so first page and subsequent pages cache separately; **first page** can **hit** within TTL on repeat navigation. |
| **`sessionCountsStore` + `fetchCountsDedup`** | **Hit** when counts already in memory (e.g. visited session from workspace load); **miss** fetches `/api/feedback/counts`. |
| **`useWorkspaceOverview` sessionStorage / localStorage** | **Hits** for session list / skeleton counts where implemented; separate from ticket list. |

Nothing in this trace shows server `feedbackCache` being **bypassed** incorrectly—it is **skipped** for `cursor !== ""` by design (pagination requests always miss that branch and go to Firestore).

---

## Realtime Usage

- **Drives UI:** Yes—the canonical list is **merged from** `useFeedbackRealtimeStore()` on every snapshot after loading clears.
- **Overridden by pagination:** No—pagination **adds** rows; it does not replace realtime. Ordering is unified via `sortByCreatedAtDesc`.
- **Partial:** Yes by design—realtime query is **limited (30)**; older items exist only via **pagination API**. Counts come from **`/api/feedback/counts`** + store, not from realtime doc count.

---

## Unused Complexity

Safe to treat as **unused from current product wiring** (not asserting runtime deletion without tests):

- **`refetchFirstPage` + external `fetchNextPage` export surface** if no other entry points exist (verified: `SessionPageClient` only).
- **`clearFeedbackSubscription`** until a navigation/unmount path calls it.
- **`useCommandCenterData`** until a page imports it.
- **Dead JSX branch** `false && SessionPremiumLoader`.
- **API response typings** in `loadMore` that imply `total` from list endpoint—misaligned with actual `route.ts` payload (shadow, not a second live source).

---

## Final Assessment

**MIXED (some dead/shadow code)**

- **Justified complexity:** Realtime window + cursor pagination + shared canonical merge + counts from a separate API are **coherent** and **used** on the session dashboard path.
- **Artificial / leftover surface:** Unused hook exports (`refetchFirstPage` / `fetchNextPage` from the consumer’s perspective), unused `clearFeedbackSubscription`, orphan `useCommandCenterData`, dead `SessionPremiumLoader` branch, and **type/shape assumptions** on pagination JSON that the API does not return (`total` on list response) add **noise** without changing the dominant runtime story.

---

## Part 7 — Unused Complexity Score (approximate)

| Metric | Estimate | Basis |
|--------|----------|--------|
| **Dead or unreachable in scoped session-list stack** | **~5–10%** | `refetchFirstPage` block + unused hook exports + `clearFeedbackSubscription` + dead JSX line, relative to `useSessionFeedbackPaginated` + `feedbackStore` + `SessionPageClient` list-related code. |
| **Shadow / misleading branches** | **~3–5%** | List-response `data.total` branch, unused `error` in store for UI, optional legacy `createdAt` branch frequency unknown. |
| **Mutation paths actually used** | **4 / 5** | Realtime, pagination, optimistic/PATCH, extension event **active**; **refetch path inactive** (no caller). **80%** of named paths, or **100%** of paths that are actually invoked. |

**Interpretation:** Complexity is **mostly real** for the session ticket experience; a **meaningful but not dominant** slice is **dead or shadow** (exports never called, API shape mismatch, error bit unused).
