# DASHBOARD INTELLIGENCE INFRASTRUCTURE REPORT

---

## STEP 1 — GLOBAL METRICS SUPPORT

### 1. Total open feedback across all sessions

**Currently supported?** No. There is no single query or API that returns this.

**How it’s done today:** Client-side only. `useWorkspaceOverview` loads sessions (up to 50) then calls `getSessionFeedbackCounts(sessionId)` for each session and sums `counts.open`. So total open = sum of per-session open counts, only for the first 50 sessions.

**Missing:** A server-side way to compute or return “total open for user” without N per-session count calls.

**New Firestore fields?** Optional. Could add a **user-level counter** (e.g. `users/{userId}` doc with `totalOpenFeedback`, `totalResolvedFeedback`) maintained by writes (feedback create/resolve/delete). Then one read gives the total. Without that, no new fields are strictly required; an aggregation API can compute from existing data.

**Aggregation API?** Yes, for a scalable solution. An API (e.g. `GET /api/dashboard/stats` or `GET /api/metrics/global`) that: (1) gets the user’s session IDs (single query: `sessions` where `userId == uid`, with limit/pagination if desired), (2) runs aggregated counts over `feedback` (e.g. per-session counts in one or more batched/aggregation queries, or a single aggregation if Firestore supports it), (3) returns total open (and optionally total resolved, total feedback). Today Firestore has no single “count feedback where sessionId in [...]” aggregation; so the API would either call existing `getSessionFeedbackCountsRepo` per session (server-side N+1) or rely on denormalized counters.

---

### 2. Sessions with open feedback > 0

**Currently supported?** Only after loading counts per session. Client filters: `sessions.filter(s => sessionCounts[s.id]?.open > 0)`. No server-side filter.

**Missing:** A query that returns only sessions that have at least one open feedback. Today sessions are queried by `userId` and `updatedAt`; open count is not on the session document.

**New Firestore fields?** Yes, for efficient support. Add **`openCount`** (and optionally `resolvedCount` or `feedbackCount`) on the **session** document. Update on feedback create, delete, and status change (open ↔ resolved). Then: index `sessions` (`userId` ASC, `openCount` DESC) or (`userId` ASC, `updatedAt` DESC) and filter `openCount > 0` in the query. Without denormalization, the server would need to fetch sessions then filter by per-session counts (N+1 or aggregation API).

**Aggregation API?** Optional if denormalized. If session has `openCount`, a single `getUserSessionsRepo`-style query with `where("openCount", ">", 0)` (and index) can return “sessions with open feedback.” Otherwise an API that returns sessions plus counts (or only sessions with open > 0) and does the count work server-side.

---

### 3. Last activity per session (based on feedback updatedAt or comments)

**Currently supported?** Partially. **Session** has **`updatedAt`** (Timestamp). It is updated by `updateSessionUpdatedAtRepo` when: feedback create/update/delete, session title change, and when comments are added (via `incrementSessionCommentCountRepo` but not `updateSessionUpdatedAtRepo` — comment add does not currently touch session `updatedAt`). So “last activity” is effectively “last feedback or title change,” not “last comment.” **Feedback** documents do not have an `updatedAt` field; only `createdAt` and status/field updates. So “last activity” is session-level only and does not include comment activity unless session `updatedAt` is updated on comment create.

**Missing:** (1) Ensure **comment create** updates session `updatedAt` (call `updateSessionUpdatedAtRepo(sessionId)` in `addCommentRepo` or in the code path that creates a comment) so “last activity” includes comments. (2) If “last activity” must be the max of (latest feedback update, latest comment) at read time, either: store a single **`lastActivityAt`** on session (or keep using `updatedAt`) and keep it updated on every feedback and comment write, or compute from feedback/comment collections (expensive).

**New Firestore fields?** Not strictly required if `updatedAt` is used and comment create updates it. Optional: explicit **`lastActivityAt`** or **`lastActivityType`** if the product needs to distinguish “last feedback” vs “last comment.” Today no new field is required; behavior change is “update session.updatedAt when a comment is added.”

