# Phase 6.7 — Clean system (final purge)

Date: 2026-03-29  
Scope: Single source of truth for **per-session ticket counts** on the **session document** (`sessions/{id}` fields). No client-side recomputation of totals from loaded feedback rows for display; no Firestore `count()` / `getCountFromServer` on the **feedback** collection for session ticket totals.

---

## 1. Removed items

### Deleted files (build artifacts)

- `echly-extension/content.js`
- `echly-extension/content.js.map`  
  (User rebuilds extension from `echly-extension/src/`; stale bundle referenced legacy counts URLs.)

### Removed functions / exports

| Location | Removed |
|----------|---------|
| `lib/repositories/feedbackRepository.ts` | `getSessionFeedbackCountRepo`, `getWorkspaceFeedbackCountRepo`; `getCountFromServer` import (no longer used in this module). |
| `lib/repositories/feedbackRepository.server.ts` | `getSessionFeedbackCountRepo`, `getWorkspaceFeedbackCountRepo`; duplicate `SessionFeedbackCounts` interface export. |

### Removed logic (behavior)

- **`components/share/PublicShareSessionView.tsx`**: Sidebar counts no longer fall back to `feedbackRows.length` / `filter` by status. Counts use only `session.totalCount`, `session.openCount`, `session.resolvedCount` (missing → `0` for `TicketList`’s numeric contract).
- **`app/(app)/dashboard/hooks/useWorkspaceOverview.ts`**: `countsFromSessionFields` and `mapSessionDoc` no longer synthesize total as `open + resolved` when `totalCount` / `feedbackCount` are absent.
- **`app/api/sessions/route.ts`**: Same for serialized list rows (`totalCount` / `feedbackCount` only; `0` when both absent).
- **`app/.../useSessionFeedbackPaginated.ts`**: Session snapshot handler no longer uses `open + resolved` for total when `totalCount` / `feedbackCount` missing.
- **`app/.../useSessionOverview.ts`**: `countsFromSession` no longer uses `open + resolved` for total.
- **`echly-extension/src/cachedSessions.ts`**: `totalTicketsFromSession` no longer sums open + resolved.
- **`echly-extension/src/background.ts`**: Removed `mutateGlobalCounts` and `applyStatusTransition`. `fetchFeedbackCountFresh` no longer falls back to `open + resolved` for total. `ECHLY_FEEDBACK_CREATED` and `ECHLY_REFETCH_FEEDBACK_COUNT` refresh counts via **`GET /api/sessions/:sessionId`** (session payload) instead of optimistic local math.
- **`components/session/FeedbackSidebar.tsx`**: Removed fallbacks that derived `total` / `activeCount` / `resolvedCount` from the in-memory `feedback` array when props were omitted.

### Intentionally unchanged (write path, not UI derivation)

- **`lib/repositories/feedbackRepository.server.ts`** — transaction code that sets `totalCount = openCount + resolvedCount` when **writing** the session document after create / resolve / delete. This maintains denormalized fields on the session doc; it is not a read-side fallback for the web app.

### Maintenance scripts (still recompute from `feedback` for repair)

- `scripts/rebuildSessionCounts.ts`, `scripts/verifySessionCounts.ts` — intentionally scan `feedback` and compare / repair session docs. Not part of runtime UI.

---

## 2. Remaining count sources (runtime UI / API list)

Display and extension chrome counts are driven only by fields on **`sessions/{id}`** (or API shapes that mirror them):

- `openCount`
- `resolvedCount`
- `totalCount`
- `feedbackCount` (used only as an alternate stored total when `totalCount` is absent — same document, not a second system)

No parallel “counts API” for tickets remains in `*.{ts,tsx}` (`/api/feedback/counts`, `fetchCounts` — **none**).

---

## 3. Validation results

| Check | Result |
|--------|--------|
| No read-side fallback that rebuilds totals from loaded ticket rows for session chrome (purged surfaces above) | **YES** |
| No recomputation of **display** totals as `open + resolved` in listed app/extension files | **YES** |
| No legacy counts HTTP route references in application TypeScript | **YES** |
| No `getSessionFeedbackCountRepo` / feedback-collection `count()` for session totals in app repos | **YES** |

Caveats noted in section 1: server **write** transactions still set `totalCount` from updated open/resolved counters; repair scripts still aggregate from `feedback`.

---

## 4. Final classification

| Criterion | Answer |
|-----------|--------|
| Fully deterministic counts for UI (given session doc fields) | **YES** |
| Single source of truth for displayed per-session ticket counts | **YES** (session doc / `/api/sessions` & `/api/sessions/:id` payloads) |
| Clean architecture (no duplicate count systems in TS app path) | **YES** |

---

## 5. Older audit docs

Files under `audit/` and `docs/audits/` may still mention removed modules (`/api/feedback/counts`, `fetchCountsDedup`, etc.). Treat those as **historical** unless updated separately.
