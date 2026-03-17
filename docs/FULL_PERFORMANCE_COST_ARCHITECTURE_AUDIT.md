# Echly — Full Performance, Cost & Architecture Audit

**Date:** March 17, 2025  
**Scope:** Next.js API, Firestore, Chrome extension, Dashboard web app  
**Priorities:** UX instant, backend efficient, Firestore cost controlled.

---

## 1. Executive Summary (Brutal)

The system has solid foundations (workspace cache, plan catalog cache, billing dedupe, denormalized session counters) but **several critical cost and UX issues will bite at scale**.

**Worst issues:**

1. **Dashboard load runs 200+ Firestore reads from the client** because it calls `getSessionFeedbackCounts(sessionId)` for every session (up to 50), each doing **4 count queries**, and **ignores the denormalized `openCount`/`resolvedCount` already on each session doc**. This is pure waste.

2. **Session page feedback is loaded twice**: once via API (first page + counts) and again via a client-side Firestore `onSnapshot` on the same feedback collection (up to 200 docs). You pay for API path reads and client listener reads.

3. **GET /api/feedback (Discussion inbox, no sessionId)** does an **N+1**: fetches up to 100 feedback items then `Promise.all(sessionIds.map(id => getSessionByIdRepo(id)))` — one session read per unique session. Same pattern could be batched or denormalized (session title on feedback).

4. **GET /api/admin/workspaces** is a **classic N+1**: for each workspace it does `getDoc(users, ownerId)` and `getWorkspaceSessionCountRepo(workspaceId)`. With 100 workspaces that’s 100 + 100 (+ up to 200 count queries if workspace counts not backfilled).

5. **Session delete** is sequential and capped: `deleteAllFeedbackForSessionRepo` and `deleteAllCommentsForSessionRepo` use `limit(500)`; sessions with >500 feedback or >500 comments are only partially deleted. View subcollection is deleted with one `getDocs` + N `deleteDoc` (no batched delete).

6. **Folders** are loaded with **unbounded** `getDocs(collection(db, "folders"))` from the client on dashboard load — no limit, no pagination.

7. **Insights API** runs 6 count queries + 3 large getDocs (500 feedback, 1000 comments, 200 sessions) per request — heavy and not cached.

**What’s good:** Workspace resolution cache (30s), plan catalog cache (5 min), billing usage cache (60s client), session creation in one transaction, feedback create/update/delete with session counters in transactions, cursor-based feedback pagination, and no Redis (as requested). Extension Start Session is a single POST and is fine.

**Verdict:** Fix the dashboard client Firestore usage (use session denormalized counts; consider moving session list to API). Eliminate double-load of feedback on session page. Fix N+1s in admin and Discussion inbox. Cap or paginate folders and fix session delete limits. Then re-measure.

---

## 2. System Score (1–10)

| Area | Score | Notes |
|------|-------|--------|
| **API performance** | 6 | Some waterfalls (e.g. feedback then session by id). Good use of Promise.all in places; N+1s in admin and Discussion. |
| **Firestore efficiency** | 4 | Dashboard does 200+ reads on load; 4 count queries per session when counts exist on session; double feedback load on session page; unbounded folders; Insights heavy. |
| **Cost efficiency** | 4 | Same as above: client-side count storm, N+1s, no use of denormalized counts on dashboard. |
| **Frontend performance** | 5 | Billing deduped; dashboard blocks on 50× count fetches; session page does API + listener; folders unbounded. |
| **UX responsiveness** | 6 | Start Session is one API call (good). Dashboard feels slow due to many counts; session page can show 0 then N (counts API helps but still two round-trips). |
| **Scalability readiness** | 4 | Delete session cap at 500; admin/workspaces N+1; dashboard and Insights will not scale without changes. |

**Overall (weighted toward UX + cost):** **4.8 / 10**

---

## 3. Top Critical Issues

