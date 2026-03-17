# Echly — Full System Performance + Cost Audit (Read-only)

Date: 2026-03-17  
Scope: **Full Echly codebase forensic audit** (Next.js App Router, Firebase Auth, Firestore, Storage)  
Constraints respected: **no code modified**, **no dependencies installed**, **only one new file** created.

---

## 1. Executive Summary

### Top 5 performance issues (most likely to cause slow UX / >500ms)

- **Realtime “feedback list” listener loads up to 200 docs per session and re-renders on any change**  
  - **Where**: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`  
  - **Why it’s slow**: `onSnapshot(query(collection("feedback"), where("sessionId","==",...), limit(200)))` means every ticket edit/resolve can push **up to 200 documents** to the client again (plus local sorting + derived counts). This is “fast enough” for small sessions but scales poorly and amplifies perceived latency when many tickets exist or multiple edits happen in quick succession.

- **Sessions pages do an N×(count queries) pattern for counts**  
  - **Where**: `app/(app)/dashboard/sessions/page.tsx`, `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`, `lib/feedback.ts`, `lib/repositories/feedbackRepository.ts`  
  - **Why it’s slow**: For each session (up to 50), `getSessionFeedbackCountsRepo()` runs **3 aggregation queries** (`getCountFromServer`) unless denormalized counters exist. That can become **150 Firestore RPCs** on a single page load.

- **Ticket PATCH path performs multiple sequential Firestore reads before the write transaction**  
  - **Where**: `app/api/tickets/[id]/route.ts`  
  - **Why it’s slow**: `requireAuth` → ownership read (`getFeedbackByIdRepo`) → session read (`getSessionByIdRepo`) → optional user doc read (`getUserWorkspaceIdRepo`) → workspace read (`resolveWorkspaceById` → `getWorkspace`) → then a transaction (multiple reads inside) → then re-read ticket. This is a long **sequential await chain**.

- **Admin endpoints do full collection scans and per-doc follow-up reads (platform-wide N+1)**  
  - **Where**: `app/api/admin/usage/route.ts`, `app/api/admin/workspaces/route.ts`  
  - **Why it’s slow**: `getDocs(collection(db,"workspaces"))` scans all workspaces; `admin/workspaces` then `getDoc(users/{ownerId})` per workspace + session count calculation. This will exceed 500ms quickly as you add customers.

- **Insights page duplicates data sources: API fetch + realtime snapshot + extra realtime session title query**  
  - **Where**: `app/(app)/dashboard/insights/page.tsx`, `app/api/insights/route.ts`  
  - **Why it’s slow**: page runs `authFetch("/api/insights")` then also subscribes `onSnapshot(workspaces/{uid}/insights/main)` and `onSnapshot(query(sessions where documentId in top5))`. You pay both network + realtime reads; state is updated twice.

### Top 5 cost leaks (Firestore / network / AI)

- **Sessions pages: 150 aggregation queries per load is a cost hotspot**  
  - **Where**: `app/(app)/dashboard/sessions/page.tsx`, `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`  
  - **Impact**: Aggregation queries cost money and add latency; doing them per-session multiplies cost by session count.

- **Realtime feedback listener pulls up to 200 docs repeatedly**  
  - **Where**: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`  
  - **Impact**: Each snapshot update can bill for reads of changed docs and can push large payloads; the “limit 200” is a safety cap but still expensive at scale.

- **Folders are fetched with an unbounded `getDocs(collection("folders"))`**  
  - **Where**: `app/(app)/dashboard/page.tsx`, `app/(app)/dashboard/sessions/page.tsx`  
  - **Impact**: Full collection scans. Also appears **not scoped by workspace/user**, which risks both cost and data exposure depending on security rules.

- **Discussion inbox endpoint enriches feedback with session titles via N+1 `getSessionByIdRepo` calls**  
  - **Where**: `app/api/feedback/route.ts` (no `sessionId` path)  
  - **Impact**: For up to `limit` feedback items, it fetches sessions for unique `sessionId`s via `Promise.all(sessionIds.map(getSessionByIdRepo))`.

- **AI endpoint `/api/session-insight` reads up to 200 feedback items then calls OpenAI**  
  - **Where**: `app/api/session-insight/route.ts`  
  - **Impact**: Firestore reads + OpenAI cost. It does caching (stored on session doc), but the trigger logic in `SessionPageClient.tsx` will call it when counts drift.

