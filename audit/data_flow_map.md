# Phase 6.7 — Data flow map (per screen)

Format per screen: where data is requested, queries/API calls, post-arrival behavior, chained vs derived work.

---

## Screen: Dashboard session list (`/dashboard`)

1. **Workspace identity** (`WorkspaceProvider`): `onAuthStateChanged` → optional cache hint → `getDoc(users/{uid})` (fast path) → `POST /api/users` → `getIdToken(true)` → `getUserWorkspaceIdRepo` (`getDocFromServer` / `getDoc` on `users/{uid}`).
2. **Sessions list**: Firestore `onSnapshot` — `query(collection("sessions"), where workspaceId, orderBy updatedAt desc, limit 30))`. On each snapshot: map docs → `Session[]`, merge optimistic rows, write `sessionStorage` cache.
3. **Per-session feedback counts**: After snapshot IDs known, `hydrateCountsForSessionIds` runs `Promise.all` over session ids: each uses `getCounts` from `sessionCountsStore` or `fetchCounts` → **`GET /api/feedback/counts?sessionId=`** (deduped per session key).
4. **Create / archive / delete session**: `authFetch` `POST/PATCH/DELETE` `/api/sessions` (+ optimistic UI updates to local session list).

**Derived logic (client)**: `filterAndSortSessions`, active vs archived, time-range filter, search — all `useMemo` on `dashboard/page.tsx` over `stableSessions`.

**Dependencies**: `workspaceId`, `authUid`, `claimsReady` / `isIdentityResolved` for gating mutations; overview provider must wrap tree.

---

## Screen: Session ticket board (`/dashboard/[sessionId]`)

1. **Session document (title, access, workspace check)**: `getDoc(sessions/{sessionId})` once per session change; on success `recordSessionViewIfNew` → `POST /api/sessions/:id/view`.
2. **Feedback list (canonical)**: Firestore `onSnapshot` — `feedback` where `workspaceId` + `sessionId` (full collection for that session, no limit in query). Maps docs → `Feedback[]`, soft-delete filter, sort by `createdAt` desc, detects new ids for highlight.
3. **Counts (total / open / resolved)**: Initial: `getCounts` or `fetchCountsDedup` → `/api/feedback/counts`. On each feedback snapshot: `fetchCountsDedup` again + `setStoreCounts` + `subscribeCounts` pushes to hook state. Local optimistic updates via `updateCachedCounts` on extension event.
4. **Selected ticket detail (API as source of truth for some fields)**: Mutations use `PATCH /api/tickets/:id`; deep link may `GET /api/tickets/:id` if ticket not in list yet.
5. **Comments**: `useCommentsRepoSubscription` → `onSnapshot` on `comments` for `(workspaceId, sessionId, feedbackId)`.

**Search mode**: Debounced `authFetch` → `GET /api/feedback/search?sessionId=&query=` (server-side corpus).

**Derived logic**: `openFeedback` / `resolvedFeedback` from canonical list via `normalizeTicketStatus`; selection index vs server counts for chrome UI.

---

## Screen: Session overview (`/dashboard/[sessionId]/overview`)

1. **Parallel batch** (`useSessionOverview.load`):  
   - `getSessionById` (client repo → typically `getDoc` session).  
   - `countsPromise`: cache `getCounts` or `fetchCounts` → `/api/feedback/counts`.  
   - `getSessionFeedbackByResolved(wid, sid, false, 3)` — Firestore `getDocs`.  
   - `getSessionFeedbackByResolved(wid, sid, true, 3)` — Firestore `getDocs`.  
   - `getSessionRecentComments` — Firestore `getDocs` (recent comments).  
2. **Chained**: `getFeedbackByIds` — `Promise.all` of `getDoc(feedback/{id})` for up to 10 ids from comments (titles for activity).

**Derived logic**: `extractTagCounts` from merged preview feedback; `recentActivity` built from comments + title map.

---

## Screen: Insights (`/dashboard/insights`)

1. **Primary**: `onSnapshot(workspaceInsightsRef(workspaceId))` — single document; map to UI model (`mapDocToApi`).
2. **Secondary**: When `sessionCounts` keys exist, `useEffect` loads session **titles** via `Promise.all` of `getDoc(sessions/{id})` for top ids (≤10).

**Derived logic**: `filterDaily`, chart series `useMemo`, `reduce` over daily buckets, issue type sorting — all client-side from insights doc payload.

---

## Screen: Discussion (`/discussion`)

1. **List**: `GET /api/feedback?conversationsOnly=true&limit=20` (`authFetch`, `no-store`). Maps JSON to `DiscussionItem[]`; builds project list from unique `sessionId`s.
2. **Thread (selected ticket)**: `GET /api/tickets/:id` then chained `GET /api/sessions/:sessionId` for session name.
3. **Comments stream**: `onSnapshot` on `comments` for selected `(workspaceId, sessionId, feedbackId)`.

**Local mutation path**: `addComment` (and related) after send; parent bumps `commentCount` on selected row only (`handleCommentAdded`).

---

## Screen: Public share (`/s/[token]`)

1. **SSR / RSC**: `fetch` same-origin `GET /api/public/share/:token` (`cache: "no-store"`).  
2. **API** (server): `resolveShareToken` → `getSessionByIdRepo` → `getAllFeedbackForPublicShareBySessionIdRepo` → sanitize JSON.

**Client**: `PublicShareSessionView` + `usePublicSessionRealtime` — **no Firestore listener** today (hook returns empty static state).

---

## Screen: Extension auth (`/extension-auth`)

1. `POST /api/extension/session` with cookies → JSON with `extensionToken`; `postMessage` to opener; or redirect to login.

---

## Cross-cutting: Billing usage (`useBillingUsage`)

1. `retainWorkspaceFirestoreListener(workspaceId)` → shared `onSnapshot(workspaces/{id})`.
2. `subscribeWorkspaceStore` → on subsequent workspace doc changes (after first snapshot), idle-scheduled `invalidateBillingUsageCache` + `refetch` → `GET` billing usage via `getBillingUsageCached` / `authFetch`.

**BillingUsageCacheInitializer**: separate idle fetch → `fetchBillingUsage` into `billingStore` (parallel path to `useBillingUsage` for some UI).

---

## Data-flow patterns (summary)

| Pattern | Where |
|---------|--------|
| Single Firestore listener + REST counts | Dashboard overview, Session board |
| Firestore listener + same REST counts on every snapshot | `useSessionFeedbackPaginated` |
| One-shot parallel `getDocs` + chained `getDoc` | Session overview |
| API-only list + Firestore listener for detail | Discussion |
| Single doc realtime + optional `getDoc` fan-out | Insights |
| Server-only aggregate doc | Insights content (written elsewhere / backfill jobs) |
