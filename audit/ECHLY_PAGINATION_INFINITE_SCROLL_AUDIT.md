# ECHLY PAGINATION + INFINITE SCROLL DEEP AUDIT REPORT

**Audit type:** System forensic audit (NO FIXES — FULL TRACE)  
**Scope:** Pagination system, limit consistency, cursor flow, infinite scroll, state management  
**Codebase:** Echly (production-grade)

---

## 1. LIMIT SOURCES

Structured list of every limit-related usage in source (excluding `.next` and extension bundled assets).

| FILE | LINE | CODE | PURPOSE | VALUE |
|------|------|------|---------|--------|
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | 11 | `const PAGE_SIZE = 25;` | Session feedback list page size (dashboard) | 25 |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | 168 | `&limit=${PAGE_SIZE}` | Load-more request | 25 |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | 320 | `&limit=${PAGE_SIZE}` | Initial API seed (first page) | 25 |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | 364 | `&limit=${PAGE_SIZE}` | refetchFirstPage | 25 |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | 296 | `limit(REALTIME_LIMIT)` | Firestore realtime window cap | 30 (REALTIME_LIMIT) |
| `lib/repositories/feedbackRepository.ts` | 343 | `const FEEDBACK_PAGE_SIZE_DEFAULT = 20;` | Default when `opts.limit` not passed in getSessionFeedbackPageRepo | 20 |
| `lib/repositories/feedbackRepository.ts` | 399 | `const pageSize = opts.limit ?? FEEDBACK_PAGE_SIZE_DEFAULT;` | getSessionFeedbackPageRepo page size | 20 default / dynamic |
| `lib/repositories/feedbackRepository.ts` | 419 | `limit(pageSize + 1)` | Fetch N+1 to detect hasMore (status-based repo) | dynamic |
| `lib/repositories/feedbackRepository.ts` | 482 | `limit: pageSize` (from args) | getSessionFeedbackPageForUserWithStringCursorRepo | from API |
| `lib/repositories/feedbackRepository.ts` | 501 | `limit(pageSize)` | Firestore query in user-scoped repo | from API |
| `app/api/feedback/route.ts` | 167–168 | `const limit = Number(searchParams.get("limit")) \|\| 25;` / `safeLimit = Math.min(Math.max(1, limit), 25)` | GET /api/feedback: read limit from query, default 25, cap 1–25 | 25 default, client can override (capped 25) |
| `app/api/feedback/route.ts` | 225 | `getCachedFeedback(workspaceId, sessionId, 25)` | First-page cache key by size | 25 |
| `app/api/feedback/route.ts` | 268 | `feedback.length === 25` | Condition to set cache | 25 |
| `app/api/sessions/route.ts` | 26–27 | `PAGINATED_DEFAULT_LIMIT = 25`, `PAGINATED_MAX_LIMIT = 25` | GET /api/sessions default and max | 25 |
| `app/api/sessions/route.ts` | 43–46 | `Number(limitParam) \|\| PAGINATED_DEFAULT_LIMIT` capped by `PAGINATED_MAX_LIMIT` | Parsed limit for sessions | 25 |
| `lib/repositories/sessionsRepository.ts` | 160 | `PAGINATED_SESSIONS_LIMIT_MAX = 50` | Repo-level max for sessions | 50 |
| `lib/repositories/sessionsRepository.ts` | 173 | `Math.min(Math.max(1, limitSize), PAGINATED_SESSIONS_LIMIT_MAX)` | safeLimit for getWorkspaceSessionsPaginatedRepo | 1–50 (API still caps at 25) |
| `lib/repositories/sessionsRepository.ts` | 188 | `limit(safeLimit)` | Sessions Firestore query | from API (≤25) |
| `lib/feedback.ts` | 78 | `pageSize: number = 20` | getSessionFeedbackPage() default | 20 |
| `lib/feedback.ts` | 82 | `limit: pageSize` | Pass-through to repo | 20 default |
| `components/discussion/DiscussionList.tsx` | 88 | `limit=20` in URL | Conversations-only feed | 20 |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 520 | `limit=20` in URL | Capture widget feedback fetch | 20 |
| `echly-extension/src/background.ts` | 254 | `limit=20` in URL | Pointers reload for active session | 20 |
| `echly-extension/src/background.ts` | 804 | `limit=20` in URL | Session sync (feedback + session detail) | 20 |
| `lib/server/resolveAllOpenFeedbackInSession.ts` | 14–20, 47 | BATCH_SIZE, `limit(BATCH_SIZE)` | Firestore batch write limit | batch constant |
| `lib/server/cache/feedbackCache.ts` | 28 | `expectedFirstPageSize?: number` | Cache hit only when feedback.length === expected | 25 when used from API |