---

## 2. API Performance Table (All `/app/api/*` routes)

Estimates assume a “typical” Firestore region roundtrip and small documents. **Severity** reflects both latency + scaling risk.

| Endpoint | File | Est. Latency | Firestore Ops (reads/writes) | Issues | Severity |
|---|---|---:|---|---|---|
| `GET /api/insights` | `app/api/insights/route.ts` | 80–250ms | **1 read** (`getDoc(workspaces/{ws}/insights/main)`) | Server cache is per-process only; frontend also does realtime read (duplicate) | MEDIUM |
| `GET /api/sessions` | `app/api/sessions/route.ts` | 200–700ms | auth + workspace resolve (**1–2 reads**) + sessions list (`getDocs` up to 100) | Workspace resolve can add extra reads; no response caching | MEDIUM |
| `POST /api/sessions` | `app/api/sessions/route.ts` | 300–1500ms | workspace resolve (**1–2 reads**) + optional count fallback (**2 count queries**) + **1 transaction write** | Limit check may trigger slow fallback; sequential awaits; Firestore transaction | HIGH |
| `GET /api/sessions/:id` | `app/api/sessions/[id]/route.ts` | 200–600ms | auth + session read (**1**) + possibly user doc read (**1**) + workspace read (**1**) | Multiple sequential reads; workspace check per request | MEDIUM |
| `PATCH /api/sessions/:id` | `app/api/sessions/[id]/route.ts` | 300–900ms | session read (**1**) + workspace checks (**1–2**) + update(s) (**1–2 writes**) + reread (**1**) | Sequential awaits; double-read pattern | HIGH |
| `DELETE /api/sessions/:id` | `app/api/sessions/[id]/route.ts` | 2s–20s | session read (**1**) + deletes across collections (`feedback`, `comments`, `sessionViews`) + workspace updates | Deletes are batched via `Promise.all` but still heavy; will scale badly | CRITICAL |
| `GET /api/tickets/:id` | `app/api/tickets/[id]/route.ts` | 250–800ms | feedback read (**1**) + session read (**1**) + maybe user doc read (**1**) + workspace read (**1**) | Sequential reads; ownership + workspace gating | HIGH |
| `PATCH /api/tickets/:id` | `app/api/tickets/[id]/route.ts` | 400ms–20s* | **2–4 reads before write** + **transaction reads/writes** + reread (**1**) | Transaction on hot docs (session counters + insights) can retry; sequential awaits | CRITICAL |
| `DELETE /api/tickets/:id` | `app/api/tickets/[id]/route.ts` | 500ms–5s | feedback read (**1**) + session read (**1**) + workspace read (**1**) + **transaction delete/update** | Transaction cost + reread patterns; updates counters | HIGH |
| `GET /api/feedback` (session list) | `app/api/feedback/route.ts` | 300ms–1.5s | session read (**1**) + workspace read (**1**) + feedback page query (`getDocs limit+1`) + optional counts | First page may trigger 3 aggregation counts if session counters missing | HIGH |
| `GET /api/feedback` (inbox) | `app/api/feedback/route.ts` | 400ms–2s | workspace resolve (**1–2**) + feedback query (limit) + **N session reads** | Classic N+1 for session titles | HIGH |
| `POST /api/feedback` | `app/api/feedback/route.ts` | 600ms–3s | session read (**1**) + workspace read (**1**) + **transaction write** (feedback+session+workspace+insights) + reread feedback (**1**) | Multi-doc transaction and denormalized updates | CRITICAL |
| `GET /api/feedback/counts` | `app/api/feedback/counts/route.ts` | 200–900ms | session read (**1**) + workspace read (**1**) + optional 3 aggregation queries | Used by some UI flows; can be expensive if counters not present | HIGH |
| `POST /api/structure-feedback` | `app/api/structure-feedback/route.ts` | 1s–15s | workspace resolve (**1–2**) + OpenAI calls via pipeline | AI latency dominates; rate limit is in-memory only | CRITICAL |
| `POST /api/session-insight` | `app/api/session-insight/route.ts` | 800ms–8s | session read (**1**) + workspace read (**1**) + feedback count (**1 aggregation**) + feedback page (limit 200) + OpenAI + session update (**1 write**) | Can be triggered repeatedly when counts drift; OpenAI cost | HIGH |
| `GET /api/billing/usage` | `app/api/billing/usage/route.ts` | 200–1200ms | workspace resolve (**1–2**) + session count (fast if fields, else 2 aggs) + entitlements lookups | Client has shared cache (`lib/cachedBillingUsage.ts`) but server is uncached | MEDIUM |
| `GET /api/plans/catalog` | `app/api/plans/catalog/route.ts` | 50–300ms | depends on `getPlanCatalog()` (may read Firestore plans) | Fine; should be cacheable (catalog rarely changes) | LOW |
| `POST /api/upload-screenshot` | `app/api/upload-screenshot/route.ts` | 1s–10s | session read + workspace read + screenshot doc read/write + Storage upload | Storage upload dominates; Firestore adds overhead | HIGH |
| `POST /api/upload-attachment` | `app/api/upload-attachment/route.ts` | 1s–10s | auth only + Storage upload | Upload cost; no Firestore | MEDIUM |
| `POST /api/auth/session` | `app/api/auth/session/route.ts` | 150–700ms | **0 Firestore** | `verifyIdToken` uses remote JWKS; cookie signing | MEDIUM |
| `POST /api/auth/logout` | `app/api/auth/logout/route.ts` | 20–80ms | **0 Firestore** | none | LOW |
| `GET /api/workspace/status` | `app/api/workspace/status/route.ts` | 200–700ms | auth + user doc read (**1**) + workspace read (**1**) | Could be cached short-term | MEDIUM |
| `POST /api/extension/session` | `app/api/extension/session/route.ts` | 50–250ms | **0 Firestore** | Uses signed session cookie; good | LOW |
| `GET /api/admin/me` | `app/api/admin/me/route.ts` | 250–800ms | auth + admin check user doc read (**1**) | Admin check hits Firestore every time | MEDIUM |
| `GET /api/admin/usage` | `app/api/admin/usage/route.ts` | 2s–60s | **full scan workspaces** + per-workspace counts | Will fall over with growth | CRITICAL |
| `GET /api/admin/workspaces` | `app/api/admin/workspaces/route.ts` | 2s–60s | **scan workspaces** + N owner reads + per-workspace session counts | Multiple nested awaits in loop | CRITICAL |
| `POST /api/admin/workspaces/actions` | `app/api/admin/workspaces/actions/route.ts` | 300–1500ms | workspace read + update write + admin log write | Fine but invalidates workspace cache globally | MEDIUM |
| `GET/PATCH /api/admin/plans` | `app/api/admin/plans/route.ts` | 150–800ms | plans collection read/write + admin log write | Should be low frequency | LOW |
| `POST /api/admin/update-plan` | `app/api/admin/update-plan/route.ts` | 250–1200ms | workspace read + write + catalog read | Used by owners, not just admins | MEDIUM |
| `GET/POST /api/cron/cleanup-temp-screenshots` | `app/api/cron/cleanup-temp-screenshots/route.ts` | 1s–60s | query TEMP screenshots + per-record delete + Storage delete | Query is unbounded then filtered in app code | HIGH |

