# Phase 6.7 — Counts system audit

Classification: **client-computed** | **server-stored (Firestore fields)** | **server-computed (API / scan)** | **mixed**.

---

## Session-level feedback counts (open / resolved / total)

### Sources

| Source | Mechanism | Classification |
|--------|-----------|----------------|
| `sessions/{sessionId}` document | Fields: `totalCount`, `openCount`, `resolvedCount` (see `Session` domain comments — denormalized WAVE 1) | **Server-stored** |
| `GET /api/feedback/counts` | `resolveSessionFeedbackCounts` (`lib/server/resolveSessionFeedbackCounts.ts`): if `total === open + resolved` use doc fields; else **full collection scan** of `feedback` for session + workspace, then **repair** session doc | **Mixed** (prefer stored; fallback scan) |
| Client `sessionCountsStore` | In-memory cache + `subscribeCounts`; populated by `fetchCounts` / `fetchCountsDedup` | **Client cache** of server result |
| `useSessionFeedbackPaginated` | After **every** Firestore feedback snapshot, calls `fetchCountsDedup` again | **Repeated server reads** (deduped in-flight per session key) |

### Where counts are consumed

- **Dashboard cards**: `useWorkspaceOverview` → `hydrateCountsForSessionIds` → `/api/feedback/counts` per session id (parallel `Promise.all`), merged into `countsBySessionId`.
- **Session board**: `useSessionFeedbackPaginated` — totals for badges and list chrome; **not** derived from loaded feedback array (by design).
- **Session overview**: `useSessionOverview` — `fetchCounts` or cache for metric cards.
- **Insights**: Lifetime totals from **workspace insights document** (`totalFeedback`, `totalResolved`, etc.) — separate aggregate, not session counts API.

### Duplication / inconsistency risks

- **Same session** may hit `/api/feedback/counts` from: dashboard hydration, session page initial effect, **and** every feedback `onSnapshot` tick — **dedup** helps concurrent requests but **not** sequential rapid refreshes.
- **Firestore listener** delivers full feedback docs; **counts** come from a **different** path (session doc fields or scan). Brief skew possible until counts fetch completes.
- **SessionPageClient** `ECHLY_FEEDBACK_CREATED` handler **increments** `sessionCountsStore` optimistically — can diverge until server counts refresh aligns.

---

## Workspace-level counts & limits

| Data | Location | Classification |
|------|----------|----------------|
| Active session count for billing UI | `workspaces/{id}` via `workspaceStore` — `sessionUsed` from `sessionCount - archivedCount` or fields | **Server-stored** on workspace doc |
| `getWorkspaceSessionCountRepo` | If workspace missing counters, `getCountFromServer` ×2 on `sessions` | **Server-computed** (aggregate queries) |
| Insights aggregates | `workspaces/{id}/insights` doc (or path per `insightsRepository`) | **Server-stored** pre-aggregated |
| `Workspace.stats` | Domain type documents pre-aggregated stats for legacy insights API paths | **Server-stored** |

---

## Discussion / list UI counts

| UI | Field | Source |
|----|-------|--------|
| Discussion list row | `commentCount` | From `GET /api/feedback?conversationsOnly` payload (server) |
| Discussion thread header | Reply label | Derived from `commentCount` on list item; **local bump** `+1` on comment added |
| DiscussionFeed (unused) | `commentCount` on feedback docs | Would be **Firestore** from `getDocs` query |

---

## Client-side aggregations (filter / reduce / length)

| Location | What is aggregated |
|----------|-------------------|
| `dashboard/page.tsx` | `filter`/`sort` sessions for tabs, time range, search — **not** ticket counts |
| `useSessionFeedbackPaginated` | `openFeedback` / `resolvedFeedback` via `filter` on canonical list — **status buckets**, not totals for display limits |
| `useSessionOverview` | `extractTagCounts` — **tags** from preview feedback only |
| `insights/page.tsx` | `reduce` over `filteredDaily` for chart totals |
| `DiscussionList.tsx` | `filteredItems` by project + search string |

---

## Fan-out patterns (counts-related)

1. **Dashboard**: Up to **30** parallel `/api/feedback/counts` calls after each sessions snapshot (one per session id in list), mitigated by `dedupedRequest` for identical session keys and `sessionCountsStore` short-circuit if already cached.
2. **Session board**: **1** counts API call on mount + **1 per feedback snapshot** (can be many during active editing).
3. **Counts API fallback**: Single session inconsistency triggers **full feedback scan** for that session on the server — expensive but rare if denormalized fields stay consistent.

---

## Source of truth summary

| Metric | Canonical source |
|--------|------------------|
| Session list membership | Firestore `sessions` query (dashboard listener) |
| Per-session open/resolved/total (displayed totals) | **Intended**: `sessions` doc fields via `/api/feedback/counts`; **repair** path: scan |
| Ticket list content on board | Firestore `feedback` listener (full docs) |
| Insights charts | Workspace insights **document** snapshot |
| Billing session usage | Workspace **document** snapshot |
