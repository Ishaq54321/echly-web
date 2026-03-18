# SYSTEM AUDIT REPORT — Feedback API & Pagination (Pre–Performance Optimization)

**Date:** 2025-03-18  
**Scope:** Feedback API flow, workspace resolution, feedback cache, duplicate requests, extension pagination, scroll triggers, Firestore usage.  
**Rules:** Inspection and trace logging only. No logic changes, no refactors.

---

## 1. API FLOW

**Execution order:** **SEQUENTIAL**

- Auth is awaited first (`requireAuthFast(req)`).
- Workspace resolution is awaited next (`resolveWorkspaceForUserLight(user.uid, req)`).
- Firestore (or cache) runs only after both complete.

**Trace logs added:**

- `[TRACE] STEP 1: request received`
- `[TRACE] STEP 2: auth start` / `STEP 2: auth done` + `[TIME] auth: <ms>`
- `[TRACE] STEP 3: workspace start` / `STEP 3: workspace done` + `[TIME] workspace: <ms>`
- `[TRACE] STEP 4: firestore query start` / `STEP 4: firestore done` + `[TIME] firestore: <ms>`
- `[TRACE] STEP 5: response sent`

**Timings:** Use `[TIME] auth:`, `[TIME] workspace:`, `[TIME] firestore:` and existing `[PERF BREAKDOWN]` in server logs to measure per-step latency.

---

## 2. WORKSPACE

**Cached:** **yes**

- **Source:** `lib/server/resolveWorkspaceForUserLight.ts`
- **Mechanism:**  
  - **Request-scope:** If `req.__workspaceId` is set (by middleware or prior resolution), returns immediately.  
  - **Memory cache:** `workspaceIdCache` (Map) keyed by `uid`, TTL 5 minutes.  
  - **In-flight dedup:** `resolveWorkspaceIdInFlight` ensures one Firestore resolution per uid at a time.
- **When cache misses:** Calls `getUserWorkspaceIdRepo(uid)` (Firestore).
- **Reuse across requests:** Yes. Memory cache and in-flight map are process-global; shared across all requests in the same Node process.

**Logs added:**

- `[WORKSPACE] called` at entry.
- `[WORKSPACE] source: "cache"` when returning from request cache, memory cache, or in-flight promise.
- `[WORKSPACE] source: "firestore"` when resolving from Firestore.

**Latency:** Observe `[TIME] workspace:` in API route logs; compare cache vs firestore hits via `[WORKSPACE] source:`.

---

## 3. CACHE (Feedback first page)

**First page cached:** **yes**

- **Where:** `app/api/feedback/route.ts` — when `sessionId` is present and `isFirstPage` (no cursor or empty cursor).
- **Key:** `workspaceId:sessionId` (from `lib/server/cache/feedbackCache.ts` `getKey()`).
- **Condition to use cache:** First page only; `getCachedFeedback(workspaceId, sessionId, 25)`.
- **Condition to set cache:** After Firestore, when `isFirstPage && feedback.length === 25`; `setCachedFeedback(workspaceId, sessionId, responseBody)`.
- **TTL:** 30 seconds (memory, in-process).

**Cursor pages cached:** **no**

- Cache key does not include cursor. Only first page is stored; cursor-based requests always hit Firestore.
- For cursor requests the route logs `[CACHE CHECK] { hit: false, key, hasCursor: true }`.

**Logs added:**

- In route: `[CACHE CHECK] { hit, key, hasCursor }` before using cache (first page) and for cursor path (hit: false, hasCursor: true).
- In `feedbackCache.ts`: `[CACHE CHECK] { hit, key, hasCursor: false }` on miss and on hit (cache is first-page only, so hasCursor is always false there).

**Verification:** Run a session feedback flow; confirm first page can hit cache (`[CACHE CHECK] hit: true`) and cursor pages show `hasCursor: true`, `hit: false`.

---

## 4. DUPLICATE CALLS

**To be verified from logs.**

**Logs added:**