**Aggregation API?** No. Last activity per session is already a session field (`updatedAt`). List sessions by `updatedAt` desc is already supported (composite index `userId`, `updatedAt` desc). An API that returns sessions with a “lastActivityAt” or “lastActivitySource” could map `updatedAt` to that; no new aggregation logic needed once comment create updates `updatedAt`.

---

### 4. Completion % per session (resolved / total)

**Currently supported?** Yes, per session. **`getSessionFeedbackCountsRepo(sessionId)`** returns `{ open, resolved }`. Total = open + resolved. Completion % = resolved / total (with guard for total 0). Used on overview and can be computed client-side for each session when counts are loaded.

**Missing:** Nothing for a single session. For **dashboard-wide** “completion %” (e.g. across all sessions), no single value exists; client could sum resolved and total from all loaded session counts (same N+1 as today).

**New Firestore fields?** No. Counts are already available via aggregation per session.

**Aggregation API?** Only if global completion % is needed. Then an API that returns global total resolved and total feedback (or per-session counts) would allow one server round-trip; otherwise client keeps using per-session counts.

---

### 5. Sessions sorted by urgency (open count or last activity)

**Currently supported?** **By last activity:** Yes. **`getUserSessionsRepo`** uses `orderBy("updatedAt", "desc")`. So “most recently active first” is supported. **By open count (urgency):** No. Open count is not on the session document; it is computed per session via `getSessionFeedbackCountsRepo`. So “sort by open count” would require loading all sessions and their counts, then sorting in memory (client or server). With a 50-session cap, that’s 1 session query + 50 count queries.

**Missing:** Ability to order sessions by open count (or by a composite “urgency” that combines open count and recency) in a single or bounded number of queries.

**New Firestore fields?** Yes, for sort-by-open-count. Add **`openCount`** (and optionally `resolvedCount`) on **session**. Maintain on feedback create, delete, and resolve toggle. Composite index: `sessions` (`userId` ASC, `openCount` DESC). Then “sessions by urgency (open count)” is one query. Alternative: keep `updatedAt` and add a **`hasOpenFeedback`** boolean if only “has open / no open” split is needed; sorting by numeric open count is more flexible.

**Aggregation API?** Optional. If session has `openCount`, no aggregation API is needed for sort. If not, an API that returns sessions with counts and sorts by open count (or urgency score) server-side would avoid client doing 50 count calls and sorting.

---

### 6. Recently viewed sessions (user-based)

**Currently supported?** No. **`recordSessionViewIfNewRepo`** writes to **`sessionViews/{sessionId}/views/{viewerId}`** with `viewedAt`. So the structure is “per session, which viewers viewed it.” To get “sessions recently viewed by user U” you need “per user, which sessions they viewed and when.” That is the inverse of the current structure. Firestore cannot efficiently query “all subcollections across all sessionIds where document id = viewerId.” So there is no way to list “sessions viewed by this user” from the current schema.

**Missing:** A **user-centric view store** so that “recently viewed sessions for user U” is a single query (or cursor-based page). For example: **`userSessionViews/{userId}/views/{sessionId}`** with field **`viewedAt`** (Timestamp). When recording a view: (1) keep existing `sessionViews/{sessionId}/views/{viewerId}` for Loom-style “has this viewer viewed this session” and view count increment, (2) set or update `userSessionViews/{userId}/views/{sessionId}` to `{ viewedAt: serverTimestamp() }`. Then query: `userSessionViews/{userId}/views` orderBy `viewedAt` desc limit N. Composite index: `userSessionViews/{userId}/views` (`viewedAt` DESC).

**New Firestore fields?** Yes — a new subcollection (or collection) as above. No new fields on existing `sessions` or `feedback`; the new structure is the “recently viewed” index.

**Aggregation API?** Optional. A **`GET /api/dashboard/recent-views`** (or similar) could read from `userSessionViews/{uid}/views`, optionally join with session docs for title/counts, and return recently viewed sessions. Structurally the main requirement is the new view store; the API is a thin read over it.

---

## STEP 2 — SCALABILITY CONCERNS

### 1. N+1 patterns

