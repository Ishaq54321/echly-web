# Share Page System Audit

Date: 2026-03-27
Scope: End-to-end audit of shareable page flow, token resolution, data fetching, permissions, and count mismatches vs dashboard.
Constraint: Analysis only. No code changes.

## Executive Summary

- The share page is connected to the same core `sessions` + `feedback` data, but through a separate public pipeline (`share_links` token + public API + sanitized payload), not the dashboard pipeline.
- Count mismatches are plausible and real due to different count sources and filtering semantics:
  - Share page counts are derived from currently loaded public feedback rows.
  - Dashboard counts come from denormalized `sessions` counters via `/api/feedback/counts`.
  - Dashboard list includes any non-`resolved` status as open in UI, while share queries only `status in {open,resolved}`.
- Permission model is mixed:
  - Authenticated dashboard operations are backend-enforced (good).
  - Public share permissions are UI-gated only for actions because public routes do not expose mutations (currently safe, but brittle if public mutating routes are added later).
- Architecture is partially fragmented: shared UI chrome exists, but data/query/count/permission resolution paths are parallel and inconsistent.

---

## 1) Entry Point - Share Page

## Located files

- `app/s/[token]/page.tsx`
- `app/api/public/share/[token]/route.ts`
- `components/share/PublicShareSessionView.tsx`
- `components/share/usePublicSessionRealtime.ts`

## How token is read

- Route param `token` is read in `PublicSharePage({ params })`.
- Token is trimmed and validated for non-empty.
- Page fetches server endpoint: `GET /api/public/share/:token`.

## What is triggered

- Server-side fetch (no-store) from page to `app/api/public/share/[token]/route.ts`.
- That route resolves token via `resolveShareToken()`, loads session by `sessionId`, loads feedback via public-share repo method, sanitizes payload, and returns JSON.

## Returned data shape

- `session`: sanitized public session (`id`, `title`, optional `createdAt`).
- `feedback`: sanitized public rows (`id`, `title`, `description`, `status`, `createdAt`, `screenshotUrl`, `attachments`, `actionSteps`, `tags`).
- `permissions`: computed capability flags from share link `generalAccess`.

---

## 2) Token Resolution Flow

## Token -> what?

`token` -> `share_links` row -> `{ sessionId, generalAccess, isActive, expiresAt }` -> public API response.

## Storage and schema

### `share_links` (public token links)

From `lib/repositories/shareLinksRepository.ts`:

- `token` (string, random base64url from 32 bytes)
- `sessionId` (string)
- `generalAccess` (`view | comment | resolve`)
- `createdBy` (uid)
- `createdAt`
- `lastAccessedAt`
- `expiresAt` (optional)
- `isActive` (boolean, default true)

### `session_shares` (email invite sharing, separate system)

From `lib/repositories/sessionSharesRepository.ts`:

- deterministic doc id: `${sessionId}_${normalizedEmail}`
- fields: `sessionId`, `email`, `permission` (`view|comment|resolve`), `createdAt`

This is not the token table; it is invite-based access for authenticated users.

## Lookup logic

In `resolveShareToken()`:

1. Trim token; reject short tokens (`<20`) as not found.
2. Query `share_links` by exact `token` (`limit 1`).
3. Reject if row missing.
4. Reject if `isActive === false`.
5. Reject if `expiresAt` is in the past.
6. Async best-effort update of `lastAccessedAt`.
7. Return `{ valid: true, sessionId, generalAccess }`.

## Validation outcomes

- `NOT_FOUND` -> HTTP 404
- `EXPIRED` -> HTTP 410
- `INACTIVE` -> HTTP 403

---

## 3) Data Fetching - Share Page

## Sources

1. Initial data: server API `GET /api/public/share/:token`
2. Runtime updates: client Firestore listeners in `usePublicSessionRealtime()`

## Initial query path

In `app/api/public/share/[token]/route.ts`:

- Resolve token -> sessionId
- `getSessionByIdRepo(sessionId)` from `sessions/{id}`
- `getAllFeedbackForPublicShareBySessionIdRepo(sessionId)` from `feedback`

## Feedback query details (public initial fetch)

In `getAllFeedbackForPublicShareBySessionIdRepo()`:

- Two separate streams:
  - `where(sessionId == X).where(status == "open").orderBy(createdAt desc)`
  - `where(sessionId == X).where(status == "resolved").orderBy(createdAt desc)`