\* 20s observed symptom: see section **7**.

---

## 3. Firestore Cost Risks (Queries, Scans, N+1, Over-fetch)

### High-risk patterns found

- **Unbounded collection scans**
  - `app/api/admin/usage/route.ts`: `getDocs(collection(db,"workspaces"))` (scan all workspaces)
  - `app/api/admin/workspaces/route.ts`: same scan, plus per-workspace owner lookup
  - `app/(app)/dashboard/page.tsx` and `app/(app)/dashboard/sessions/page.tsx`: `getDocs(collection(db,"folders"))` (scan all folders)
  - `lib/repositories/screenshotsRepository.ts`: `getTempScreenshotsOlderThanRepo` runs `where(status=="TEMP")` then filters by createdAt in code (no query bound on time)

- **N+1 document reads**
  - `app/api/feedback/route.ts` (inbox mode): after fetching feedback list, it does `Promise.all(sessionIds.map(getSessionByIdRepo))`
  - `app/api/admin/workspaces/route.ts`: per-workspace `getDoc(users/{ownerId})`

- **Repeated reads of the same document in a single request**
  - `app/api/tickets/[id]/route.ts` PATCH: reads feedback for ownership, then later transaction reads feedback again, then rereads after update via `getFeedbackByIdRepo(id)`.
  - `app/api/feedback/route.ts` POST: writes via transaction then rereads created ticket.