**Dashboard (workspace list):**  
- **Pattern:** 1 query for user sessions (`getUserSessionsRepo(userId, 50)`), then N queries for counts: `getSessionFeedbackCounts(s.id)` for each session (inside `loadSessionsAndCounts`). So **1 + N** Firestore operations (N ≤ 50).  
- **Location:** `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`, `loadSessionsAndCounts`.

**Overview (session overview page):**  
- **Pattern:** One session, but many parallel calls: `getSessionById`, `getSessionFeedbackCounts`, `getSessionFeedbackTotalCount`, `getSessionFeedback`, `getSessionFeedbackByResolved(false, 3)`, `getSessionFeedbackByResolved(true, 3)`, `getSessionRecentComments`, then `getFeedbackByIds(feedbackIds)` for activity titles. So **8+** round-trips (several hit the same session’s feedback). Not N+1 over sessions, but **redundant work**: `getSessionFeedbackCounts` already yields total (open + resolved), so `getSessionFeedbackTotalCount` is redundant.  
- **Location:** `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts`.

**Session page (first page of feedback):**  
- **Pattern:** GET `/api/feedback?sessionId=...&cursor=&limit=20` does: `getSessionFeedbackPageWithStringCursorRepo`, then on first page also `getSessionFeedbackCountRepo(sessionId)` and `getSessionFeedbackCountsRepo(sessionId)`. So **3** reads for the first page (page + total count + open/resolved counts). Total can be derived from counts (total = open + resolved), so one of the count calls could be removed.  
- **Location:** `app/api/feedback/route.ts` GET handler.

### 2. Where batching APIs should replace client-side Promise.all

**Dashboard:**  
- **Current:** Client calls `getUserSessions(uid, 50)` then `Promise.all(sessions.map(s => getSessionFeedbackCounts(s.id)))`. So the client (or the code path that runs in the browser via lib) triggers 1 + N Firestore reads.  
- **Structural change:** Introduce a **server API** (e.g. `GET /api/dashboard/workspace` or `GET /api/sessions/with-counts`) that: (1) runs `getUserSessionsRepo` (or equivalent) server-side, (2) for the returned session IDs, either (a) calls existing count repos in a loop (server-side N+1, but one HTTP round-trip and no Firestore from client), or (b) uses denormalized counts on session docs (single session query with no per-session count queries). Response: list of sessions with open/resolved (and optionally total) per session. Client then calls this single API instead of session list + N count calls.  
- **Benefit:** One HTTP request, no client-side N+1, and if session has `openCount`/`resolvedCount`, the server can do one session query with no feedback reads.

**Overview:**  
- **Current:** Client runs `useSessionOverview` which does multiple lib calls (session, counts, totalCount, recent feedback, open/resolved preview, recent comments, then getFeedbackByIds). All from client to Firestore (or via API if overview ever goes through API).  
- **Structural change:** A **single API** (e.g. `GET /api/sessions/[id]/overview`) that runs the same logic server-side: one session read, one count read (and derive total), limited feedback and comment reads, build activity and tag counts, return one DTO. Client calls this once. Removes redundant total count and reduces round-trips.

**Session page feedback list:**  
- **Current:** First page is loaded via API; API does page + count + counts (three reads).  
- **Structural change:** Either (1) have GET `/api/feedback` return counts only when first page is requested and derive total from open+resolved (drop `getSessionFeedbackCountRepo` when counts are already fetched), or (2) add denormalized `feedbackCount`/`openCount`/`resolvedCount` on session and have the API read session once for counts and feedback collection for the page only.

### 3. Where limits block scalability

**50 sessions (dashboard):**  
- **Location:** `useWorkspaceOverview`: `SESSION_LIMIT = 50` in `getUserSessions(uid, SESSION_LIMIT)`.  
- **Effect:** Sessions beyond the 50 most recently updated (by `updatedAt`) never appear in the list. No pagination, no “load more,” no indication that more sessions exist.  
- **Structural change:** (1) **Cursor-based pagination** for sessions: `getUserSessionsRepo(userId, pageSize, cursor)` where cursor is e.g. `updatedAt` + sessionId; return `nextCursor` and `hasMore`. Client (or aggregation API) requests pages until done. (2) Optional: **“Archived” or “All”** view with its own query and pagination so users can access older sessions. (3) Keep a reasonable page size (e.g. 20–50) per request to bound read cost and UI size.

