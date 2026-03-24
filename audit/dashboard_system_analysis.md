# Dashboard System Analysis

Forensic documentation of **session feedback** flows on the dashboard: data ownership, pagination, merges, caches, realtime interaction, failure modes, and stale-data risks. Evidence is tied to the current codebase (read-only analysis; no recommendations).

**Scope note:** `app/(app)/dashboard/page.tsx` and `sessions/page.tsx` drive workspace/session lists via `useWorkspaceOverview` and Firestore; they do **not** use `useSessionFeedbackPaginated`. The **ticket list + infinite scroll** behavior lives under `app/(app)/dashboard/[sessionId]/` (notably `SessionPageClient.tsx` and `useSessionFeedbackPaginated.ts`).

---

## Data Ownership

### Canonical list: `items[]`

- **Storage:** React state `items` inside `useSessionFeedbackPaginated` (`useState<Feedback[]>([])`), mirrored in `itemsRef` for async-safe reads.
- **Owner:** The hook `useSessionFeedbackPaginated` owns the canonical array. It exposes it as `feedback` in the return object and exposes mutation only via `setFeedback`, which is bound to `setCanonicalFeedback` (dedupe + sort; see Merge Points).
- **Consumers:** `SessionPageClient` reads `feedback` and passes `items={feedback}` to `TicketList` (desktop sidebar and mobile sheet). Detail panel, execution mode, and optimistic PATCH flows all read/update the same `feedback` reference.

### Who mutates `items`

| Source | Mechanism |
|--------|-----------|
| Hook internals | `setCanonicalFeedback`, `mergeRealtimeIntoCanonical`, `appendPaginationIntoCanonical`, direct `setItems` on session/no-session reset |
| Realtime | `mergeRealtimeIntoCanonical(realtimeItems)` on each non-loading snapshot for the active session |
| REST pagination | `appendPaginationIntoCanonical` inside `loadMore` and API “seed” after first realtime snapshot |
| `SessionPageClient` | `setFeedback(...)` for extension event, title/steps/tags/resolve/skip/bulk/mark-all/delete — all go through `setCanonicalFeedback` |
| Session lifecycle | `useLayoutEffect` on `sessionId` clears list; effect when `!sessionId` clears list |

### Counts (`total`, open/resolved/skipped)

- **Not** derived from loaded list length for display semantics (see `TicketList` meta comment: total must not come from lazy-loaded length).
- **Source:** `sessionCountsStore` (module-level `Map`), populated by `fetchCountsDedup` → `GET /api/feedback/counts`, and updated via `subscribeCounts`. If `getCounts(sessionId)` hits on mount, counts hydrate immediately without waiting for the network round-trip.
- **SessionPageClient** also calls `updateCachedCounts` / `setCachedCounts` for optimistic UI after local actions (resolve, skip, extension-created ticket, mark-all, delete).

### Server / DB

- **Not** the owner of React state. `lib/repositories/feedbackRepository.ts` is used by API routes; the browser talks to **`GET /api/feedback`** and **`GET /api/feedback/counts`**, not the repo directly from these components.

---

## Pagination Flow

### Step-by-step: user scroll → load more → render

1. **Mount:** For a defined `sessionId`, `subscribeFeedbackSession(sessionId)` starts a Firestore `onSnapshot` (see `lib/realtime/feedbackStore.ts`). The hook’s effect on realtime waits until `feedbackRealtime.loading` is false, then calls `mergeRealtimeIntoCanonical(snapshotList)`, then flips `initialLoadDone` / clears `initialLoading`, and kicks off **one** async `GET /api/feedback?sessionId=…&cursor=&limit=20` to seed pagination state and append API rows (deduped with existing canonical rows).

2. **Scroll container:** `SessionPageClient` passes `listScrollRef` to `TicketList` as `scrollContainerRef`. `TicketList` assigns the scrollable `<div>` to that ref in a callback ref and calls `onScrollContainerReady` once, which increments `listScrollReady` in the parent so effects in the hook re-run and attach listeners.