---

## 2. API FLOW

### GET /api/feedback

| Item | Detail |
|------|--------|
| **Where limit is read** | `searchParams.get("limit")` (line 166) |
| **Default** | `25` (`Number(...) \|\| 25`) |
| **Client override** | Yes; clamped to `safeLimit = Math.min(Math.max(1, limit), 25)` |
| **Firestore query** | `getSessionFeedbackPageForUserWithStringCursorRepo({ workspaceId, sessionId, userId, limit: safeLimit, cursor })`. Query: `where("workspaceId"), where("sessionId"), orderBy("createdAt", "desc"), limit(pageSize), startAfter(cursorSnap)` when cursor present. |
| **Cursor application** | Cursor is doc id string; repo does `getDoc(doc(db, "feedback", trimmed))` then `startAfter(cursorSnap)` when cursor present. |
| **Returned** | `feedback[]`, `nextCursor` (last doc id or null), `hasMore`, `totalCount`, `openCount`, `resolvedCount`, `skippedCount`. First page only: optional cache hit keyed by `(workspaceId, sessionId)` with `expectedFirstPageSize = 25`; cache set only when `feedback.length === 25`. |

### GET /api/sessions

| Item | Detail |
|------|--------|
| **Where limit is read** | `url.searchParams.get("limit")` (line 40) |
| **Default** | `PAGINATED_DEFAULT_LIMIT = 25` |
| **Client override** | Yes; capped by `PAGINATED_MAX_LIMIT = 25` |
| **Firestore query** | `getWorkspaceSessionsPaginatedRepo(workspaceId, paginatedLimit, cursor)`: `where("workspaceId"), orderBy("createdAt", "desc"), startAfter(cursorSnap)` when cursor present, `limit(safeLimit)`. Archived filtered in memory after query. |
| **Cursor application** | Cursor = session doc id; repo loads doc then `startAfter(cursorSnap)`. |
| **Returned** | `{ data, nextCursor, totalCount }`. No `hasMore`; client infers from `nextCursor` or `loadedCount < totalCount`. |

---

## 3. FRONTEND FETCH FLOW

### Calls to /api/feedback

| FILE | FUNCTION / CONTEXT | WHEN | PARAMS | STATE UPDATED |
|------|--------------------|------|--------|----------------|
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | `loadMore` (useCallback) | On scroll/IO near bottom when hasMore && !loadingMore | `sessionId`, `cursor` (from state), `limit=25` | Append to `apiItems`; `setCursor(data.nextCursor)`; `setHasMore(...)` |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | Inline async in onSnapshot (first snapshot) | Initial load after first Firestore snapshot | `cursor=`, `limit=25` | `setTotal`, `setActiveCount`, `setResolvedCount`, `setSkippedCount`, `setCursor`, `setHasMore`, **replace** `setApiItems(data.feedback)` |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | `refetchFirstPage` | After resolve/skip/delete, or explicit refetch | `cursor=`, `limit=25` | Same as above; **replace** `setApiItems(data.feedback)` |
| `components/discussion/DiscussionList.tsx` | useEffect | Initial load (single page) | `conversationsOnly=true`, `limit=20` | Replace internal/external list |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | `loadFeedback` (async) | When sessionId set and env has authenticatedFetch | `sessionId`, `limit=20` | `setPointers` (replace) |
| `echly-extension/src/background.ts` | In getValidToken().then(...) | When session mode active and reload pointers | `sessionId`, `limit=20` | `globalUIState.pointers` |
| `echly-extension/src/background.ts` | In message handler (session sync) | When loading session + feedback | `sessionId`, `limit=20` | `globalUIState.pointers` |

### Calls to /api/sessions

