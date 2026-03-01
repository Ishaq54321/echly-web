# Echly Dashboard — Full Performance Diagnosis

**Scope:** Dashboard session page, resolve toggle, session load, refetch sources, React re-renders, API timing.  
**Note:** Instrumentation (console logs and performance.now()) has been added as requested. Run the app and trigger the flows to collect exact timings in the browser console (client) and terminal (server).

---

## 1. Resolve toggle total time breakdown

**Instrumentation added in** `app/(app)/dashboard/[sessionId]/page.tsx` inside `saveResolved`:

- **Resolve clicked at** — `performance.now()` when the handler runs (start).
- **Sending PATCH...** — immediately before `authFetch` to `/api/tickets/${selectedId}` (PATCH).
- **PATCH finished in** — ms from start to after `res.json()`.
- **Total resolve flow time:** — ms from start to after updating `detailTicket` (no refetch is currently called after PATCH).

**Current behavior:** Resolve is **optimistic only**. There is no call to `refetchFeedbackFirstPage()` (or any refetch) after the PATCH in `saveResolved`. So:

- **Total resolve flow time** in the logs is effectively **PATCH response time + a small amount of sync work** (JSON parse + setState).
- To measure “after refetch” you would need to add a refetch step (you asked for no logic change, so it was not added).

**How to get numbers:** Click resolve on a ticket, then read the console:

1. `Resolve clicked at <timestamp>`
2. `Sending PATCH...`
3. `PATCH finished in <ms>`
4. `Total resolve flow time: <ms>`

---

## 2. Session load total time breakdown