1. **Dashboard: 50 × 4 Firestore count queries from client** — Sessions already have `openCount`/`resolvedCount`/`skippedCount`. `useWorkspaceOverview` ignores them and calls `getSessionFeedbackCounts(s.id)` for every session → 200 count reads per load. **Fix:** Use `session.openCount` / `session.resolvedCount` / `session.skippedCount` when present; only call counts API/repo when missing.

2. **Session page: feedback loaded twice** — `useSessionFeedbackPaginated` fetches first page + counts via API and also subscribes with `onSnapshot` to `feedback` (limit 200). Duplicate reads and double latency. **Fix:** Either use API-only with refetch, or listener-only; not both for the same list.

3. **GET /api/feedback (no sessionId): N+1 session reads** — After fetching workspace feedback (e.g. 100 items), code does `sessionIds.map(id => getSessionByIdRepo(id))` for session names. **Fix:** Denormalize `sessionTitle` (or sessionId → title map) on feedback, or batch session reads in one place.

4. **GET /api/admin/workspaces: N+1 per workspace** — For each workspace: `getDoc(users, ownerId)` and `getWorkspaceSessionCountRepo`. **Fix:** Batch user reads; use workspace’s own `sessionCount`/`archivedCount` when present (already used in repo) and avoid per-workspace count when possible.

5. **Session delete: 500-item cap and no batch deletes** — `deleteAllFeedbackForSessionRepo` and `deleteAllCommentsForSessionRepo` use `limit(500)` then `Promise.all(docs.map(deleteDoc))`. Sessions with >500 feedback or comments are partially deleted. **Fix:** Loop until no more docs, or use batched deletes; document the limit or make it configurable.

---

## 4. API Table

| API | Purpose | Est. time | Reads | Writes | Issues | Severity |
|-----|---------|-----------|-------|--------|--------|----------|
| **POST /api/sessions** | Create session | ~200–800ms | 1 user, 1 workspace (cached), 0–2 count (if no ws counts), 1 tx (session + ws update) | 1 session, 1 workspace update | Cold: resolveWorkspace + getWorkspaceSessionCount; warm: cached. | Low |
| **GET /api/sessions** | List sessions | ~150–600ms | resolveWorkspace (cached), 1 sessions query (≤100 docs) | 0 | Fallback: getUserSessions if workspace list empty (extra query). | Low |
| **GET /api/sessions/[id]** | Session metadata | ~80–300ms | 1 session, 1 workspace (resolveWorkspaceById), 0–1 user (if needed) | 0 | Sequential: getSession then resolve. | Low |
| **PATCH /api/sessions/[id]** | Update title/archived | ~150–400ms | 1 session, resolve, then 1–2 session, 0–1 workspace (tx) | 1–2 session, 0–1 workspace | PATCH reads session again after update. | Low |
| **DELETE /api/sessions/[id]** | Delete session | High | 1 session, N feedback (getDocs 500), N comments (500), M views (getDocs), 1 session, 1 workspace | N+M+2 | 500 cap; sequential deletes; N+1 on view deletes. | **High** |
| **GET /api/feedback** (sessionId) | Paginated feedback | ~100–400ms | 1 session, resolve, 0–1 cursor doc, 1 feedback query (limit), 0 or 4 count (if no denorm) | 0 | First page: session + counts (4 queries if no denorm). | Medium |
| **GET /api/feedback** (no sessionId) | Discussion inbox | ~200–800ms | resolve, 1 feedback query (100), **N getSessionById** (N = unique sessions) | 0 | **N+1 session reads.** | **High** |
| **GET /api/feedback/counts** | Counts for session | ~50–200ms | 1 session, resolve, 0 or 4 count queries | 0 | 4 count queries when session has no denorm counts. | Medium |
| **POST /api/feedback** | Create ticket | ~150–400ms | 1 session, resolve, 1 getFeedbackById after create | 0 | Tx: 1 feedback + 1 session update. Extra read for response. | Low |
| **GET /api/billing/usage** | Plan, usage, limits | ~100–400ms | resolve (cached), workspace (1), 0–2 count or planState (catalog cached) | 0 | Good: cache + parallel. | Low |
| **GET /api/workspace/status** | Suspended check | ~50–150ms | 1 user, 1 workspace | 0 | Fine. | Low |
| **GET /api/tickets/[id]** | Single ticket | ~80–250ms | 1 feedback, 1 session, resolve | 0 | Fine. | Low |
| **PATCH /api/tickets/[id]** | Update ticket | ~100–300ms | 1 feedback, 1 session (in tx), resolve | 1 feedback, 1 session | Tx for resolve/skip. | Low |
| **DELETE /api/tickets/[id]** | Delete ticket | ~100–300ms | 1 feedback, 1 session (tx) | 1 feedback, 1 session | Fine. | Low |
| **POST /api/extension/session** | Extension token | ~20–80ms | Session from cookie (no Firestore) | 0 | No DB. | Low |
| **GET /api/insights** | Analytics | **High** | resolve, **6 count** (feedback/comment/session × lifetime + 30d), **3 getDocs** (500 feedback, 1000 comments, 200 sessions) | 0 | **Heavy; not cached.** | **High** |
| **POST /api/session-insight** | AI summary | Variable | 1 session, 1 count, 1 feedback page (200) | 0–1 session | OpenAI call; cache when count matches. | Medium |
| **GET /api/admin/workspaces** | List workspaces | **High** | 1 plans (cached), **N workspaces**, **N users**, **N getWorkspaceSessionCount** | 0 | **N+1.** | **High** |
| **GET /api/admin/usage** | Admin usage | High | getDocs(workspaces) + per-workspace logic | 0 | Scale with workspace count. | Medium |
| **GET /api/plans/catalog** | Public catalog | ~50–150ms | 0 (cached) or 1 getDocs(plans) | 0 | Cached 5 min. | Low |
| **POST /api/structure-feedback** | Structure + create | Variable | resolve, then pipeline; create does tx | 0–1 feedback, 1 session | AI + DB. | Low |
| **POST /api/upload-screenshot** | Upload screenshot | Variable | — | Storage + optional doc | — | — |
| **GET /api/auth/session** | Session cookie | — | — | — | — | — |
| **GET/POST /api/cron/cleanup-temp-screenshots** | Cron | — | — | — | — | — |