| FILE | FUNCTION / CONTEXT | WHEN | PARAMS | STATE UPDATED |
|------|--------------------|------|--------|----------------|
| `echly-extension/src/content.tsx` | `fetchSessionsPage` (useCallback) | When modal/list needs a page | `limit`, `cursor` (from opts) | Caller uses return `{ data, nextCursor, totalCount }` |
| Other references | GET /api/sessions/:id, POST /api/sessions | Single session or create | N/A | Not list pagination |

---

## 4. STATE MANAGEMENT AUDIT

### Feedback (session detail page)

| Item | Detail |
|------|--------|
| **State names** | `realtimeItems`, `apiItems`, `total`, `activeCount`, `resolvedCount`, `skippedCount`, `cursor`, `hasMore`, `loadingMore`, `initialLoading`, `initialLoadDone` |
| **Initial values** | `[]`, `[]`, `0`, `0`, `0`, `0`, `null`, `true`, `false`, `true`, `false` |
| **Update logic** | **realtimeItems:** set from Firestore onSnapshot (replace). **apiItems:** initial/refetch = replace with API feedback; loadMore = append (dedup by id with realtimeItems and prev apiItems). **cursor:** from API `nextCursor`. **hasMore:** from API or `loadedCount < totalCount`. **total/activeCount/resolvedCount/skippedCount:** from first-page API or refetchFirstPage. |
| **Dependencies** | sessionId; first snapshot triggers API seed; scroll/IO triggers loadMore; refetchFirstPage called after resolve/skip/delete and elsewhere in SessionPageClient. |

### Sessions (list)

| Item | Detail |
|------|--------|
| **State names** | In extension: `fetchSessionsPage` returns data; caller (e.g. ResumeSessionModal / list) holds `data`, `nextCursor`, `totalCount`. No single global sessions list state in app dashboard found for GET /api/sessions pagination in this audit. |
| **Initial / update** | Extension builds list from one or more pages via `fetchSessionsPage({ limit, cursor })`; append vs replace is caller-defined. |

---

## 5. INFINITE SCROLL LOGIC

| Item | Detail |
|------|--------|
| **Trigger type** | (1) **Scroll listener** on `scrollContainerRef.current` (passive). (2) **IntersectionObserver** on `loadMoreRef.current` (sentinel) with `root: scrollEl`, `rootMargin: 200px`, `threshold: 0`. |
| **File** | `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` |
| **Condition to load more** | `!s.loadingMore`; `loadedCount = realtimeItems.length + apiItems.length`; `hasMore = (totalCount === 0 ? s.hasMore : loadedCount < totalCount)`; `loadedCount < FEEDBACK_LOAD_CAP` (200). For scroll: `scrollTop + clientHeight >= scrollHeight - 200`. |
| **On trigger** | `debouncedLoadMore()` (150ms debounce) → `loadMore()`. loadMore builds URL with `cursor` and `limit=25`, fetches, appends to apiItems, updates cursor and hasMore. |

---

## 6. hasMore LOGIC (CRITICAL)

| FILE | LOGIC | CORRECT? |
|------|--------|----------|
| `lib/repositories/feedbackRepository.ts` (getSessionFeedbackPageRepo) | `hasMore = docs.length > pageSize` (request pageSize+1, slice to pageSize). | Yes: extra doc indicates more. |
| `lib/repositories/feedbackRepository.ts` (getSessionFeedbackPageForUserWithStringCursorRepo) | `hasMore = snapshot.size === pageSize` (request exactly pageSize). | Yes: full page implies possibly more; partial page implies no more. |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` (after loadMore) | `setHasMore(serverTotal > 0 ? newLen < serverTotal : (data.hasMore ?? false))`. | Yes: prefers totalCount when available. |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` (scroll/IO guard) | `hasMore = totalCount === 0 ? s.hasMore : loadedCount < totalCount`. | Yes: when total is known, uses it; otherwise uses server hasMore. |
| Sessions API | No `hasMore` returned; only `nextCursor` and `totalCount`. | Client can derive hasMore from `nextCursor` or `loadedCount < totalCount`. |

---

## 7. CURSOR FLOW TRACE

### Feedback (session list)