3. **Scroll listener:** On the scroll container, `scroll` (passive) runs `loadMore()` when the user has scrolled such that `scrollTop + clientHeight >= scrollHeight - 150`, subject to locks and caps. The **first** scroll event after attach is ignored (`ignoreFirstScrollEvent`) so synthetic scroll does not auto-load.

4. **IntersectionObserver:** A sentinel `div` at the bottom (`loadMoreRef`) is observed with `root: scrollEl` and `rootMargin: "150px"`. It only triggers `loadMore()` if `hasUserScrolledRef.current` is true (user actually scrolled first).

5. **`loadMore`:** Builds URL `/api/feedback?sessionId=…&cursor=<cursor>&limit=20`, uses `cachedFetch(url, () => authFetch(url))` (client cache). Parses JSON, ignores response if `sessionIdRef` changed mid-flight, then `appendPaginationIntoCanonical(incoming)`, updates `cursor` from `data.nextCursor` or last item id fallback, updates `hasMore` using `total` from counts when API does not send `total` (the route does not include `total` in JSON).

6. **Render:** `feedback` updates → `TicketList` partitions into open/skipped/resolved sections (local sort by time again) and renders rows; loading indicators use `missing*` counts vs server counts from props.

### Where `cursor` is stored

- React state: `const [cursor, setCursor] = useState<string | null>(null)` in `useSessionFeedbackPaginated.ts`.
- Semantics: **opaque document id** for the last document of the current page; the API passes it to `getSessionFeedbackPageForUserWithStringCursorRepo`, which loads that doc and `startAfter` for the next page (`lib/repositories/feedbackRepository.ts`).

### Where `hasMore` is stored

- React state: `const [hasMore, setHasMore] = useState(true)`.
- Updated by: initial API seed (`setHasMore(data.hasMore ?? false)`), each `loadMore` completion (compares loaded length to `total` from counts when `total > 0`, else uses API `hasMore`), API seed failure (`setHasMore(false)`), `refetchFirstPage` edge cases, and session reset (`setHasMore(true)` on new session).

### Fetch lock

- `isFetchingRef` prevents overlapping fetches; `loadingMore` state mirrors UX. `stateRef` holds a snapshot of items/total/cursor/hasMore/loadingMore/initialLoadDone for callbacks that must not close over stale closures.

### Hard caps

- `PAGE_SIZE = 20`, client `FEEDBACK_LOAD_CAP = 200` stops further loads.

---

## Merge Points

All merges ultimately funnel into **deduplication by `id`** plus **global sort** by `getTimestamp` descending (tie-break `id`), except where noted.

| Location | Pattern | Role |
|----------|---------|------|
| `useSessionFeedbackPaginated.ts` — `setCanonicalFeedback` | `Map` by id → `sortByCreatedAtDesc` → `setItems` | Any `setFeedback` updater from components |
| `useSessionFeedbackPaginated.ts` — `mergeRealtimeIntoCanonical` | For each realtime item, replace map entry if reference changed; then sort | Realtime snapshot → canonical list |
| `useSessionFeedbackPaginated.ts` — `appendPaginationIntoCanonical` | Skip ids already present; append new; sort | Pagination + API seed |
| `useSessionFeedbackPaginated.ts` — `refetchFirstPage` | Uses `appendPaginationIntoCanonical` for non-empty API response; does **not** clear list first | “Refetch” merges first page into existing ids |
| `SessionPageClient.tsx` — `ECHLY_FEEDBACK_CREATED` | `setFeedback((prev) => [newItem, ...prev])` | Optimistic insert; normalized by `setCanonicalFeedback` |
| `SessionPageClient.tsx` — PATCH handlers | `setFeedback((prev) => prev.map(...))` | Per-field updates; still through `setCanonicalFeedback` |
| `components/layout/operating-system/TicketList.tsx` | `[...items].sort` by local `getTime` for **display** only | UI grouping into open/skipped/resolved |