- **Firestore inside loops (server-side)**
  - `app/api/admin/workspaces/route.ts`: per workspace, sequential `getDoc(users/{ownerId})` + `getWorkspaceSessionCountRepo(...)` in a `for` loop
  - `app/api/admin/usage/route.ts`: loop over workspaces + additional per workspace async calls

- **Realtime listener over-fetch**
  - `useSessionFeedbackPaginated.ts`: `onSnapshot(... limit(200))` with no `orderBy` and then sorts client-side; repeated large payloads.

### “Missing projections / overfetching”

Firestore SDK returns whole documents; the code frequently pulls full docs even when only a few fields are needed:

- Workspaces: `getWorkspace(workspaceId)` returns the whole workspace doc; many endpoints only need `billing.suspended` or entitlements.
- Feedback: `getFeedbackByIdRepo` reads full feedback doc for ownership checks, when ownership could be checked via an indexed field in a lighter read (still a doc read, but fewer bytes over wire).

### Cost severity by endpoint (summary)

- **LOW**: `auth/logout`, `extension/session`, `plans/catalog` (depending on catalog backend)
- **MEDIUM**: `insights`, `sessions GET`, `billing/usage`, `workspace/status`
- **HIGH**: `tickets GET`, `tickets PATCH/DELETE`, `feedback GET/POST`, `session-insight`, `upload-screenshot`
- **CRITICAL**: admin scans (`admin/usage`, `admin/workspaces`), session delete, structure-feedback (AI + pipeline), any route that triggers multi-doc transactions frequently at scale

---

## 4. Duplicate Request Map (Frontend + API)

### Insights page (`/dashboard/insights`)

- **Duplicate source-of-truth fetch**
  - **Where**: `app/(app)/dashboard/insights/page.tsx`
  - **Calls**
    - `authFetch("/api/insights")` on mount
    - `onSnapshot(workspaces/{uid}/insights/main)` also on mount
  - **Result**: The page fetches the same logical data twice, and then maintains it via realtime anyway.

- **Extra realtime read for session titles**
  - **Where**: `app/(app)/dashboard/insights/page.tsx`
  - **Call**: `onSnapshot(query(collection("sessions"), where(documentId(),"in", top5)))`
  - **Result**: Additional live queries per user; can be OK but adds cost and complexity.

### Dashboard layout (`/dashboard`)

- **Folders full scan duplicated across pages**
  - **Where**: `app/(app)/dashboard/page.tsx` and `app/(app)/dashboard/sessions/page.tsx`
  - **Call**: `getDocs(collection(db,"folders"))`
  - **Result**: Two separate pages repeat the same expensive operation (and it is unbounded).

- **Sessions + counts strategy can duplicate work**
  - **Where**: `useWorkspaceOverview.ts` used by dashboard page, plus sessions page has its own `loadSessionsAndCounts`.
  - **Result**: Similar “load sessions then load counts” logic exists in more than one place, increasing request volume and making caching harder.

### Session page (`/dashboard/[sessionId]`)

- **API and Firestore both used for “the same entity”**
  - **Where**: `SessionPageClient.tsx` uses `getDoc(doc(db,"sessions",sessionId))` directly, while most other things use API routes with `requireAuth` + workspace checks.
  - **Result**: Mixed access patterns make it easier to accidentally double-fetch or introduce inconsistent auth/caching behavior.

### Discussion page components

- **Ticket details fetched even when ticket is already present in a list**
  - **Where**: `components/discussion/TicketDetailsPanel.tsx` calls `authFetch("/api/tickets/:id")` on selection changes.
  - **Risk**: If the discussion list already has the needed fields, this is redundant.

---

## 5. Auth Inefficiencies

### Where auth happens

- **Primary server auth**: `lib/server/auth.ts`
  - `requireAuth(request)` checks:
    - `Authorization: Bearer <token>` → attempts `verifyIdToken(token)` (Firebase JWKS)  
    - if that throws, attempts `verifyExtensionToken(token)` (HMAC secret)  
    - else falls back to cookie session: `getSessionUser(request)` (`lib/server/session.ts`)

### Inefficiencies / overhead risks

- **Per-request token verification without shared request-scope memoization**
  - Every API handler calls `requireAuth` independently.
  - If a single request chain hits multiple endpoints on initial load, you pay repeated `jwtVerify` work each time.

- **Firebase JWKS remote dependency**
  - `createRemoteJWKSet(...)` is used in `lib/server/auth.ts`. JOSE typically caches keys, but cold starts or cache misses can add noticeable latency.