1. **Generated** | Last document in Firestore result: `lastVisibleDoc.id` (feedback doc id).
2. **Returned from API** | `nextCursor: string | null` in JSON.
3. **Stored in frontend** | React state `cursor` in useSessionFeedbackPaginated; also in stateRef for loadMore.
4. **Next request** | URL `cursor=${encodeURIComponent(s.cursor ?? "")}` in loadMore; initial/refetch use `cursor=`.
5. **Mismatch/loss** | No structural mismatch. Cursor is doc id; repo does getDoc by id then startAfter; ordering is createdAt desc, so next page is consistent. If a doc is deleted between requests, startAfter that id could skip or misalign; not a pagination-code bug per se.

### Sessions

1. **Generated** | Last visible session doc id (after in-memory archived filter).
2. **Returned** | `nextCursor` in API response.
3. **Stored** | By extension/content caller (e.g. fetchSessionsPage result).
4. **Next request** | `cursor` query param in GET /api/sessions.
5. **Note** | Repo filters archived after query; nextCursor is last of filtered list, so next page uses correct startAfter.

---

## 8. DUPLICATE / RACE CONDITION CHECK

| Issue | File | Why | Impact |
|-------|------|-----|--------|
| **Single API seed per mount** | useSessionFeedbackPaginated.ts | `hasFetchedRef.current` guards: after first snapshot, only one inline API call runs (`if (hasFetchedRef.current) return; hasFetchedRef.current = true`). | Prevents double first-page fetch on first snapshot. |
| **Realtime then API** | useSessionFeedbackPaginated.ts | Order is: onSnapshot runs (realtime 30 items), then when `isFirstSnapshot` we set realtime and trigger API. API response replaces apiItems. Merged list = realtime + apiItems (dedup by id). | No duplicate fetch; possible brief overlap of “realtime only” then “realtime + first page”. |
| **refetchFirstPage after mutations** | SessionPageClient.tsx | Called after resolve, skip, delete, and in other flows (e.g. 739, 776, 1026, 1068, 1096, 1118). | Intentional; can run multiple times. No guard against concurrent refetch; possible race if two refetches in flight (last write wins). |
| **Scroll + IO both active** | useSessionFeedbackPaginated.ts | Both scroll listener and IntersectionObserver call `debouncedLoadMore`. | Debounce and `loadingMore` guard reduce but do not eliminate chance of two near-simultaneous loadMore calls if both fire before state updates. |
| **Stale closure** | useSessionFeedbackPaginated.ts | loadMore uses `stateRef.current` for cursor, hasMore, apiItems, etc., so it always reads latest. | Avoids stale closure for pagination. |

---

## 9. LIMIT INCONSISTENCY DETECTION (CRITICAL)

1. **Where does limit=20 exist?**  
   - **Backend:** `lib/repositories/feedbackRepository.ts` — `FEEDBACK_PAGE_SIZE_DEFAULT = 20` (used by `getSessionFeedbackPageRepo` when `opts.limit` is omitted).  
   - **Frontend:** `components/discussion/DiscussionList.tsx` — `limit=20`.  
   - **Frontend:** `lib/capture-engine/core/hooks/useCaptureWidget.ts` — `limit=20`.  
   - **Extension:** `echly-extension/src/background.ts` — `limit=20` in two places.

2. **Why is it used?**  
   - Repo default (20) is legacy/default for `getSessionFeedbackPageRepo` and `lib/feedback.ts` (e.g. getSessionFeedbackPage).  
   - Discussion list and capture widget and extension use 20 as a chosen page size; they do not use the dashboard session-feedback pagination hook.

3. **Which flow uses limit=20?**  
   - DiscussionList (conversations feed).  
   - Capture widget feedback load.  
   - Extension: pointers reload and session sync.  
   - Any caller of `getSessionFeedbackPage()` or `getSessionFeedbackPageRepo` without passing limit (e.g. lib/feedback.ts default 20).

4. **Frontend vs backend?**  
   - **Frontend:** Dashboard session feedback uses **25** (useSessionFeedbackPaginated PAGE_SIZE).  
   - **Frontend:** DiscussionList, useCaptureWidget, extension use **20**.  
   - **Backend:** GET /api/feedback default is **25**, cap 25; client can send 20 (e.g. extension) and gets 20.  
   - **Backend:** Repo default is **20** only when limit not passed (API always passes limit for session feedback).

