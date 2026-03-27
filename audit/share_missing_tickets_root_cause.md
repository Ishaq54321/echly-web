# Share Missing Tickets Root Cause Audit

Date: 2026-03-27  
Scope: Exact reason share page list misses tickets while counts are correct.  
Constraint followed: analysis only, no app code changes.

## Final Answer First

The list/count mismatch is caused by **pipeline divergence on the share page**:

1. Share list seed (`initial.feedback`) is fetched with `status == "open"` plus `status == "resolved"` only in `getAllFeedbackForPublicShareBySessionIdRepo`.
2. Share counts are fetched from `/api/feedback/counts`, which comes from session counters via `resolveSessionFeedbackCounts`.
3. Public realtime (`usePublicSessionRealtime`) could reconcile missing rows, but it depends on client Firestore reads from `feedback`, and `firestore.rules` requires authenticated workspace membership for `feedback` reads. Public token viewers are not granted this.
4. Result: counts can be correct while `TicketList` shows only the status-filtered seed subset.

Single root cause: **share list data source is status-filtered and cannot be reliably rehydrated for public viewers due to Firestore auth rules; counts come from a different source.**

---

## 1) Dashboard Data Pipeline (Source of Truth)

### A. Query

Located in `useSessionFeedbackPaginated`.

- Collection: `feedback`
- Filters: `where("sessionId", "==", sessionId)`
- Ordering: `orderBy("createdAt", "desc")`
- Pagination: none in this hook (full realtime stream)
- Limit: none
- Soft delete exclusion: after fetch (`mapDocToFeedback` returns `null` for `isDeleted === true`)

### B. Data Shape / Mapping

- Raw Firestore docs are mapped by `mapDocToFeedback` to `Feedback`.
- Status normalization:
  - `status` becomes `"resolved"` only if doc status is exactly `"resolved"`.
  - all others are treated as `"open"` through normalization (`normalizeFeedbackItemStatus` + `normalizeTicketStatus` path).
- Canonical list is deduped and sorted by created time desc + id tie-break.

### C. Final Dataset Passed to `TicketList`

In `SessionPageClient`, `TicketList` receives:

- `items={feedback}` where `feedback` is the canonical list from `useSessionFeedbackPaginated`
- `counts` from `/api/feedback/counts` via store-backed values:
  - `total`
  - `open`
  - `resolved`

So dashboard list source and dashboard counts source are already decoupled, but dashboard list query itself is broad (session-wide).

---

## 2) Share Page Data Pipeline

### A. Query

Initial SSR fetch path:

- `app/s/[token]/page.tsx` -> `GET /api/public/share/[token]`
- Route calls `getAllFeedbackForPublicShareBySessionIdRepo(sessionId)`

Inside `getAllFeedbackForPublicShareBySessionIdRepo`:

- Collection: `feedback`
- Query stream 1:
  - `where("sessionId","==",sessionId)`
  - `where("status","==","open")`
  - `orderBy("createdAt","desc")`
  - paged with `limit(100)`
- Query stream 2:
  - same but `status == "resolved"`
- Limit/cap:
  - per-page 100
  - max aggregated items 10,000
- Soft delete exclusion:
  - in memory via `omitSoftDeletedFeedback`

Important: initial share list excludes any row whose status is not exactly `"open"` or `"resolved"` (including missing/legacy/alternate values).

Realtime path:

- `usePublicSessionRealtime` uses:
  - `where("sessionId","==",sessionId)`
  - `orderBy("createdAt","desc")`
  - no status filter
- This would include broader statuses if Firestore read is allowed.

### B. Transformation Layer

`mapPublicShareToSessionUi`:

- `mapPublicFeedbackToFeedback` does not remove items.
- It normalizes status via `normalizeTicketStatus`.
- It drops non-essential fields for UI parity (`workspaceId`, `userId`, comments, metadata, timestamps in list shape, etc.).

`sanitizePublicFeedback`:

- does not filter items by condition itself.
- transforms each item to public-safe shape and normalizes status to open/resolved.
- trims `actionSteps`/`tags` to non-empty strings only (field-level cleanup, not row-level removal).

So item loss is **not** in `mapPublicShareToSessionUi` or sanitizer loops; loss happens before this, at query/access stage.

### C. Final Dataset in Share View

In `PublicShareSessionView`:

- `sanitizedFeedback` state starts from `initial.feedback` (server API payload).
- `feedbackRows` = `sanitizedFeedback.map(mapPublicFeedbackToFeedback)`.
- `TicketList` gets `items={feedbackRows}`.

Therefore the rendered list is exactly whatever is in `sanitizedFeedback`.

---

## 3) Data Count vs Data List Comparison

### A. Counts Source

Share counts are fetched in `useShareCounts` from `/api/feedback/counts?sessionId=...&token=...`.

`/api/feedback/counts`:

- validates token/session for public access
- computes counts via `resolveSessionFeedbackCounts`
- primarily returns session counters (`sessions.totalCount/openCount/resolvedCount`) when consistent
- only falls back to scan if arithmetic inconsistency is detected