---

## 5. Firestore Cost Analysis

### Collections (summary)

| Collection | Purpose |
|------------|--------|
| **users** | uid, workspaceId, profile; read for resolve + admin. |
| **workspaces** | Plan, usage, members, entitlements; read on resolve, billing, admin. |
| **sessions** | Session metadata; denormalized openCount, resolvedCount, skippedCount, feedbackCount. |
| **feedback** | Tickets; sessionId, workspaceId, status, commentCount, etc. |
| **comments** | Threads per feedback; sessionId, feedbackId. |
| **sessionViews** | Subcollection sessionViews/{sessionId}/views/{viewerId} for view count. |
| **folders** | Dashboard folders; sessionIds array; **client getDocs unbounded.** |
| **plans** | Plan catalog (cached 5 min). |
| **adminLogs** | Admin actions. |
| **screenshots** | Screenshot metadata (e.g. temp, attached). |

### Reads per user action (estimated)

| Action | Reads | Notes |
|--------|-------|--------|
| **Dashboard load (current)** | **1 user + 50 sessions + 50×4 = 200 count + folders** | Client-side; use session counts to drop 200. |
| **Start Session (extension)** | 0 client Firestore; server: 1 user, 1 workspace (cached), 0–2 count, 1 tx | OK. |
| **Open session page** | 2 API calls (counts + first page) + **onSnapshot feedback (≤200 docs)** | Double load: API + listener. |
| **First page feedback (API)** | 1 session, 1 feedback query (20), 0 or 4 count | OK if denorm. |
| **Discussion inbox (no sessionId)** | 1 feedback query (100) + **up to 100 getSessionById** | N+1. |
| **Billing usage** | 1 user, 1 workspace (or cached), 0–2 count, catalog cached | OK. |
| **Delete session** | 1 session + 500 feedback + 500 comments + M views + 1 + 1 | 500 cap; M view deletes. |

