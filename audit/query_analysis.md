# Phase 6.7 — Query analysis (per screen)

Estimates include **Firestore client** reads/listeners and **HTTP API** calls initiated from the screen or its hooks. Server-side internal queries inside API routes are noted briefly.

---

## `/dashboard` (session list)

| # | Type | Parallelism | Pattern |
|---|------|-------------|---------|
| 1 | Firestore `onSnapshot` | N/A (streaming) | Single query, 30 docs max |
| 2 | `GET /api/feedback/counts` × N | **Parallel** (`Promise.all` in `hydrateCountsForSessionIds`) | **N = up to 30** — fan-out |
| — | sessionStorage / localStorage | Sync | Cache only |

**N+1**: **Yes** — one counts request **per session id** after each sessions snapshot (deduped only for identical concurrent keys).

**Redundant**: Re-running hydration when session ids unchanged but snapshot fires (Firestore may emit on any doc change in query).

---

## `/dashboard/[sessionId]` (ticket board)

| # | Type | Parallelism | Pattern |
|---|------|-------------|---------|
| 1 | `getDoc(sessions/{id})` | Single | One-shot per session navigation |
| 2 | `POST /api/sessions/.../view` | Async fire-and-forget | After session load |
| 3 | Firestore `onSnapshot(feedback)` | Streaming | **Unbounded** result set for session |
| 4 | `GET /api/feedback/counts` | Repeated | Initial + **after each feedback snapshot** |
| 5 | `GET /api/feedback/search` | Debounced | Search mode only |
| 6 | `GET /api/tickets/:id` | Optional | `?ticket=` when id not in list |
| 7 | Firestore `onSnapshot(comments)` | Streaming | Selected ticket only |
| 8+ | `PATCH/DELETE` tickets, `PATCH/DELETE` sessions | User-driven | Mutations |

**N+1**: **No** for ticket list (single collection listener). **Yes** for deep-link edge case (extra ticket fetch). Comments: **O(1)** listener per selection.

**Dependent chains**: Session `getDoc` must succeed before UI treats session as valid; feedback listener independent of counts; counts **depend** on feedback updates by **policy** (refresh after snapshot).

---

## `/dashboard/[sessionId]/overview`

| # | Type | Parallelism |
|---|------|-------------|
| 1 | `getSessionById` (`getDoc`) | **Parallel** batch |
| 2 | `fetchCounts` → API | Same batch (counts promise) |
| 3 | `getSessionFeedbackByResolved` ×2 | **Parallel** `getDocs` |
| 4 | `getSessionRecentComments` | **Parallel** `getDocs` |
| 5 | `getFeedbackByIds` | **Parallel** `getDoc` per id (up to 10) — mini N+1 |

**N+1**: **Bounded** N for feedback-by-ids (max 10).

**Redundant**: Overlaps conceptually with session board (same session, different fetch strategy) — user navigating board ↔ overview triggers **separate** full data loads.

---

## `/dashboard/insights`

| # | Type | Notes |
|---|------|-------|
| 1 | `onSnapshot` insights doc | Single document |
| 2 | `getDoc(sessions/{id})` × up to 10 | **Parallel** for titles when top session ids change |

**N+1**: Small bounded fan-out for session titles.

---

## `/discussion`

| # | Type | Notes |
|---|------|-------|
| 1 | `GET /api/feedback?conversationsOnly&limit=20` | List |
| 2 | `GET /api/tickets/:id` | Per selection change |
| 3 | `GET /api/sessions/:sid` | Chained after ticket load |
| 4 | `onSnapshot(comments)` | Selected thread |

**N+1**: List capped at 20; ticket + session is a **chain of 2** per selection (not N).

---

## `/s/[token]` (public share page)

| # | Type | Notes |
|---|------|-------|
| 1 | Server `GET /api/public/share/:token` | Admin SDK: token resolve, session get, feedback query |

**Client**: No Firestore queries.

---

## Global / shell (not a single screen but affects all)

| Trigger | Queries |
|---------|---------|
| `WorkspaceProvider` identity sync | `getDoc(users/{uid})`, `POST /api/users`, `getUserWorkspaceIdRepo` (`getDocFromServer` / `getDoc`) |
| `WorkspaceOverviewProvider` | Same as dashboard |
| `BillingUsageCacheInitializer` | `fetchBillingUsage` (HTTP) once post-auth |
| `useBillingUsage` | Retain workspace doc listener + refetch billing on doc updates |

---

## Summary table: worst fan-out

| Screen | Worst case | Label |
|--------|------------|-------|
| Dashboard | 30× `/api/feedback/counts` in parallel | **High** |
| Session board | 1 unbounded Firestore listener + counts API per snapshot | **High** (churn) |
| Session overview | 4 parallel phases + up to 10 getDocs by id | **Medium** |
| Insights | 1 doc + ≤10 session getDocs | **Low–Medium** |
| Discussion | 1 list API + 2-step ticket hydrate + 1 comment listener | **Low** |
