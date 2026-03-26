# Sidebar lazy loading — deep audit

System-specific trace of the session sidebar ticket list: data sources, merge rules, pagination, viewport fill, and risks.  
Primary files: `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`, `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`, `components/layout/operating-system/TicketList.tsx`, `lib/realtime/feedbackStore.ts`, `app/api/feedback/route.ts`, `lib/server/cache/feedbackCache.ts`, `lib/client/requestCache.ts`, `lib/repositories/feedbackRepository.ts`.

---

## Section 1: Entry point trace

### Entry points that trigger sidebar data loading

| Entry | What it does |
|--------|----------------|
| **`SessionPageClient`** | Computes `feedbackSessionId` when `!authLoading && authUser && sessionId` and passes it into `useSessionFeedbackPaginated`. Renders `TicketList` with `items={feedback}` and wires `listScrollRef`, `listScrollReady`, `resolvedSectionExpanded`, deep-link hydrate (`/api/tickets/:id`), and extension event `ECHLY_FEEDBACK_CREATED` (local list mutation). |
| **`useSessionFeedbackPaginated`** | On `sessionId`: resets list state; optionally seeds counts from `sessionCountsStore`; calls `subscribeFeedbackSession(sessionId)` (Firestore `onSnapshot`); may call `fetchCountsDedup` → `GET /api/feedback/counts`. After the **first realtime snapshot** (loading finished), triggers **bootstrap** `GET /api/feedback` (open, first page). Subsequent loads use `loadMore` / viewport fill / scroll / intersection. |
| **`TicketList`** | Does **not** fetch. Assigns scroll container ref, calls `onScrollContainerReady` once (increments `listScrollReady` in parent), renders open/resolved sections, hosts `loadMoreRef` sentinel for `IntersectionObserver`. User expand of Resolved calls `onResolvedExpandedChange` → parent toggles `resolvedSectionExpanded` → hook fetches resolved pages. |

### 1. What triggers the FIRST data load?

1. **Firestore realtime subscription** starts as soon as `sessionId` is set in the hook’s `useEffect` (via `subscribeFeedbackSession`). The **first** `onSnapshot` completion (`loading: false`) is the gate for bootstrap.
2. **Bootstrap REST call**: On that first snapshot processing path, if `initialLoadDone` was false, the hook sets `initialLoadDone` / clears `initialLoading` and fires **one** `GET /api/feedback?...&status=open` (first page), unless `hasFetchedRef` already prevented it (it is set in that same path before the async IIFE).

**Counts** may load earlier or in parallel: if `getCounts(sessionId)` in `sessionCountsStore` is missing, `fetchCountsDedup` runs `GET /api/feedback/counts` (deduped per session in `countsRequestStore`).

### 2. State variables controlling initial fetch

- **`sessionId`** (argument): undefined until auth + `sessionId` route param → hook no-ops list loading.
- **`feedbackRealtime.loading`**: bootstrap block waits until false.
- **`hasFetchedRef`**: ensures bootstrap open-page REST runs at most once per bootstrap cycle.
- **`initialLoadDone` / `initialLoading`**: UI “session feedback loading” flag; flipped when bootstrap snapshot path runs.
- **`resolvedExpanded`**: **does not** affect initial open load; only gates resolved pagination and `hasMore` combination.

### 3. When the hook runs

The hook runs on every render of `SessionPageClient` while mounted. Effects re-run when `sessionId`, `resolvedExpanded`, `scrollReady`, or realtime store `version`/deps change. **`listScrollReady`** bumps when `TicketList` mounts and attaches the scroll container ref (`onScrollContainerReady`).

---

## Section 2: Initial load flow (critical)

### Step-by-step

1. **Realtime**: `subscribeFeedbackSession` registers `onSnapshot` on `feedback` collection: `sessionId ==`, `status in ["open", null]`, `orderBy(createdAt, desc)`, `limit(30)` (`REALTIME_LIMIT` in `lib/realtime/feedbackStore.ts`).
2. **First snapshot handler** in `useSessionFeedbackPaginated` (`realtimeBootstrapDoneRef` false):
   - If `realtimeItems.length > 0`, **`setCanonicalFeedback(realtimeItems)`** — list becomes up to **30** open tickets from Firestore (mapped client-side).
   - Marks bootstrap done; if first snapshot, sets `initialLoadDone`, `initialLoading(false)`, sets `hasFetchedRef`, then **async** `cachedFetch` + `authFetch` to open first API page.