**200 feedback items (session page):**  
- **Location:** `useSessionFeedbackPaginated`: `FEEDBACK_LOAD_CAP = 200`; infinite scroll stops after 200 items; “Reached maximum items” is shown.  
- **Effect:** Feedback items beyond 200 are never loaded in the sidebar; “Mark all as resolved” and search only apply to the loaded set; total/active/resolved in the UI can reflect server totals but the list is truncated.  
- **Structural change:** (1) **Remove or raise the cap** and rely on cursor-based pagination and virtualization (or lazy loading) so that “load more” can continue (with a high or no cap), and/or (2) **Server-side “mark all resolved”** for the session: API that resolves all open feedback for a session (in batches of 500 or less) so bulk action is not limited by the client’s loaded set. (3) **Search** should eventually be server-side (or external index) so results are not limited to the first 200 items.

**Overview:**  
- **Limits:** `RECENT_FEEDBACK_LIMIT = 5`, `getSessionFeedbackByResolved(..., 3)`, `RECENT_ACTIVITY_LIMIT = 10`, `getFeedbackByIds(..., 10)`. These are intentional and small; they don’t block scalability of the dashboard as a whole but define the size of the overview payload.

### 4. Structural solutions (no code)

**Cursor-based pagination for sessions:**  
- **Sessions:** Add optional cursor (e.g. `updatedAt` + sessionId) to `getUserSessionsRepo`; return `sessions`, `nextCursor`, `hasMore`. API (e.g. `GET /api/sessions?cursor=&limit=20`) returns same. Client or dashboard API requests pages and appends or replaces. Enables “load more” and access beyond 50 sessions.

**Cursor-based pagination for feedback:**  
- **Already in place:** GET `/api/feedback` uses `cursor` and `limit`; repo uses `getSessionFeedbackPageWithStringCursorRepo`. The only hard block is the client-side 200 cap. Structurally: remove or increase the cap and allow more pages; optionally add a “resolve all in session” API so bulk action is not tied to loaded count.

**Server aggregation / batch APIs:**  
- **Dashboard:** One API that returns “sessions for user with counts” (and optionally global stats). Implementation: either (1) denormalized counts on session (one session query, no feedback reads), or (2) server runs session query then count queries (or aggregation) and returns combined DTO.  
- **Overview:** One API that returns full overview payload for a session (session, counts, previews, recent activity, tag counts) in one response.  
- **Global metrics:** One API that returns total open, total resolved, session count, “sessions with open” (and optionally completion %) using either denormalized counters or server-side aggregation over sessions + feedback.

**Denormalized counters on session:**  
- **Fields:** `openCount`, `resolvedCount` (or just `feedbackCount` and derive open/resolved from status if needed). Updated on: feedback create (increment feedbackCount, increment openCount), feedback delete (decrement, and decrement open or resolved), feedback status change open→resolved (decrement openCount, increment resolvedCount) and resolved→open (reverse). Write path: in `addFeedbackRepo` (or call from addFeedback), `deleteFeedbackRepo`, `updateFeedbackRepo` (when status changes), update the session doc (or use a transaction/batch). Requires care for consistency (e.g. transaction with feedback write).  
- **Benefit:** Dashboard and “sessions with open” and “sort by open count” become one session query; no per-session feedback count reads. Optional: same idea for `lastActivityAt` if different from `updatedAt`.

---

## STEP 3 — BULK ACTION FOUNDATION

### Multi-select sessions