**Instrumentation added in** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` (initial-load effect):

- **[Session load] Session feedback fetch started** — when `sessionId` is set and the effect runs (before `authFetch`).
- **[Session load] GET /api/feedback starting** — right before `authFetch` to first page.
- **[Session load] GET /api/feedback response arrived in** — ms from effect start to response (in first `.then`).
- **[Session load] setItems running, count: N** — when `setItems(data.feedback)` runs.
- **[Session load] Total session load time:** — ms from effect start to after `setInitialLoadDone(true)`.
- **[Session load] Page state updated (render will follow)** — in `finally` when `setInitialLoading(false)` runs.

**Session document load** is separate: the session doc is loaded in the page’s `useEffect` via Firestore `getDoc(sessionRef)` and then `setSession(...)`. There is no instrumentation there; only the **feedback list** (GET /api/feedback) is timed in the hook.

**How to get numbers:** Open a session page and check the console for the `[Session load]` lines. “Total session load time” is from effect start to state updated (render will happen on next tick).

---

## 3. Where refetch happens (refetch sources)

Search scope: `refetchFeedbackFirstPage`, `refetch`, `router.refresh`, `setInitialLoading`, `GET /api/feedback`, `GET /api/sessions` (call sites and triggers).

### 3.1 `refetchFeedbackFirstPage`

| Location | When it triggers | Blocks UI? | Replaces entire state? |
|----------|-------------------|------------|-------------------------|
| **Defined:** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | Only when the returned `refetchFirstPage` is **invoked**. | No (async, no loading flag set). | Yes: first page only — `setItems(data.feedback)`, `setCursor`, `setHasMore`, and counts. |
| **Exposed:** `app/(app)/dashboard/[sessionId]/page.tsx` | Destructured as `refetchFeedbackFirstPage` but **never called** in the dashboard app. | N/A | N/A |

So in the current dashboard, **no refetch runs on resolve or anywhere else**; the refetch function exists but is unused.

### 3.2 `refetch` (generic)

- No other `refetch` pattern (e.g. React Query) found in the repo for this flow. The only refetch is `refetchFirstPage` above.

### 3.3 `router.refresh`

- **Not used** anywhere in the app (no `router.refresh()` or `.refresh()` in app code).

### 3.4 `setInitialLoading`

| Location | When it triggers | Blocks UI? | Replaces entire state? |
|----------|-------------------|------------|-------------------------|
| **useSessionFeedbackPaginated** (initial-load effect) | When `sessionId` becomes truthy: `setInitialLoading(true)` at start, `setInitialLoading(false)` in `finally`. | Yes: `loading === initialLoading` is used by the page; UI can show loading. | No; it only toggles loading. Items are set by the same effect. |
| **refetchFirstPage** | Does **not** call `setInitialLoading` (comment: “Do not set initialLoading”). | No | N/A |

So **only the initial feedback load** sets the loading flag; refetches do not.

### 3.5 GET /api/feedback

| Location | When it triggers | Blocks UI? | Replaces entire state? |
|----------|-------------------|------------|-------------------------|
| **useSessionFeedbackPaginated** initial effect | When `sessionId` is set (mount or sessionId change). | Yes (via `setInitialLoading(true)`). | Yes: first page only — `setItems`, counts, cursor, hasMore. |
| **useSessionFeedbackPaginated** `refetchFirstPage` | When `refetchFirstPage()` is called (currently never in dashboard). | No | Yes: same as above. |
| **useSessionFeedbackPaginated** `loadMore` | When intersection observer fires and debounced load runs (scroll to sentinel). | Shows `loadingMore` but does not replace first page. | No: appends with `setItems(prev => [...prev, ...data.feedback])`. |

### 3.6 GET /api/sessions

| Location | When it triggers | Blocks UI? | Replaces entire state? |
|----------|-------------------|------------|-------------------------|
| **Server:** `app/api/sessions/route.ts` | When a client requests list of sessions. | N/A (server). | N/A |
| **Client:** `echly-extension/src/popup.tsx`, `content.tsx` | Extension UI loading sessions. | Depends on extension UI. | N/A (extension state). |
| **Dashboard session page** | Does **not** call GET /api/sessions; session doc comes from Firestore `getDoc`. | N/A | N/A |

---

## 4. Which components re-render during resolve toggle

**Flow:** User toggles resolve → `saveResolved(isResolved)` runs → optimistic updates: `setDetailTicket`, `setFeedback` (hook’s `setItems`), `setFeedbackActiveCount`, `setFeedbackResolvedCount` → then PATCH runs.

**State ownership:**

- **Session page** holds: `session`, `selectedId`, `detailTicket`, and many other `useState` values.
- **useSessionFeedbackPaginated** holds: `items` (feedback), `total`, `activeCount`, `resolvedCount`, `cursor`, `hasMore`, `initialLoading`, etc.

When we call:

1. `setDetailTicket(...)` → Session page state → **Session page** re-renders.
2. `setFeedback(...)` → hook state → hook runs in the page → **Session page** re-renders.
3. `setFeedbackActiveCount` / `setFeedbackResolvedCount` → hook state → **Session page** re-renders.

So on a single resolve toggle we get **one or more re-renders of the session page** (batched or sequential depending on React batching). No unmount/remount: `sessionId` and route do not change.

**Children and layout:**

- **App layout** (`app/(app)/layout.tsx`): Renders `GlobalRail` and `{children}`. When the **page** (child) re-renders, the layout re-renders too (React tree). So **layout re-renders** on resolve, but with no new props/state of its own.
- **Session page** (default export): Re-renders (see above).
- **FeedbackSidebar**: Receives `feedback`, `activeCount`, `resolvedCount`, etc. from the page. Those references/values change → **FeedbackSidebar re-renders**.
- **FeedbackDetail**: Receives `selectedItem` (derived from `detailTicket`), `onResolvedChange` (saveResolved), etc. `detailTicket` and counts change → **FeedbackDetail re-renders**.
- **GlobalRail** (sidebar): In the layout; gets `usePathname()`. Path doesn’t change on resolve, but the layout still re-renders, so **GlobalRail re-renders** (pathname result is the same).

**Summary:**

| Component | Re-renders on resolve toggle? | Notes |
|-----------|--------------------------------|--------|
| App layout | Yes | Because child (page) re-renders. |
| GlobalRail (sidebar) | Yes | Part of layout. |
| Session page | Yes | Own state + hook state (feedback, counts, detailTicket). |
| FeedbackSidebar | Yes | New `feedback`, counts from page. |
| FeedbackDetail | Yes | New `selectedItem` (detailTicket), etc. |
| Session page unmount/remount | No | Route/params unchanged. |

So: **full layout re-render, full session page re-render, full FeedbackSidebar re-render, full FeedbackDetail re-render**. No refetch or router refresh, so no extra network-driven re-renders on resolve.

---

## 5. Backend response time per API

**Instrumentation added:** In each handler, `const start = Date.now()` and `console.log("[API] ... start")` at the top, and `console.log("[API] ... duration:", Date.now() - start)` before returning (and on error paths where applicable).

**Files and handlers:**

- **app/api/feedback/route.ts**  
  - GET: `[API] GET /api/feedback start` / `[API] GET /api/feedback duration: <ms>`  
  - POST: `[API] POST /api/feedback start` / `[API] POST /api/feedback duration: <ms>`
- **app/api/tickets/[id]/route.ts**  
  - GET: `[API] GET /api/tickets/[id] start` / `duration: <ms>`  
  - PATCH: `[API] PATCH /api/tickets/[id] start` / `duration: <ms>`
- **app/api/sessions/route.ts**  
  - GET: `[API] GET /api/sessions start` / `duration: <ms>`
- **app/api/sessions/[id]/route.ts**  
  - PATCH: `[API] PATCH /api/sessions/[id] start` / `duration: <ms>`  
  - DELETE: `[API] DELETE /api/sessions/[id] start` / `duration: <ms>`

**How to get numbers:** Run the app (e.g. `pnpm dev`), trigger the relevant requests (open session, toggle resolve, load more, etc.), and read the **server terminal** for `[API] ... duration:` lines. Those are the backend response times.

---

## 6. Largest bottleneck identified (from code and flow)

From the code and data flow (without your actual timings), the most likely bottlenecks are:

1. **GET /api/feedback (first page)**  
   - Runs on every session open.  
   - Does: auth, get session, `getSessionFeedbackPageWithStringCursorRepo`, and for first page also `getSessionFeedbackCountRepo` and `getSessionFeedbackCountsRepo`.  
   - Multiple DB reads and serialization; first-page cost is higher than later pages.

2. **PATCH /api/tickets/[id]** (resolve and other edits)  
   - Runs on every resolve toggle.  
   - Does: auth, get ticket, `updateFeedbackRepo`, `getFeedbackByIdRepo`, `updateSessionUpdatedAtRepo`.  
   - Several DB writes/reads per toggle.

3. **Re-render scope**  
   - One resolve toggle re-renders layout, session page, FeedbackSidebar, and FeedbackDetail.  
   - If those components are heavy or do a lot of work in render, this can add up. No React.memo or splitting was analyzed; the main cost is likely the breadth of re-renders rather than a single heavy component.

4. **No refetch on resolve**  
   - Resolve is optimistic only. So “slowness” after resolve is not from a refetch, but from PATCH latency + re-renders above.

**Single largest bottleneck:** Without measured timings, the **first GET /api/feedback** (session load) is the best candidate for “largest” because it runs once per session open and does the most work (pagination + two count queries). Second candidate: **PATCH /api/tickets/[id]** for resolve (network + DB + full-tree re-render).

---

## 7. Recommended fix priority (ordered list)

1. **Measure**  
   - Run the app, reproduce session load and resolve toggle, and collect:  
     - Client: resolve logs and `[Session load]` logs.  
     - Server: all `[API] ... duration:` logs.  
   - Identify which of GET /api/feedback (first page), PATCH /api/tickets/[id], or first paint/re-render dominates.

2. **Backend: GET /api/feedback (first page)**  
   - Consider combining or caching `getSessionFeedbackCountRepo` and `getSessionFeedbackCountsRepo` (e.g. single query or cached counts).  
   - Optionally defer or lazy-load counts so the first paint can show items before counts.

3. **Backend: PATCH /api/tickets/[id]**  
   - If PATCH duration is high: reduce round-trips (e.g. return updated ticket from update path instead of separate get), or relax “update session updatedAt” if it’s not critical for every edit.

4. **Frontend: Reduce re-renders on resolve**  
   - Wrap `FeedbackSidebar` / `FeedbackDetail` in `React.memo` with stable callbacks (e.g. `saveResolved` in `useCallback`).  
   - Or move feedback list (and resolve handler) into a smaller subtree so the layout and the rest of the page don’t re-render on every toggle.

5. **Frontend: Session doc load**  
   - Session is loaded with Firestore `getDoc` in the page; if that’s slow, consider showing a skeleton or caching so the feedback list (GET /api/feedback) isn’t blocked by Firestore.

6. **Avoid unnecessary refetches**  
   - Keep resolve optimistic without calling `refetchFeedbackFirstPage()` after PATCH. If you later add refetch, consider doing it in the background and not blocking UI or replacing the whole list if only one item changed.

---

**Next step:** Run the app, capture the console and server logs for one session load and one resolve toggle, then plug the actual “PATCH finished in”, “Total session load time”, and “[API] ... duration” numbers into this document to confirm which of the above is the dominant bottleneck.