5. **Exact root cause of mismatch**  
   - **Session feedback list (dashboard):** Frontend sends **25**, API and repo use **25**; cache expects first page size **25**. No mismatch for this flow.  
   - **Mismatch is cross-flow:** Session feedback **list** is 25; **other** consumers (discussion, capture, extension) use 20. So “limit inconsistency” is not one wrong value but **two different conventions** (25 for main session feedback list, 20 elsewhere).  
   - If the **extension** or **DiscussionList** were to rely on the same first-page cache as the dashboard, they would **not** get a cache hit because the cache is keyed with `expectedFirstPageSize = 25` and they request 20. So they always hit the API with limit=20; no silent wrong-count issue.

---

## 10. FINAL SYSTEM DIAGNOSIS

### What is correct

- **Cursor flow:** Feedback and sessions use doc-id cursor and startAfter; cursor is passed through API and state and next request correctly.
- **hasMore:** Repo and hook use consistent rules (full page ⇒ possibly more; totalCount used when available).
- **First-page cache:** Keyed by workspaceId + sessionId; size check 25 avoids serving wrong-sized page.
- **State:** apiItems replace on first load/refetch, append on loadMore; cursor/hasMore updated from API; stateRef used to avoid stale closure in loadMore.
- **Sessions API:** Limit 25 default/max; repo receives it; nextCursor returned; totalCount returned for client-side hasMore.

### What is broken or fragile

- **Limit convention split:** 25 for dashboard session feedback list vs 20 for discussion list, capture widget, and extension. Not a single bug but inconsistent contract (different page sizes and cache expectations).
- **Sessions hasMore:** API does not return `hasMore`; clients must infer from `nextCursor` or `loadedCount < totalCount`. Works but is easy to get wrong.
- **Sessions repo:** In-memory archived filter can return fewer than `limit` items per page; nextCursor still correct but page sizes vary.
- **Concurrent refetchFirstPage:** No guard; multiple calls can race (last response wins).
- **Scroll + IO:** Both can trigger loadMore; debounce and loadingMore reduce but do not guarantee a single in-flight request.

### Root cause of lazy load failure (if observed)

- If “load more” never runs: check `hasMore` and `totalCount` (e.g. totalCount 0 or wrong can make `loadedCount < totalCount` false).  
- If “load more” runs but shows no new items: check cursor passed in URL and repo startAfter; check append/dedup logic and that apiItems are not replaced.  
- If first page is wrong size: ensure client and API use same limit (25 for dashboard); extension/DiscussionList using 20 is by design, not the dashboard flow.

### Root cause of limit inconsistency

- **Root cause:** Two different page-size choices: **25** for the main session feedback list (dashboard + API default + cache), and **20** for repo default, DiscussionList, capture widget, and extension. No single source of truth for “session feedback page size” across all clients.

### Architectural violations

- **Single source of truth:** Limit 25 is hardcoded in hook (PAGE_SIZE), API (default and cap), and cache (25); limit 20 is hardcoded in repo default, DiscussionList, useCaptureWidget, and extension.  
- **Sessions pagination:** Repo does not return `hasMore`; API does not add it; clients must infer.  
- **Refetch race:** refetchFirstPage has no request deduplication or cancellation.

---

## OUTPUT FORMAT COMPLIANCE

- **1. LIMIT SOURCES** — Table of file, line, code, purpose, value.  
- **2. API FLOW** — GET /api/feedback and GET /api/sessions: limit source, default, override, Firestore, cursor, response shape.  
- **3. FRONTEND FLOW** — All fetches to /api/feedback and /api/sessions with file, when, params, state updated.  
- **4. STATE MANAGEMENT** — Feedback and sessions state names, initial values, update logic (append/replace/reset), dependencies.  
- **5. INFINITE SCROLL** — Scroll + IntersectionObserver, conditions, what runs on trigger.  
- **6. hasMore LOGIC** — Where and how hasMore is computed; correctness.  
- **7. CURSOR FLOW** — From Firestore → API → frontend → next request; mismatch/loss.  
- **8. DUPLICATE / RACE** — Multiple triggers, refetch, stale closure; impact.  
- **9. LIMIT INCONSISTENCY** — Where 20 vs 25, why, which flow, frontend vs backend, root cause.  
- **10. FINAL DIAGNOSIS** — Correct, broken, root causes, architectural violations.

**No code was modified.** This report is analysis only.