3. **API (bootstrap)**: `GET /api/feedback?sessionId=…&cursor=&limit=30&status=open` (`PAGE_SIZE = 30` in hook). Server clamps limit to `min(requested, 50)` → **30** returned max per request.
4. **Merge**: `appendPage(incoming)` merges API rows into existing list **without overwriting existing ids** (skip if `byId.has(item.id)`).

### Parameters (first open page)

- **`status`**: `open`
- **`limit`**: `30` (client); server `safeLimit` = 30
- **`cursor`**: empty string in URL (`encodeURIComponent("")`); server treats as first page

### Realtime subscription timing

**Yes — active immediately** after `subscribeFeedbackSession(sessionId)` runs (same `sessionId` effect as counts). It is **not** waiting for REST to finish.

### Which source wins first render?

| Scenario | First list content | Then |
|----------|-------------------|------|
| Realtime returns **> 0** docs | **Realtime** (≤30, open/null status) | API open page **appends only new ids** |
| Realtime returns **0** docs | **Empty** until API returns | API fills via `appendPage` |
| Realtime errors | **Empty** (`items: []`, `loading: false`) | Same bootstrap API path |

**Server `feedbackCache`**: On first page, `GET /api/feedback` may return **cached JSON** (30s TTL) without hitting Firestore again — still “API” from the client’s perspective.

**Client `cachedFetch`**: Reuses in-flight or fresh JSON for identical URL within **10s** TTL — second identical request short-circuits.

### Exact numbers (requested vs rendered)

- **Requested (bootstrap open REST)**: **30** items max per call.
- **Realtime window**: **30** items max (`REALTIME_LIMIT`).
- **Rendered in sidebar**: `TicketList` splits `items` into `openItems` / `resolvedItems` via `getTicketStatus` (see Section 7). Initially **resolved section is collapsed** by default (`resolvedSectionExpanded` false in `SessionPageClient`), so **resolved rows in `items` still exist in state if present** but the **Resolved** section only maps `resolvedItems` when expanded. Normally bootstrap + realtime are **open-only**, so **up to ~30 open rows** visible under Open (deduped); after API merge, still capped by unique ids (overlap removed).

### Resolved items on initial load?

**Not via REST bootstrap** (only `status=open`). **Not via realtime listener** (query excludes resolved). **Exception**: deep link hydrate (`SessionPageClient` → `GET /api/tickets/:id`) can append a resolved ticket and expand resolved section.

---

## Section 3: Data sources breakdown

### A. Firestore realtime listener (`lib/realtime/feedbackStore.ts`)

| | |
|--|--|
| **When** | `subscribeFeedbackSession(sessionId)` from hook’s `sessionId` effect; no-op if already subscribed to same session. |
| **What it returns** | Module-level snapshot: `items` (≤30 open + `status == null`), `docChanges`, `loading`, `version`. |
| **Merge into UI** | **Bootstrap**: may replace canonical list with `realtimeItems` once. **Later**: applies `docChanges` — removes (unless item is resolved in memory), modifies in place, `unshift` adds. Then `setCanonicalFeedback` → **dedupe + sort** (`finalizeList`). |
| **Counts** | Debounced `fetchCountsDedup` (500ms) after changes with `docChanges.length > 0`. |

### B. API `GET /api/feedback` (`app/api/feedback/route.ts` + repo)

| | |
|--|--|
| **When** | Bootstrap open page; `loadMore` / `loadMoreOpenOnly` / `fetchResolvedPage` for pagination. |
| **What it returns** | `{ feedback, nextCursor, hasMore }`; minimal serialization (`createdAt` as ISO string, etc.). |
| **Merge** | `appendPage` only adds **new** ids; sorts whole list after. |
| **Server cache** | First page only: `getCachedFeedback(workspaceId, sessionId, listKind)` with `listKind` `open` \| `resolved` \| `all`; TTL 30s (`lib/server/cache/feedbackCache.ts`). |