There is **no** raw `setItems(prev => [...prev, ...])` except inside the canonical helpers (which use `Map` + sort, not blind concat).

---

## Cache Layers

| Layer | What is stored | Lifetime / invalidation | When it updates |
|-------|----------------|-------------------------|-----------------|
| **React state** (`items`, `cursor`, `hasMore`, loading flags) | Canonical feedback rows and pagination state | Until `sessionId` changes, unmount, or `!sessionId` branch | Merges, appends, resets |
| **`itemsRef` / `stateRef` / `sessionIdRef`** | Mirrors of latest items, composite state, current session | Same as component | Sync effects and writers |
| **`sessionCountsStore`** (`lib/state/sessionCountsStore.ts`) | Per-session `Counts` map | In-memory for app session | `setCounts` from fetch, `subscribeCounts`, optimistic `updateCounts` from `SessionPageClient` |
| **`countsRequestStore`** (via `fetchCountsDedup`) | In-flight deduped promise per session | Cleared when request completes | One `/api/feedback/counts` per session burst |
| **`lib/client/requestCache.ts` — `cachedFetch`** | Parsed JSON + response metadata per **full URL string** | Default TTL **10s** | Each distinct `cursor` is a distinct key; in-flight coalescing |
| **`lib/server/cache/feedbackCache.ts`** | First page only: `{ feedback, nextCursor, hasMore }` keyed `workspaceId:sessionId` | **30s** TTL | **Only** `GET /api/feedback` when `cursor` is empty (`app/api/feedback/route.ts`); invalidated via `invalidateFeedbackCache` elsewhere in codebase (not re-traced here) |
| **`lib/realtime/feedbackStore.ts`** | Global snapshot: `sessionId`, `items` (max **30** docs), `loading`, `error`, `version` | Lives for SPA session; subscription replaced when `subscribeFeedbackSession` is called for a new session | Firestore `onSnapshot` |

**API shape:** `GET /api/feedback` returns **`serializeFeedbackMinimal`** (subset of fields), not full `Feedback` — client still types as `Feedback`.

---

## Realtime vs Pagination

### How realtime affects `items[]`

- On every completed realtime snapshot for the active session, `mergeRealtimeIntoCanonical(snapshotList)` runs.
- Realtime query: `where sessionId`, `orderBy createdAt desc`, `limit(30)` (`feedbackStore.ts`).
- Pagination query (API): same workspace+session filters in repo, `orderBy createdAt desc`, page size from request (`getSessionFeedbackPageForUserWithStringCursorRepo`).

### Does realtime merge into the paginated list?

- **Yes.** The same canonical `items` array holds both: realtime rows are merged by id; pagination **appends** additional ids not yet present. Order is **always** the hook’s `sortByCreatedAtDesc` (timestamp + id), not Firestore’s raw doc order beyond what those timestamps imply.

### Conflicts / tension

- **Window size:** Realtime only delivers up to **30** newest docs; older docs appear only via REST pagination. No conflict for “newest” if ids match; duplicates are skipped on append.
- **Reference equality in merge:** `mergeRealtimeIntoCanonical` treats `existing !== item` as an update. New snapshot instances typically replace prior rows for changed docs.
- **Strict mode:** With `ECHLY_STRICT_MODE`, if both `realtimeItems` and API `apiItems` are non-empty, a console warning is emitted (`guardMultipleSources`) — expected “during hydration” per comment.
- **Counts vs loaded sections:** `TicketList` compares server counts to **loaded** counts per status to show “Loading more” in a section; this is a **UI** inference, not a second list store.

---

## Failure Handling