- Soft-deletes filtered out in memory (`isDeleted !== true`).
- Merged + sorted by `createdAt desc` (tie-break id desc).
- Cap: `PUBLIC_SHARE_FEEDBACK_MAX = 10,000`.
- Page-size per fetch loop: 100.

## Share page counts

In `PublicShareSessionView`:

- `total = feedbackRows.length`
- `open = feedbackRows.filter(getTicketStatus(...) == "open").length`
- `resolved = ... == "resolved"`

Counts are client-derived from loaded sanitized rows, not from session counters.

## Realtime behavior

In `usePublicSessionRealtime()`:

- Same two status-scoped queries (`open`, `resolved`) with `createdAt desc`.
- Merge both arrays, drop soft-deleted, sanitize.
- No pagination.

---

## 4) Data Fetching - Dashboard Page (Reference)

## Located files

- `app/(app)/dashboard/[sessionId]/page.tsx`
- `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`
- `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- `app/api/feedback/counts/route.ts`
- `lib/server/resolveSessionFeedbackCounts.ts`

## Dashboard feedback list fetch

In `useSessionFeedbackPaginated()`:

- Client Firestore realtime query:
  - `collection("feedback")`
  - `where("sessionId", "==", sessionId)`
  - `orderBy("createdAt", "desc")`
- Soft-deletes filtered in client mapper (`if isDeleted true -> null`).
- No status filter at query level.
- Status normalized in UI mapping:
  - only exact `"resolved"` becomes resolved
  - everything else treated as open.

## Dashboard counts fetch

- Separate API call: `/api/feedback/counts?sessionId=...` via `fetchCountsDedup()`.
- Backend:
  - Requires auth and ownership (`session.userId === user.uid`) for this endpoint.
  - Uses session doc counters (`totalCount/openCount/resolvedCount`) if internally consistent (`total == open + resolved`).
  - Otherwise scans `feedback` (excluding `isDeleted`) and repairs session counters.

## Pagination

- Dashboard session list in this hook is effectively full realtime list (not cursor-paginated).
- API pagination code exists in `/api/feedback` repositories but not used by this primary dashboard hook.

---

## 5) Critical - Count Mismatch Analysis (Share vs Dashboard)

## A) Feedback list query parity

Not identical.

- Share list:
  - status-filtered to only `open` + `resolved` queries.
- Dashboard list:
  - all statuses by `sessionId`, then client maps non-resolved -> open.

Consequence: any legacy/unexpected status rows can appear in dashboard as open but be absent from share.

## B) Count calculation parity

Not identical.

- Share counts:
  - Derived from loaded share rows (initial payload + realtime merged rows).
- Dashboard counts:
  - Derived from session denormalized counters via API (`sessions.totalCount/openCount/resolvedCount`), with fallback repair only when `total != open+resolved`.

Consequence: if session counters are stale but still arithmetically consistent, dashboard count can drift from real list/share list.

## C) Total tickets source of truth

Different sources are used.

- Share total: length of returned public dataset.
- Dashboard total: session document counter from `/api/feedback/counts`.

No single unified source is enforced at render time.

## Root cause(s) of mismatch

Primary real causes:

1. **Dual counting model**  
   Share uses list-derived counts; dashboard uses denormalized session counters.

2. **Status semantic divergence**  
   Share queries only `status in {open,resolved}`. Dashboard list includes any status and normalizes unknown -> open in UI.

3. **Counter repair condition is narrow**  
   `/api/feedback/counts` only repairs when `total != open+resolved`; stale-but-consistent counters are not auto-corrected.

Secondary factors:

- Soft delete handling is mostly aligned (`isDeleted` excluded), so this is less likely the main mismatch.
- Share cap (`10k`) can theoretically truncate very large sessions.

---

## 6) Permission Model (Viewer / Commenter / Resolver)

## Where roles are stored

- Session default access tier: `sessions.accessLevel` (`view|comment|resolve`).
- Invite overrides: `session_shares.permission`.
- Public token access: `share_links.generalAccess`.

## Dashboard enforcement

- Backend-enforced for ticket CRUD:
  - `app/api/tickets/[id]/route.ts` uses `requireTicketActorPermission(... requiredLevel)`.
  - Effective access computed via owner/workspace/invite resolution (`sessionActorPermissions.ts`).
- UI also gates actions, but backend checks are authoritative.

## Share-page enforcement

- Public share endpoint is read-only (`GET /api/public/share/:token`).
- `permissions` from token are used in UI gating (buttons trigger gate modal, not mutation).
- No public mutation routes are exposed in this flow.

## Firestore rules interaction

- Firestore rules require authenticated membership/ownership for `sessions`, `feedback`, `comments`.
- Public anonymous client does not get direct Firestore read access by rules.
- Share page initial read works because server route uses Admin SDK.
- Client realtime on public page uses Firestore client; for unauthenticated viewers this can fail (non-fatal to initial render).

## Security assessment

- **Current state:** public share permissions are mostly safe because actions are non-operative and backend mutations require auth + permission.
- **Risk posture:** partially enforced model on share surface (UI gating) would become unsafe if future public mutation endpoints are added without server-side token permission checks.

---

## 7) Architecture Consistency

## Is share page using main model?

Partly.

- Shared: same underlying `sessions` + `feedback` collections, shared UI components (`TicketList`, `ExecutionView` alias).
- Separate: token resolution (`share_links`), public sanitization layer, separate query strategy, separate count derivation.

## Shared vs duplicated logic

- Shared UI chrome exists.
- Query/count/permission pipelines are parallel:
  - Dashboard: auth + workspace/session actor model + session counters API.
  - Share: token model + sanitized public payload + list-derived counts.

Assessment: architecture is functional but fragmented around data-access and count semantics.

---

## 8) Data Flow Diagram (Textual)

## Share Page Flow

User -> `/s/{token}` -> `app/s/[token]/page.tsx` -> `GET /api/public/share/{token}` -> `resolveShareToken()` -> `share_links` lookup + validation -> `sessionId` -> load `sessions/{id}` + public feedback query (`feedback` by session + status open/resolved) -> sanitize -> `PublicShareSessionView` render -> optional client realtime merge from Firestore open/resolved listeners.

## Dashboard Flow

User (authenticated) -> `/dashboard/{sessionId}` -> `SessionPageClient` -> realtime feedback list query (`feedback where sessionId orderBy createdAt`) -> client status normalization + soft-delete filter -> separate `/api/feedback/counts` call -> counts resolved from `sessions` counters (or fallback scan+repair) -> render `TicketList` + detail.

---

## 9) Risk Flags (Real Issues Only)

1. **Count inconsistency risk (real, high confidence)**  
   Different count sources and status handling produce drift between share and dashboard.

2. **Status taxonomy mismatch risk (real, medium-high confidence)**  
   Dashboard treats non-resolved as open; share excludes non-open/non-resolved from query.

3. **Architecture duplication risk (real, medium confidence)**  
   Parallel data paths increase chance of regressions and inconsistent behavior.

4. **Public realtime reliability risk (real, medium confidence)**  
   Share realtime depends on client Firestore access that may be denied for unauthenticated viewers by rules; initial data still loads, but live updates may silently not apply.

5. **Permission hardening gap for future changes (real, medium confidence)**  
   Share permission enforcement is UI-centric for now; if public mutations are introduced, backend token-tier enforcement must be explicit to avoid bypass.

---

## 10) Final Verdict

1. **Is share page correctly connected to main system?**  
   **Partially yes.** It reads the same underlying session/feedback data, but through a separate public-share pipeline with its own token, sanitization, query, and counting logic.

2. **Is mismatch expected or a bug?**  
   **Expected under current architecture, and functionally a bug from product perspective.** Mismatch is structurally caused by non-unified count/query semantics.

3. **Is permission system safe?**  
   **Mostly safe today for current capabilities.** Authenticated dashboard actions are backend-enforced. Public share is read-only with UI gating; safe now, but not a complete server-enforced permission model for hypothetical public writes.

4. **Is architecture clean or fragmented?**  
   **Fragmented.** UI reuse is good, but data access, count source, and permission resolution are split across parallel systems, creating inconsistency risk.

---

## Direct Answers to Success Questions

- **Why are my counts different?**  
  Because share counts are derived from share-loaded rows, while dashboard counts come from session counters API, and the two paths handle statuses differently.

- **Is my share system correct?**  
  It works for public read and token validation, but it is not behaviorally identical to dashboard semantics.

- **Do I have a hidden architecture problem?**  
  Yes: parallel data/count/permission pipelines create hidden inconsistency and maintenance risk.