- **Admin auth adds an extra Firestore read**
  - `requireAdmin` in `lib/server/adminAuth.ts` does `getDoc(users/{uid})` to check `isAdmin`.
  - Admin pages that call multiple admin endpoints can amplify this.

### Estimated auth overhead impact

- **Typical**: 10–60ms CPU + small overhead  
- **Worst case** (cold start / JWKS fetch / network hiccup): can contribute **hundreds of ms**, and when combined with long Firestore chains can push endpoints over 500ms.

---

## 6. Caching Gaps (and what exists already)

### Caching that already exists

- **Server cache (in-process)**
  - `GET /api/insights`: 5s in-memory Map cache  
    - `app/api/insights/route.ts` (`INSIGHTS_CACHE_TTL_MS = 5_000`)
  - `resolveWorkspaceForUser`: 30s in-memory cache + in-flight dedupe  
    - `lib/server/resolveWorkspaceForUser.ts`

- **Client dedupe cache**
  - `/api/billing/usage`: shared dedupe + TTL 60s  
    - `lib/cachedBillingUsage.ts` + `lib/hooks/useBillingUsage.ts` + `lib/billing/BillingUsageProvider.tsx`

- **Client auth token caching**
  - `authFetch` caches Firebase ID tokens until expiry  
    - `lib/authFetch.ts`

### Major caching gaps

- **`/api/sessions` and `/api/feedback` have no cache and are called from multiple surfaces**
  - The UI relies on Firestore listeners in some places and API pagination in others; you don’t get consistent cache benefits.

- **`/api/plans/catalog` is a strong cache candidate**
  - Catalog rarely changes; currently marked `force-dynamic`. This increases request volume without strong benefit.

- **Admin endpoints**
  - Scans are inherently expensive; caching responses (short TTL) could reduce repeated admin page refresh cost.

---

## 7. 20s Ticket Issue Analysis (Most likely root causes ranked)

Symptom: “Ticket update delay ~20s” — most plausibly refers to `PATCH /api/tickets/:id`.

### Root cause candidates (ranked)

1) **Firestore transaction contention + retries on hot documents (sessions + insights)**
   - **Where**:
     - `app/api/tickets/[id]/route.ts` calls `updateFeedbackResolveAndSessionCountersRepo` when status changes
     - `lib/repositories/feedbackRepository.ts` (`updateFeedbackResolveAndSessionCountersRepo`) transaction reads/writes:
       - `feedback/{id}` (read + optional update)
       - `sessions/{sessionId}` (read + update computed counters)
       - `workspaces/{workspaceId}/insights/main` (read + update increments) when present
   - **Why it can hit ~20s**: Transactions can retry when documents change concurrently. If multiple clients are resolving tickets or comments are updating session/insights frequently, contention can produce multi-second retries.

2) **Long sequential Firestore chain before the transaction even begins**
   - **Where**: `app/api/tickets/[id]/route.ts` PATCH  
   - **Chain**: auth → `getFeedbackByIdRepo` → `getSessionByIdRepo` → optional `getUserWorkspaceIdRepo` → `getWorkspace` → transaction → reread ticket  
   - **Impact**: Even “normal” 150–300ms per step can stack, and any slow read turns into seconds.

3) **Client-side perceived delay due to heavy realtime listener payload and UI work**
   - **Where**: `useSessionFeedbackPaginated.ts` onSnapshot loads/sorts up to 200 docs and recomputes counts on any update  
   - **Impact**: Even if the PATCH returns quickly, the UI may feel delayed if the main thread is busy reprocessing large arrays or React is re-rendering deep trees.

4) **Network timeout / retry behavior on the client**
   - **Where**: `lib/authFetch.ts` default timeout is **25s** (`DEFAULT_TIMEOUT_MS = 25000`)  
   - **Impact**: A request that regularly approaches that threshold looks like “~20s delay” in practice; some flows set `timeout: 60000` for bulk updates (`SessionPageClient.tsx` mark-all-resolved).

5) **Background side effects triggered by ticket changes (secondary)**
   - Ticket updates indirectly drive:
     - session ordering updates (`updateSessionUpdatedAtRepo`)
     - insights increments (when status changes)
   - If combined with other activity (comments, insight generation), the system can become “write-hot”.

---

## 8. Top 10 Fixes (Ranked by Impact)