So share counts are session-counter based (not list-length based), except temporary fallback while loading.

### B. List Source

Share list is `feedbackRows` from `sanitizedFeedback`:

- seeded by status-filtered server list (`open` + `resolved` only)
- optionally updated by client realtime if allowed

Conclusion: counts and list are derived from different pipelines.

---

## 4) Missing Items Detection by Stage

### Query Stage

Loss occurs here first:

- `getAllFeedbackForPublicShareBySessionIdRepo` explicitly includes only `status == "open"` or `status == "resolved"`.
- Any ticket outside those exact status values is omitted from initial share list.

### Transformation Stage

- `sanitizePublicFeedback` and `mapPublicShareToSessionUi` do not remove full rows.
- They only reshape and sanitize fields.
- No row-drop condition found in mapper/sanitizer beyond already-filtered inputs.

### Rendering Stage

- `TicketList` receives `items={feedbackRows}` without additional filtering in `PublicShareSessionView`.
- Rendering does not drop rows beyond open/resolved grouping visuals in `TicketList`.

Net: row loss is not render-layer loss.

---

## 5) Sanitization Impact (`mapPublicShareToSessionUi`)

- No full-item filtering in `mapPublicFeedbackToFeedback`.
- No conditional exclusion in `mapSanitizedToDetailItem`.
- Field drops are intentional public-shape reductions (metadata/comments/etc.), not ticket removal.
- Sanitizer (`sanitizePublicFeedback`) similarly does not skip rows.

So sanitization is **not** the root cause of missing tickets.

---

## 6) Pagination / Limit Check

Dashboard:

- `useSessionFeedbackPaginated` currently uses full realtime snapshot for list (no cursor paging in this path).

Share:

- Initial server list is paged internally (100 per request) up to 10,000 max.
- No UI-level pagination in share `TicketList` (`hasMore: false`).

The observed mismatch is not from UI slicing; it is from status-scoped query semantics (and potentially access failure of realtime reconciliation).

---

## 7) Realtime Snapshot Behavior

`usePublicSessionRealtime` query itself would return full session docs (subject to `createdAt` presence and rules).

But for public token viewers, `firestore.rules` restrict `feedback` reads to authenticated workspace members or legacy owner identity, which public anonymous users do not satisfy.

Impact:

- realtime may error and not reconcile missing initial rows
- `PublicShareSessionView` ignores realtime updates when `realtime.error` exists
- list remains status-filtered seed from initial API response

---

## 8) Loading Logic Side Effects (`PublicShareSessionView`)

For row loss specifically:

- `items={feedbackRows}` passes full current sanitized state; no extra filter before `TicketList`.

For sidebar loading behavior:

- share sidebar skeleton is only shown in `phase === "initial"` (one-frame transition), not tied to realtime/count loading lifecycle.
- after ready, sidebar relies on `TicketList` internal loaders from `countsLoading`/`realtime.loading`.
- because lifecycle is decoupled, share loading experience differs from dashboard orchestration.

This explains loading inconsistency, not the ticket-loss root cause.

---

## 9) Why Sidebar Loading Differs from Dashboard

Dashboard sidebar loading is driven by `feedbackLoading` + `countsLoading` from `useSessionFeedbackPaginated` and cache/store lifecycle.

Share sidebar:

- brief phase gate (`initial` -> `ready`) via `requestAnimationFrame`
- then relies on separate hooks (`usePublicSessionRealtime`, `useShareCounts`) with different readiness semantics
- no equivalent dashboard auth/data staged loading contract

So share loading state is structurally different by design.

---

## 10) Exact Root Cause (Requested Answers)

### 1) Why counts match but tickets do not?

Because share counts come from `/api/feedback/counts` (session counters), while share list is seeded from a status-filtered query (`open` + `resolved` only). These are different sources with different inclusion rules.

### 2) Exact line(s)/location where items are lost

Primary loss point:

- `lib/repositories/feedbackRepository.server.ts`
- `getAllFeedbackForPublicShareBySessionIdRepo`
- query constraints `where("status", "==", "open")` and `where("status", "==", "resolved")`

Persistence of loss in public view:

- `firestore.rules` prevents anonymous `feedback` reads, so `usePublicSessionRealtime` cannot reliably rehydrate missing statuses for token viewers.

### 3) Is issue query, mapping, or rendering?

- **Primary:** query-stage issue (status-scoped fetch)
- **Secondary amplifier:** access/realtime-stage issue (public client Firestore reads denied by rules)
- **Not primary:** mapping or rendering

### 4) Can all tickets be recovered without backend changes?

Not reliably for public token viewers under current architecture:

- With current backend list query + current Firestore rules, share page cannot guarantee full parity with dashboard list for all status variants.
- Full recovery would require backend-side query semantics alignment and/or a backend-driven realtime/update channel compatible with public token access.

---

## Bottom-Line Single Root Cause

**Share page list uses a status-filtered backend fetch (`open` + `resolved` only), while counts come from session counters, and public realtime cannot be relied on to fix the gap because Firestore rules block anonymous `feedback` reads.**