### C. API `GET /api/feedback/counts`

| | |
|--|--|
| **When** | If in-memory `sessionCountsStore` has no entry for `sessionId`, `fetchCountsDedup` runs once (deduped). |
| **What it returns** | `{ total, open, resolved }` via `resolveSessionFeedbackCounts`. |
| **Merge** | `setStoreCounts` + `subscribeCounts` updates hook `counts` state — **header pills only**, not row data. |

### D. Client request cache (`lib/client/requestCache.ts` — `cachedFetch`)

| | |
|--|--|
| **When** | Every hook `authFetch` to list URLs goes through `cachedFetch(url, …)` default **TTL 10s**. |
| **What it returns** | Cloned `Response` with cached JSON. |
| **Merge** | No direct merge; reduces duplicate network for **same URL** (e.g. repeated first-page URL). |

### E. Deep link / ticket detail API (`SessionPageClient`)

- **`GET /api/tickets/:id`**: Merges single ticket into `feedback` via `setFeedback` if missing; may set `resolvedSectionExpanded` if resolved.

---

## Section 4: Merge + dedup logic

### Where items merge

- **`appendPage`** (`useSessionFeedbackPaginated.ts`): builds `Map` from `itemsRef.current`, skips `isDeleted === true`, skips existing `id`, then `finalizeList`.
- **`setCanonicalFeedback`**: applies updater then **`finalizeList`**.
- **`finalizeList`** → **`sortByCreatedAtDesc`** → **`dedupeFeedbackById`** then sort.

### Duplicates

1. **Prevention**: **By `id`** — `Map<string, Feedback>` / `byId.has(item.id)` in `appendPage`; `dedupeFeedbackById` keeps last occurrence in iteration order before sort.
2. **Bootstrap overlap**: If realtime already has an id, **API row for that id is skipped** — **realtime snapshot data wins** for that id until a later realtime modify or explicit client update.

### Sort order

- **After merge** (in hook): `dedupeFeedbackById` then sort by **createdAt descending** (`getTimestamp`), tie-break **`b.id.localeCompare(a.id)`**.
- **`TicketList`** applies **another** sort for display: `getTime(b) - getTime(a)` on a **copy** of `items`, then dedupe by id again.  
- **Risk**: `getTime` in `TicketList` uses `createdAt.seconds` or `clientTimestamp` — **API-minimal feedback uses ISO `createdAt` string**, which **`getTime` does not parse** → **0** timestamp → **order in UI can diverge from hook order** for REST-hydrated rows (instability / mismatch between hook and list).

---

## Section 5: Lazy loading mechanism

### What triggers `loadMore()`

`loadMore` is invoked from:

1. **Scroll listener** on `scrollContainerRef` (passive): when **not** the ignored first event, sets `hasUserScrolledRef`, then if near bottom (`scrollTop + clientHeight >= scrollHeight - 150`) and guards pass → `loadMore()`.
2. **`IntersectionObserver`** on `loadMoreRef` sentinel: `root` = scroll container, `rootMargin: "150px"`. **Requires `hasUserScrolledRef.current === true`** — **no IO-driven load until user has scrolled at least once** (and first scroll event only flips `ignoreFirstScrollEvent`, see Section 10).

**There is no public manual “Load more” button** — only scroll + IO (after scroll).

### Viewport-fill logic

- **`useEffect`** depends on `sessionId`, `initialLoadDone`, `scrollReady`.
- Schedules **`requestAnimationFrame`** → async **`run()`** with a **`while` loop**:
  - **`safetyCounter < 10`**
  - `openHasMore` true
  - `scrollHeight <= clientHeight + 2` (no scrollable overflow yet)
  - calls **`loadMoreOpenOnly`** → **`fetchOpenPage`** only (never resolved).

### Conditions for `loadMore` to fire (full function gate)

All required:

- `sessionId` truthy  
- `stateRef.current.initialLoadDone` true  
- `stateRef.current.loadingMore` false  
- `isFetchingRef.current` false  
- `stateRef.current.items.length < 200` (`FEEDBACK_LOAD_CAP`)  
- Either **`openHasMore`** OR **`resolvedExpanded && hasLoadedResolved && resolvedHasMore`**  
- Then: fetches **open** if `openHasMore`, else **resolved** page if second branch (exclusive `if / else if` — **open pages drain before resolved pages** in `loadMore`).

### Safety cap

- **`FEEDBACK_LOAD_CAP = 200`** total items in `items` stops further pagination.
- Viewport fill: **max 10** extra open-page fetches per effect run.

---

## Section 6: Viewport fill behavior

### Auto-load when no scroll?

**Yes** (open tickets only). After `initialLoadDone`, if the list content is shorter than the viewport (`scrollHeight <= clientHeight + 2`), the hook loops up to **10** times calling `loadMoreOpenOnly` / `fetchOpenPage`.

### What stops the loop?

- `openHasMore` false  
- Scroll becomes possible (`scrollHeight > clientHeight + 2`)  
- **10 iterations**  
- `sessionId` / effect cleanup (`cancelled`)  
- `items.length >= 200` inside `loadMoreOpenOnly` (returns early)

### If no auto-fill?

If `scrollReady` never increments (scroll ref not attached), viewport effect **does not run** (`!el` guard). `TicketList` sets ref and calls `onScrollContainerReady` once when the div mounts.

---

## Section 7: Open vs resolved logic

| Question | Answer |
|----------|--------|
| Fetched together? | **No.** Open: bootstrap + open pagination. Resolved: **separate** `status=resolved` requests after expand. |
| When resolved loads? | **`useEffect`** when `resolvedExpanded && !hasLoadedResolved` → `fetchResolvedPage(sessionId, null)` then `setHasLoadedResolved(true)`. |
| What controls `resolvedExpanded`? | `SessionPageClient` state `resolvedSectionExpanded`; `TicketList` calls `onResolvedExpandedChange` when user toggles Resolved section (controlled mode). |
| Before user clicks expand? | **No** resolved list fetch from the paginated hook. |

### Yes / no

- **Resolved loaded on initial render?** **No** (unless deep link forces expand + hydrate, or optimistic local state contains resolved tickets from other actions).  
- **Resolved loaded in background?** **No** — only when expanded (first page), then pagination when user scrolls / IO (after scroll) / `loadMore` when open exhausted.

### UI note

`TicketList` only **renders** `resolvedItems` when `resolvedExpanded` is true. Counts still show resolved **count** from server when counts loaded.

---

## Section 8: Pagination model

### Cursor system

- **Opaque string = Firestore document id** of the last item on the page (`nextCursor` from API). Repo loads `getDoc(feedback/{cursor})` and `startAfter` (`getSessionFeedbackPageForUserWithStringCursorRepo`).

### Separate cursors

- **`openCursor` / `openHasMore`** for `status=open`  
- **`resolvedCursor` / `resolvedHasMore`** for `status=resolved`  
Independent state in the hook.

### `hasMore` calculation (client)

After each page:

- Uses API `data.hasMore` combined with **loaded count vs server count**: e.g. `setOpenHasMore((data.hasMore ?? false) && newLoadedOpen < s.activeCount)` when `activeCount > 0`.

### Order of loading in `loadMore`

- **`wantOpen`** first; only if `!wantOpen` and **`wantResolved`** then resolved. So **open pages must finish** (`openHasMore` false) before **resolved** pagination via `loadMore`.

---

## Section 9: Cache system (`lib/server/cache/feedbackCache.ts`)

### Keys

- **`${workspaceId}:${sessionId}:open`**, **`…:resolved`**, **`…:all`** (`FeedbackListKind`).

### Read

- **`GET /api/feedback`** when `cursor` empty → `getCachedFeedback(..., listKind)`.

### Write

- After successful repo fetch for first page → `setCachedFeedback` with response body.

### Invalidate

- **`invalidateFeedbackCache(workspaceId, sessionId)`** deletes all three keys — used from feedback **create** path (`app/api/feedback/post.ts`) and repository paths (e.g. delete). **Not** necessarily on every PATCH (stale first-page risk for 30s TTL if invalidation missed).

