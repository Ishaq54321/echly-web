# Soft Delete System

## Data model update

- `Feedback` in `lib/domain/feedback.ts` now includes optional `isDeleted?: boolean`.
- New feedback documents set `isDeleted: false` in `feedbackPayload` (`lib/repositories/feedbackRepository.ts`) so created rows have an explicit flag.
- Firestore also stores `deletedAt` (server timestamp) on delete for audit; it is not required on the domain type for list behavior.

## Repository change

- `deleteFeedbackWithSessionCountersRepo` no longer calls `tx.delete`. It atomically:
  - `updateDoc` on the feedback row: `isDeleted: true`, `deletedAt: serverTimestamp()`
  - Applies the same session counter decrements as before (open/resolved/skipped/total/feedback counts).
  - Returns early if the doc is already soft-deleted (idempotent).
- `deleteFeedbackRepo` delegates to `deleteFeedbackWithSessionCountersRepo` so all delete paths stay consistent.
- `getFeedbackByIdRepo` returns `null` when `isDeleted === true` (API treats deleted tickets as not found).
- `getSessionFeedbackPageForUserWithStringCursorRepo` skips `isDeleted === true` while paginating and may issue multiple Firestore reads in one API page so the client still receives up to `limit` active rows and correct `nextCursor` / `hasMore`.
- List helpers use `omitSoftDeletedFeedback()` so workspace/user/insights/conversation queries do not surface soft-deleted rows.
- `getSessionFeedbackPageRepo` filters soft-deleted items out of each page and aligns `lastVisibleDoc` with the last **returned** row.
- After a successful delete, `invalidateFeedbackCache(workspaceId, sessionId)` runs so cached GET `/api/feedback` first pages do not briefly show deleted items.

## Realtime filtering

- `lib/realtime/feedbackStore.ts` maps `isDeleted: data.isDeleted ?? false` on active rows.
- If `data.isDeleted === true`, `mapDocToFeedback` returns `null`; those docs are dropped from `items`, and add/modify snapshots emit a `removed` change for that id so the paginated hook can drop them without relying on ambiguous physical-delete semantics.

## API filtering

- `GET /api/feedback` documents that list semantics exclude `isDeleted === true`. The exclusion is implemented in `getSessionFeedbackPageForUserWithStringCursorRepo` (and related repo helpers), not as a raw Firestore `where("isDeleted", "!=", true)` on that query: inequality would omit legacy documents that do not yet have `isDeleted`, while skipping `isDeleted === true` in application code matches “not deleted” for both legacy and new documents.
- `serializeFeedbackMinimal` in `app/api/feedback/route.ts` includes `isDeleted: item.isDeleted ?? false`.

## UI behavior

- `SessionPageClient` removes the ticket from the list immediately with `setFeedback((prev) => prev.filter(...))` before calling `DELETE /api/tickets/:id`.
- `useSessionFeedbackPaginated` applies realtime `removed` changes by removing matching ids from the canonical list in one `setCanonicalFeedback` update (together with add/modify processing).

## Pagination safety

- `appendPaginationIntoCanonical` skips incoming rows with `isDeleted === true` so API pages never reintroduce soft-deleted tickets; existing ids are still deduped by `byId`.
- Session pagination in the repository uses a cursor loop that advances past filtered-out deleted docs until the page is filled or Firestore is exhausted, preserving deterministic cursors based on the last **visible** document.

## Success criteria (checklist)

- Deleted items disappear immediately in the session UI (optimistic list + realtime/API both exclude them).
- No reliance on Firestore “removed” meaning only physical delete: soft delete is modeled with `isDeleted` and modified snapshots; physical `removed` still clears ids from the list when docs are actually deleted (e.g. session purge).
- Pagination stays aligned with “active” rows only; counts repair path in `resolveSessionFeedbackCounts` ignores `isDeleted === true` when scanning `feedback`.