Each item is a suggested change; **not applied** here (audit only).

1) **Replace per-session aggregation counts on sessions pages with denormalized counters**
   - **What**: Ensure `sessions.openCount/resolvedCount/skippedCount` are always present and trusted; remove fallback `getCountFromServer` loops.
   - **Why**: Eliminates the 150-RPC load pattern on sessions listing.
   - **Impact**: **CRITICAL**

2) **Make feedback list listener incremental and ordered (avoid pushing 200 docs repeatedly)**
   - **What**: Use an `orderBy(createdAt desc)` query and listen only to newest N; fetch older pages via API on demand.
   - **Why**: Cuts realtime payload and UI work; reduces cost and perceived lag.
   - **Impact**: **CRITICAL**

3) **Reduce sequential awaits in `PATCH /api/tickets/:id`**
   - **What**: Collapse ownership/workspace checks; avoid rereads; consider using session/workspace IDs already embedded in feedback doc to skip extra reads.
   - **Why**: Shortens the critical path and reduces variance.
   - **Impact**: **HIGH**

4) **Decouple insights updates from ticket status transaction (eventual consistency)**
   - **What**: Move `insights/main` increments out of the resolve transaction (queue / background / separate write) or batch them.
   - **Why**: Removes a hot shared doc from a high-frequency transaction.
   - **Impact**: **CRITICAL**

5) **Scope and bound folders queries**
   - **What**: Query folders by `workspaceId` with a limit; avoid `getDocs(collection("folders"))`.
   - **Why**: Prevents full scans and potential data exposure; reduces cost.
   - **Impact**: **HIGH**

6) **Remove duplicate insights fetch (API + snapshot)**
   - **What**: Pick one source: either rely on realtime `onSnapshot` or keep API fetch and remove realtime.
   - **Why**: Cuts duplicate reads and state churn.
   - **Impact**: **HIGH**

7) **Add short TTL caching for `/api/plans/catalog` and `/api/workspace/status`**
   - **What**: Cache on server or via CDN/Next caching for endpoints with identical responses for short periods.
   - **Why**: Reduces repeated identical work.
   - **Impact**: **MEDIUM**

8) **Fix N+1 session title enrichment in `/api/feedback` inbox mode**
   - **What**: Return only sessionId and let client resolve titles from cached session list, or fetch titles in one query (where possible).
   - **Why**: Reduces extra reads proportional to unique sessions.
   - **Impact**: **MEDIUM–HIGH**

9) **Batch / parallelize server reads where safe**
   - **What**: Use `Promise.all` for independent reads (e.g., session + workspace) rather than serial awaits.
   - **Why**: Improves latency without changing billing.
   - **Impact**: **MEDIUM**

10) **Instrument and log transaction retry counts + timings on ticket PATCH**
   - **What**: Add server-side timing logs around the transaction and upstream reads; record retry counts if available.
   - **Why**: Confirms whether the 20s issue is contention vs network vs client perception.
   - **Impact**: **HIGH** (diagnostic)

---

## Appendix A — Firestore Hotspots by Feature

- **Tickets (feedback)**
  - Data: `feedback` collection
  - Hot docs: individual `feedback/{id}` + `sessions/{sessionId}` + `workspaces/{workspaceId}/insights/main`
  - Key code: `lib/repositories/feedbackRepository.ts`, `app/api/tickets/[id]/route.ts`

- **Sessions**
  - Data: `sessions` collection
  - Listing: `getWorkspaceSessionsRepo` / `getUserSessionsRepo` (`limit`, `orderBy(updatedAt desc)`)
  - Key code: `lib/repositories/sessionsRepository.ts`, `app/api/sessions/route.ts`

- **Comments**
  - Data: `comments` collection
  - Listener: `listenToCommentsRepo` is correctly limited to 100 and unsubscribes on change
  - Key code: `lib/repositories/commentsRepository.ts`, `useFeedbackDetailController.ts`

- **Insights**
  - Data: `workspaces/{workspaceId}/insights/main`
  - Reads: API `getDoc` + UI `onSnapshot`
  - Writes: increment on ticket create/comment create/resolve flows
  - Key code: `lib/repositories/insightsRepository.ts`, `app/api/insights/route.ts`

---

## Validation Checklist

- **No code modified**: audit performed by reading and analyzing only.  
- **No dependencies installed**.  
- **Only one new file created**: `audit/echly-system-audit.md`.