### Stale data risk

- Server **30s** TTL on first page per list kind.  
- Client **10s** `cachedFetch` on identical URLs.  
- **Double layer** can serve aged open first page briefly after server cache expired but client cache still hot (same URL).

---

## Section 10: Edge cases

### 1. Deep link `?ticket=`

- `SessionPageClient`: After `feedbackLoading` false, if ticket id not in `feedback`, one **`GET /api/tickets/:id`**; merges into list; if resolved, **`setResolvedSectionExpanded(true)`**.  
- Separate effect selects ticket when it appears in `feedback`.  
- `TicketList`: `scrollToId` expands section containing id and `scrollIntoView` (once per mount via ref).

### 2. Tickets without `status` field

- **Realtime**: included (`status in ["open", null]`).  
- **Repo open page**: `status in ["open", null]` — included.  
- **`docToFeedback`**: `status` defaults to `"open"` for `isResolved` derivation.  
- **`getTicketStatus`**: uses **`isResolved` only** — missing `isResolved` → **open**.  
- **Counts fallback scan**: non-`resolved` status counts as **open**.

### 3. Duplicate tickets in UI

- **Same id**: prevented in hook and list `useMemo`.  
- **Logical duplicates** (different ids, same content): not deduped.

### 4. Realtime vs pagination

- Open listener **drops** tickets when they leave the query (e.g. become resolved). Hook **keeps** them in memory if `getTicketStatus(item) === "resolved"` (comment in hook).  
- New tickets: **added** to front via realtime `unshift` + sort.  
- **Pagination cursors** are independent of realtime; **counts** refresh debounced after changes — `hasMore` can be **temporarily inconsistent** with live adds/removes until counts refetch.

---

## Section 11: Performance risks

- **Double sort / timestamp mismatch**: Hook sorts with ISO-aware `getTimestamp`; `TicketList` re-sorts with `getTime` that **ignores ISO strings** → unnecessary work + possible **wrong visible order**.  
- **Bootstrap always**: First Firestore snapshot + first open API page even when realtime already delivered full window — **redundant network** when datasets overlap (mitigated by append skip-same-id, not by skipping the request).  
- **Client + server cache**: Can mask fresh data for **up to** client TTL + server TTL windows on repeated first-page URL.  
- **Scroll listener**: First scroll **does not** load or set `hasUserScrolledRef` — one wasted scroll; IO **never** fires load until `hasUserScrolledRef` true.  
- **Viewport `while` loop**: Up to **10** sequential open fetches; each awaits `fetchOpenPage` — can burst requests on short sessions.  
- **`isFetchingRef` shared** between viewport fill, `loadMore`, scroll, and IO — generally avoids parallel fetches but can serialize unrelated waits.  
- **Counts vs list**: `hasMore` uses `activeCount`/`resolvedCount` from store; **drift** if counts stale vs Firestore.  
- **No infinite loop** in viewport: hard cap **10**; `loadMore` gated by `hasMore` and **200** cap.

---

## Section 12: Final summary

1. **Total items loaded on first render (typical)**  
   - **List state**: Up to **30** from realtime if any open docs; then **+ up to 30** from API open page for **new** ids only (often **0** net new if identical).  
   - **REST request size**: **30** per bootstrap open call.  
   - **Visible rows**: Open section shows **open** subset of `items` (up to ~30 initially unless empty session).

2. **System type**  
   - **Hybrid**: **viewport-based auto-fill** (open only, capped) + **scroll-based** near-bottom + **intersection observer** (after first user scroll).

3. **Resolved system**  
   - **Lazy**: first page only when section expanded; further pages via same hybrid loaders once open queue exhausted in `loadMore`.

4. **Top 3 risks**  
   - **TicketList vs hook sort mismatch** (ISO `createdAt` → wrong ordering / extra resort).  
   - **Stale first-page caches** (server 30s + client 10s + incomplete invalidation on updates).  
   - **IO disabled until scroll** + **first scroll ignored** → **lazy load may not trigger** until second scroll near bottom in some layouts.

---

*Audit is read-only; no code was modified.*