### Estimated cost per 1,000 users (rough)

- Assume 10 dashboard loads/user/day, 5 session opens, 2 Discussion loads, 2 session creates.
- **Current (with dashboard count storm):** 1000 × (10 × 251 + 5 × (2 + 200) + 2 × 200 + …) → on the order of **millions of reads/day** if many sessions; dashboard alone 10 × 251 × 1000 = 2.51M reads/day.
- **After using session denorm counts on dashboard:** Remove 200 reads per dashboard load → **~51 reads per load** → 10 × 51 × 1000 = 510k; large reduction.
- **Top 3 cost-heavy operations:** (1) Dashboard load (client counts), (2) Session page feedback (API + listener), (3) GET /api/feedback (no sessionId) N+1 + GET /api/insights.

### Waste sources

- **Dashboard:** Not using `session.openCount` / `resolvedCount` / `skippedCount`; calling `getSessionFeedbackCountsRepo` per session (4 count queries each).
- **Session page:** Same feedback loaded via API and via `onSnapshot`.
- **getSessionFeedbackCountsRepo:** Always runs 4 count queries when callers don’t pass session; session doc often has denorm counts.
- **Discussion GET /api/feedback:** Fetches session names with one getSessionById per unique session.
- **Admin workspaces:** One user read and one session count (or 2 count queries) per workspace.
- **Folders:** Unbounded `getDocs(collection(db, "folders"))` on client.

---

## 6. Frontend Issues

### Request timeline (dashboard load)

1. **Auth** (onAuthStateChanged).
2. **useWorkspaceOverview:**  
   - `getUserWorkspaceIdRepo(uid)` → 1 user read (client).  
   - `getWorkspaceSessions(workspaceId, 50)` → 1 query, 50 session docs (client).  
   - `Promise.all(sessions.map(s => getSessionFeedbackCounts(s.id)))` → **50 × 4 = 200 count queries** (client).  
3. **loadFolders:** `getDocs(collection(db, "folders"))` → **unbounded** (client).  
4. **BillingUsageProvider:** `getBillingUsageCached(authFetch("/api/billing/usage"))` → 1 API call (deduped 60s).  
5. **listenToWorkspace** → realtime listener (no extra read after first).

So: **251+ reads + unbounded folders** from client before dashboard is ready.

### Duplicate / redundant calls

- **Session page:** First page + counts via API **and** `onSnapshot(feedback)` — same data from two paths.
- **Billing:** Deduped by `getBillingUsageCached` (good).
- **Dashboard counts:** Redundant with session doc fields; 200 count queries are duplicate work.

### Suggestions

- **Dashboard:** Use `session.openCount` / `resolvedCount` / `skippedCount`; remove per-session `getSessionFeedbackCounts` when present. Optionally move session list to GET /api/sessions and return counts on each session (server uses denorm).
- **Session page:** Choose one: either load feedback only via API (with refetch or polling) or only via listener; remove the other.
- **Folders:** Add `limit(L)` and/or pagination; avoid unbounded getDocs.
- **Request deduplication:** Already good for billing; consider short-lived dedupe for GET /api/feedback?sessionId=X (e.g. 2s) if multiple components request same session.

---

## 7. UX Issues

| # | Delay | Where | Severity |
|---|--------|--------|----------|
| 1 | Dashboard shows loading until 50× count queries finish (200 Firestore reads from client) | Dashboard load | **High** |
| 2 | Session page: counts can show 0 then update (counts API + first page race with listener) | Session page | Medium |
| 3 | First feedback list paint waits for both counts API and first-page API (or listener) | Session page | Medium |
| 4 | Discussion inbox: N+1 session reads add latency before list is ready | Discussion | Medium |
| 5 | Start Session (extension): Single POST is fast; UX only affected if network or server is slow | Extension | Low |