- **Dashboard:** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`  
  - `[FETCH TRIGGERED] { sessionId, cursor, source: "initial" | "loadMore" | "refetch" }` for initial load, load-more, and refetch.
- **Extension:** `echly-extension/src/background.ts`  
  - `[FETCH TRIGGERED] { sessionId, cursor, source: "initial" | "loadMore" }` for first page (e.g. `initializeSessionState`, `ECHLY_SET_ACTIVE_SESSION`) and for `ECHLY_FEEDBACK_LOAD_NEXT`.

**Checks to do manually:**

- How many times does the initial fetch fire (e.g. double mount, strict mode)?
- Does the same request (same sessionId + cursor) repeat without user action?
- Count `[FETCH TRIGGERED]` by source in a typical session open + scroll-to-bottom flow.

---

## 5. EXTENSION PAGINATION

**Pagination correctness (by code):** **yes**

- **State:** `feedbackNextCursor`, `feedbackHasMore`, `globalUIState.pointers`, `globalUIState.feedbackHasMore`, `globalUIState.feedbackLoadingMore`.
- **First page:** Set in `ECHLY_SET_ACTIVE_SESSION` and `initializeSessionState`; `feedbackNextCursor` and `feedbackHasMore` set from API response.
- **Next page:** `ECHLY_FEEDBACK_LOAD_NEXT` uses `feedbackNextCursor`, appends to `globalUIState.pointers`, updates `feedbackNextCursor` and `feedbackHasMore` from response.
- **Append-only:** New items are appended; no replacement of existing pointers for pagination.
- **hasMore:** Set from `json.hasMore`; when no more items, next load is not sent (guard: `!globalUIState.feedbackHasMore`).

**Logs added:**

- After first page and after each load-more in background:  
  `[EXT PAGINATION STATE] { nextCursor, hasMore, loadingMore, pointerCount: globalUIState.pointers.length }`

**Verification:** Confirm in logs that `nextCursor` advances, `hasMore` flips to false when last page is received, and `pointerCount` grows only by appends.

---

## 6. SCROLL TRIGGER

**Where:** `lib/capture-engine/core/CaptureWidget.tsx` — `handleListScroll` (list scroll, not page scroll).

**Behavior:**

- Uses `listScrollRef`; when `scrollRatio > 0.85` and extension mode + `feedbackHasMore` + `!feedbackLoadingMore` + `onLoadMoreFeedback`, calls `onLoadMoreFeedback()`.
- No debounce in the widget; extension side uses `feedbackLoadingMore` to avoid overlapping requests.

**Logs added:**

- `[SCROLL] { scrollPosition, triggered }` on every list scroll (scrollPosition = ratio; triggered = whether load-more was invoked).

**Verification (from logs):**

- Does the same scroll event trigger load more multiple times? (Expect no, due to `feedbackLoadingMore`.)
- Is there a burst of `[SCROLL]` with `triggered: true` (spam)? Check in extension flow when scrolling near bottom.

---

## 7. FIRESTORE

**Session feedback query:** `getSessionFeedbackPageForUserWithStringCursorRepo` in `lib/repositories/feedbackRepository.ts`.

**Logs added:**

- `[FIRESTORE DETAILS] { docs, hasCursor, queryTime }` after `getDocs(q)` (docs = snapshot.size, queryTime in ms).

**Observations from code:**

- Page size capped by `safeLimit` (max 25) in the route and by `assertQueryLimit(pageSize, ...)` in the repo.
- Single query per request (feedback page + session doc fetched in parallel via `Promise.all` in the route).
- No over-fetch: limit is applied in the query.

**Verification:** From server logs, confirm `docs <= 25`, `queryTime` reasonable, and no duplicate or redundant queries for the same page.

---

## 8. API CALL MAP (Manual from terminal logs)

**Instructions:**

1. Run the app and extension; open a session and scroll feedback list (dashboard and/or extension).
2. In terminal/server logs, count:
   - `/api/feedback` calls (use `[TRACE] STEP 1` or `[API] GET /api/feedback`).
   - `/api/sessions` calls (search for sessions API logs).
   - `/api/billing` (or billing-related) calls if any.
3. Note:
   - Duplicate calls (same sessionId + cursor in short succession).
   - Unnecessary calls (e.g. feedback refetched without user action).

**No code changes for this step;** use the trace and fetch logs above to build the summary.

---

## 9. FILES TOUCHED (Trace logs only)

| File | Change |
|------|--------|
| `app/api/feedback/route.ts` | `[TRACE]` steps 1–5, `[TIME]` auth/workspace/firestore, `[CACHE CHECK]` for first page and cursor path |
| `lib/server/resolveWorkspaceForUserLight.ts` | `[WORKSPACE] called`, `[WORKSPACE] source:` cache/firestore |
| `lib/server/cache/feedbackCache.ts` | `[CACHE CHECK]` on miss and hit |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | `[FETCH TRIGGERED]` initial, loadMore, refetch |
| `echly-extension/src/background.ts` | `[FETCH TRIGGERED]` initial, loadMore; `[EXT PAGINATION STATE]` after first page and load-more |
| `lib/capture-engine/core/CaptureWidget.tsx` | `[SCROLL] { scrollPosition, triggered }` in handleListScroll |
| `lib/repositories/feedbackRepository.ts` | `[FIRESTORE DETAILS] { docs, hasCursor, queryTime }` in getSessionFeedbackPageForUserWithStringCursorRepo |

---

## 10. SUMMARY TABLE (To fill after running and inspecting logs)

| Area | Finding (code) | Verify from logs |
|------|----------------|-------------------|
| **1. API flow** | SEQUENTIAL (auth → workspace → firestore) | `[TIME]` values per step |
| **2. Workspace** | Cached (memory + request); 5 min TTL; reused across requests | `[WORKSPACE] source:` cache vs firestore; `[TIME] workspace:` |
| **3. Cache** | First page: cached (key workspaceId:sessionId). Cursor: not cached | `[CACHE CHECK]` hit/hasCursor |
| **4. Duplicate calls** | — | Count `[FETCH TRIGGERED]` by source; note duplicates |
| **5. Extension pagination** | Correct (cursor, hasMore, append-only) | `[EXT PAGINATION STATE]` cursor/hasMore/pointerCount |
| **6. Scroll** | Threshold 0.85; no debounce in widget; loadingMore guards in extension | `[SCROLL]` triggered frequency |
| **7. Firestore** | Single query per page; limit ≤ 25; queryTime logged | `[FIRESTORE DETAILS]` docs, queryTime |

---

**Next step:** Run the app, reproduce session open + scroll flows (dashboard and extension), collect logs, and fill Section 8 (API call counts) and the “Verify from logs” column above. No fixes or optimizations in this audit.