**Current:** No multi-select. Session actions are per session: PATCH `/api/sessions/[id]` (title, archived), DELETE `/api/sessions/[id]`.  
**Required:**  
- **Client:** State for “selected session IDs” (e.g. Set or array), checkboxes or shift-click on cards, “Select all on page” if pagination exists. No backend change for “selection” itself.  
- **Backend:** **Bulk endpoints** that accept a list of session IDs and perform one action.  
  - **Bulk archive:** e.g. `POST /api/sessions/bulk-archive` body `{ sessionIds: string[] }`. Server: for each id, verify ownership (session.userId === auth.uid), then `updateSessionArchivedRepo(id, true)`. Firestore: up to 500 writes per batch; if more, use multiple batches.  
  - **Bulk delete:** e.g. `POST /api/sessions/bulk-delete` body `{ sessionIds: string[] }`. Server: for each id, verify ownership, then `deleteSessionRepo(sessionId)` (each delete already does feedback + comments + views + session doc). Cannot batch different docs in one transaction arbitrarily; run deletes in parallel or in batches (e.g. 10 at a time) to avoid timeout.  
- **Structural change:** New API routes; repo layer can stay single-session (loop from API) or add `updateSessionArchivedRepo`-style bulk helpers that take an array and do batched writes. No new Firestore fields; same security rule: only session owner.

### Multi-select feedback

**Current:** No multi-select. Feedback actions are per item: PATCH `/api/tickets/[id]` (title, description, actionSteps, suggestedTags, isResolved).  
**Required:**  
- **Client:** State for “selected feedback IDs” (e.g. Set), checkboxes or shift-click in sidebar list, “Select all” / “Select all on page.” Selection is per session (sidebar is per session).  
- **Backend:** **Bulk endpoints** that accept a list of feedback IDs and perform one action. All must belong to the same session (or verify each feedback’s session belongs to the user).  
  - **Bulk resolve:** e.g. `POST /api/feedback/bulk-resolve` body `{ feedbackIds: string[], isResolved: boolean }`. Server: verify each feedback exists, session ownership, then for each call `updateFeedbackRepo(id, { isResolved })`. Firestore: `updateDoc` per doc; batch up to 500 in a single `writeBatch` if all in one batch, else chunk.  
  - **Bulk tag:** e.g. `POST /api/feedback/bulk-tag` body `{ feedbackIds: string[], suggestedTags: string[] }` (or `merge: boolean` to add to existing). Server: verify ownership per feedback, then `updateFeedbackRepo(id, { suggestedTags })` per doc. Same batching.  
- **Structural change:** New API routes; reuse `updateFeedbackRepo`. Optional repo helpers that take `feedbackIds[]` and updates in batches of 500. If session has denormalized `openCount`/`resolvedCount`, bulk resolve must update the session doc once (e.g. openCount -= resolvedCount, resolvedCount += resolvedCount for the batch) to keep counters correct.

### Bulk resolve

**Current:** Client-side “Mark all as resolved” loops over **loaded** feedback and calls PATCH `/api/tickets/[id]` for each (Promise.all). Limited to the 200 loaded items.  
**Required:**  
- **Option A (client-driven):** Keep current behavior but document that it only applies to loaded items; or increase/remove load cap so “all” is larger.  
- **Option B (server-driven):** **Session-level bulk resolve API** e.g. `POST /api/sessions/[sessionId]/resolve-all` (no body or `{ status: "resolved" }`). Server: (1) query feedback where sessionId = X and status = "open" (with limit e.g. 500 per batch), (2) batch update each to resolved, (3) if session has `openCount`/`resolvedCount`, update session doc once (e.g. set resolvedCount += batch size, openCount -= batch size, or recompute). Repeat until no more open feedback. Client calls this once; no limit by loaded count.  
- **Structural change:** New route and server-side loop over open feedback in batches. If denormalized counts exist, one session doc update per batch (or at end). No new Firestore fields beyond optional counters.

### Bulk tag

**Required:** Same as “Multi-select feedback” → bulk tag endpoint: `POST /api/feedback/bulk-tag` with `feedbackIds` and `suggestedTags`. Server validates ownership and batches `updateFeedbackRepo`. No new fields.

### Bulk archive

**Required:** Same as “Multi-select sessions” → bulk archive endpoint: `POST /api/sessions/bulk-archive` with `sessionIds`. Server validates ownership and calls `updateSessionArchivedRepo(id, true)` for each (or batched writes). No new fields.

---