| Scenario | Observed behavior |
|----------|-------------------|
| **`GET /api/feedback` fails during initial seed** (after realtime ready) | `catch` sets `hasMore(false)`, `cursor(null)`. Comment: “realtime list still works; pagination will remain unavailable.” No dedicated error state in hook. |
| **`loadMore` throws** (network/parse) | `try/finally` only — **no `catch`**. Promise rejects; `finally` clears `isFetchingRef` and `loadingMore`. No `hasMore` rollback; user sees no inline error. |
| **Response after session switch** | `sessionIdRef.current !== startedSessionId` → return early; state not updated. |
| **Realtime `onSnapshot` error** | `feedbackStore` sets `items: []`, `error` message, `loading: false`. Merge runs with empty list; initial path may still run API seed. |
| **`fetchCountsDedup` throws** | `countsLoading` may stay true depending on branch; `setCountsLoading(false)` in catch of the session effect only when `!cancelled`. |
| **401/500 from API** | Client still `res.json()` in `cachedFetch`; business logic may not check `res.ok` in hook (not verified for non-2xx bodies). |

**Classification:** Mix of **recover** (session switch ignores stale responses), **silent fail** (pagination errors, failed seed disables pagination without banner), and **degrade** (realtime-only list if API seed fails).

---

## Stale Data Risks

| Risk | Where |
|------|--------|
| **Server 30s first-page cache** | `feedbackCache.ts` + `route.ts` — first page can be stale vs Firestore until TTL or invalidation. |
| **Client 10s `cachedFetch`** | Repeated identical URLs (same session + cursor) return cached JSON. |
| **Counts vs list** | Counts from session doc / `resolveSessionFeedbackCounts`; list from realtime + paginated API — can diverge briefly during concurrent changes or optimistic updates. |
| **Optimistic `SessionPageClient` updates** | Local ticket rows and `sessionCountsStore` can disagree with server until PATCH completes or rolls back. |
| **`refetchFirstPage`** | Not used in `SessionPageClient`; if used elsewhere, implementation **appends** first-page ids rather than replacing the list — stale rows not in the first page remain. |
| **Minimal API payload** | List rows may omit fields present only on full fetches or Firestore; UI merges PATCH responses for edited fields. |
| **`TicketList` display sort** | Re-sorts by `getTime` (seconds / `clientTimestamp`) — slight mismatch possible vs hook’s `getTimestamp` for edge cases (e.g. string `createdAt` vs Timestamp). |

---

## State Flow Map

```
Firestore
  ├─ onSnapshot (feedbackStore) ──► mergeRealtimeIntoCanonical ──► items (React)
  └─ (via API) getSessionFeedbackPageForUserWithStringCursorRepo
        ▲
        │ GET /api/feedback?sessionId&cursor&limit
        │   ├─ [first page] server cache (30s) optional
        │   └─ serializeFeedbackMinimal
        │
        └── cachedFetch (client 10s) ──► appendPaginationIntoCanonical / seed ──► items

GET /api/feedback/counts ──► fetchCountsDedup ──► sessionCountsStore ──► hook state + subscribeCounts
                                                      ▲
SessionPageClient optimistic updates ─────────────────┘

SessionPageClient
  ├─ setFeedback / PATCH / events ──► setCanonicalFeedback ──► items
  └─ TicketList(items=feedback) ──► local partition + display sort ──► UI sections
```

**Transformations:** Serialization on server (`serializeFeedbackMinimal`); deserialization as `Feedback` on client; canonical dedupe+sort in hook; optional local re-sort in `TicketList`.

**Mutations:** Hook merge/append/setCanonical; `SessionPageClient` event and PATCH paths; Firestore listener updates store only (merge into React state happens in hook).

---

## Overall Architecture Assessment

**COMPLEX**

Multiple coordinated sources (realtime window, paginated REST, in-memory counts, dual HTTP caches, optimistic UI), explicit refs for concurrency and session changes, and presentation-layer splitting in `TicketList` — consistent with a deliberately layered design rather than a single linear data path.