**Recommendation:** Fix dashboard counts (use denorm) for the biggest perceived improvement; then unify session page data source to avoid double load and count flicker.

---

## 8. Disaster Risks (“Will Break at Scale”)

- **Firestore query in loop:** **GET /api/admin/workspaces** — for each workspace: `getDoc(users, ownerId)` and `getWorkspaceSessionCountRepo`.  
- **Fetching large collections:** **Folders** — `getDocs(collection(db, "folders"))` with no limit.  
- **No pagination:** Folders; admin workspaces returns all workspaces in one response.  
- **Large payloads:** GET /api/sessions returns up to 100 sessions; GET /api/feedback can return 100 items; Insights returns big JSON.  
- **Sequential dependent API calls:** Session page: counts then first page (can be parallel); dashboard is parallel but 50 count calls.  
- **Missing indexes:** Composite indexes for feedback (sessionId, status, createdAt), comments (sessionId, feedbackId, createdAt), etc. — repo assumes they exist; if not, queries fail or are slow.  
- **Delete session:** **500-item cap** — sessions with >500 feedback or >500 comments leave orphaned data; view deletes are N single-doc deletes.

---

## 9. Recommended Fix Priority Order

1. **Dashboard: use denormalized session counts**  
   In `useWorkspaceOverview` (or `loadSessionsAndCounts`), when `session.openCount` / `resolvedCount` / `skippedCount` are present, use them and **do not** call `getSessionFeedbackCounts(s.id)`. Only call for sessions missing these fields.  
   **Impact:** Removes ~200 Firestore reads per dashboard load; big cost and UX win.

2. **Session page: single source for feedback list**  
   Either remove the `onSnapshot` and use only API (with refetch on create/update), or remove the initial API first-page and rely on listener; avoid loading the same list twice.  
   **Impact:** Cuts duplicate reads and simplifies UX (no count flicker from two sources).

3. **GET /api/feedback (no sessionId): remove N+1**  
   Denormalize `sessionTitle` (or similar) on feedback when creating/updating, or batch-load sessions by id and pass a map; stop one getSessionById per unique session.  
   **Impact:** Fewer reads and faster Discussion load.

4. **GET /api/admin/workspaces: batch user reads and use workspace counts**  
   Collect all `ownerId`s, batch getDoc(users, id) (or use a single query if possible), and use workspace’s `sessionCount`/`archivedCount` in getWorkspaceSessionCountRepo when available (already implemented in repo); avoid per-workspace count when not needed.  
   **Impact:** Admin page scales with workspace count.

5. **Folders: limit and/or paginate**  
   Add `limit(100)` (or similar) and/or pagination to folder listing; never unbounded getDocs.  
   **Impact:** Prevents cost explosion as folders grow.

6. **Session delete: handle >500 feedback/comments and view deletes**  
   Loop until no feedback/comments left (or use batched deletes); document or make limit configurable; consider batched deletes for view subcollection.  
   **Impact:** Correctness and scalability.

7. **Insights: cache or lighten**  
   Cache GET /api/insights per user (e.g. 5–10 min) or reduce limits (e.g. 100 feedback, 200 comments); keep 6 count queries.  
   **Impact:** Lower cost and faster Insights page.

8. **GET /api/feedback/counts and first-page: use session denorm**  
   API already uses session.openCount when present; ensure all sessions are backfilled so 4 count queries are rare.  
   **Impact:** Fewer count queries on session and counts endpoints.

9. **Optional: Dashboard session list via API**  
   Replace client-side getWorkspaceSessions + getSessionFeedbackCounts with GET /api/sessions returning sessions with denormalized counts; single server-side path and one client request.  
   **Impact:** Simpler client and consistent caching.

10. **Indexes**  
    Ensure Firestore composite indexes exist for feedback (sessionId, status, createdAt), comments (sessionId, feedbackId, createdAt), sessions (workspaceId, archived, updatedAt), etc.  
   **Impact:** Prevents runtime failures and slow queries.

---

*End of audit.*