**Summary of structural changes for bulk:**  
- New API routes: bulk-archive (sessions), bulk-delete (sessions), bulk-resolve (feedback), bulk-tag (feedback), and optionally resolve-all (session).  
- Client: selection state and UI for multi-select (no UI change in this report).  
- Repo: optional bulk helpers that take arrays and use Firestore batch write (500 max per batch).  
- If session has `openCount`/`resolvedCount`, bulk resolve (and resolve-all) must update those counters.

---

## STEP 4 — GLOBAL SEARCH FOUNDATION

### Search feedback title across all sessions

**Current Firestore structure:**  
- **feedback** collection: `sessionId`, `userId`, `title`, `description`, `createdAt`, `status`, etc.  
- Queries today: by `sessionId` (and optionally status, orderBy createdAt). No cross-session query.

**Can it support “search title across all sessions”?**  
- **Prefix match (title starts with):** Yes, with a new index. Query: feedback where `userId == uid` (owner of session; feedback.userId is creator, same as session owner in single-owner model) and `title >= searchTerm` and `title <= searchTerm + '\uf8ff'`. Requires **composite index**: `feedback` (`userId` ASC, `title` ASC). Firestore does not support “contains” or full-text; only range/prefix. So “title starts with X” works; “title contains X” does not.  
- **Contains / full-text:** No. Firestore has no full-text or substring index. To support “contains” or relevance search across title (and description), an **external search index** (e.g. Algolia, Meilisearch, Typesense, or Elasticsearch) is required: sync feedback docs (id, sessionId, userId, title, description, tags, etc.) to the engine; query the engine from an API; return matching feedback IDs (and optionally session info) and optionally load full docs from Firestore.

**Index / search strategy:**  
- **Firestore-only:** Add composite index `feedback` (`userId` ASC, `title` ASC). Implement e.g. `GET /api/search/feedback?q=...&userId=...` that runs a prefix range on title and returns matching feedback (with limit). Document that search is “starts with” only.  
- **Contains / full-text:** Ingest feedback into Algolia/Meilisearch (or similar). On feedback create/update/delete, write to the search engine (client or Cloud Function). Search API calls the engine and returns hits; optionally hydrate from Firestore. No new Firestore index for full-text; the engine is the source of truth for search.

### Search description

**Current:** `feedback.description` is stored but not indexed for search.  
**Can Firestore support it?** Not for “contains” or full-text. Range query on description (e.g. prefix) is possible in theory but description is long and prefix on description is rarely useful.  
**Strategy:** **External search engine required** (Algolia, Meilisearch, etc.). Index at least `feedbackId`, `sessionId`, `userId`, `title`, `description` (and optionally tags). Search API queries the engine; results can include snippet or full text from the index; full doc from Firestore if needed. Sync on feedback create/update/delete (via API or Cloud Function).

### Filter by tag globally

**Current:** `feedback.suggestedTags` is an array (e.g. `["Bug", "UX"]`). Firestore supports `array-contains`.  
**Can it support “filter by tag globally”?** Yes. Query: feedback where `userId == uid` and `array-contains(suggestedTags, "Bug")`. Requires **composite index**: `feedback` (`userId` ASC, `suggestedTags` ASC). One query returns all feedback (across all sessions) that have that tag. Pagination: add `limit` and optionally `orderBy` (e.g. `createdAt` desc) and cursor for next page.  
**New Firestore fields?** No. **Index:** Add the composite index above. No Algolia/Meilisearch required for tag filter; Firestore is sufficient.

---

**Summary:**

| Need | Firestore-only? | New index? | External search? |
|------|------------------|------------|------------------|
| Title prefix (starts with) across sessions | Yes | Yes: `feedback` (userId, title) | No |
| Title/description contains or full-text | No | — | Yes (Algolia/Meilisearch, etc.) |
| Filter by tag globally | Yes | Yes: `feedback` (userId, suggestedTags) | No |

**Would Algolia/Meilisearch be required?**  
- **Required** if the product needs: title or description “contains” search, relevance ranking, typo tolerance, or full-text across multiple fields.  
- **Not required** for: title prefix search, filter by tag, or filter by status/date with existing fields. Implement prefix + tag filter in Firestore first; add a search engine when product requirements demand full-text or better relevance.

---

**END OF REPORT**
