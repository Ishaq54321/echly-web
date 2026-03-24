# Phase 4 Hybrid Simplification

## Removed realtime merge

- **`mergeRealtimeIntoCanonical`** was deleted from `useSessionFeedbackPaginated.ts`. It previously rebuilt canonical state by merging the full Firestore window (up to 30 docs) into a `Map`, then sorting the entire list on every snapshot.
- Realtime no longer drives canonical updates by **array merge**, **full-list dedupe loops**, or **re-sort as the primary merge path** on each tick.

## New realtime behavior (single-item updates)

- **`lib/realtime/feedbackStore.ts`** now records **`snap.docChanges()`** on each `onSnapshot` as `RealtimeDocChange[]` (`added` | `modified` | `removed`), alongside the existing `items` window (still useful for ordering and debugging).
- **`useSessionFeedbackPaginated.ts`**:
  - **First completed snapshot (per session):** one **bootstrap** via `setCanonicalFeedback(realtimeItems)` when the window is non-empty, then the existing **API seed** runs (`appendPaginationIntoCanonical` for first-page rows). This replaces the old “merge full snapshot every time” behavior for the steady state.
  - **Later snapshots:** apply **only** `docChanges`:
    - **`added`:** prepend one row if `id` is not already in the list (dedupe).
    - **`modified`:** replace the row with the same `id` if present.
    - **`removed`:** **ignored** for list mutation. Firestore emits `removed` both when a document is deleted and when it falls out of the limited query window; removing rows on every `removed` would drop legitimately paginated items. Deletes remain **optimistic / API-driven** in `SessionPageClient`, matching the previous merge behavior (which never deleted canonical rows that disappeared from the realtime window).
  - **`onNewTicketFromRealtime`:** on incremental `added` events, fires when the id was **not** already in `itemsRef` (avoids relying only on window length when the window stays capped at 30).

## Canonical data flow

- **Pagination** remains the **source of truth** for what is loaded beyond the first interactions: **`appendPaginationIntoCanonical`** (initial API seed + `loadMore`) and **`setCanonicalFeedback`** / **`refetchFirstPage`** for explicit replaces.
- **Realtime** is a **signal**: **doc deltas** adjust at most one row per change (plus deduped prepend for adds), not a second full data source merged into the list every snapshot.

## Remaining mutation paths

Canonical `items[]` is updated only through:

1. **`setCanonicalFeedback`** — initial bootstrap from the realtime window (once per session), user/optimistic updates from `SessionPageClient` (`setFeedback`), and incremental realtime application (functional updater).
2. **`appendPaginationIntoCanonical`** — API first-page seed after bootstrap and **load more** pages (cursor, `hasMore`, `loadMore` logic unchanged).
3. **`refetchFirstPage`** (new export) — **replaces** the entire list with the first API page; sets cursor/`hasMore` from response and `getCounts`; **not** invoked from realtime.
4. **Session / no-session resets** — `setItems([])` in layout/effects when `sessionId` clears or switches.

## UX verification (no flicker, realtime preserved)

- **New feedback:** incremental `added` prepends after bootstrap; bootstrap still fills the list as soon as the first snapshot arrives (same class of behavior as before, without per-tick full merge).
- **Edits:** `modified` updates the matching row in place; `setCanonicalFeedback` still normalizes/sorts after the updater runs (same pattern as pagination append).
- **No automatic full refetch** from realtime; **`refetchFirstPage`** is manual-only.
- **Scroll:** no intentional list reset on realtime (no `mergeRealtimeIntoCanonical` full reshuffle each snapshot).

## Risk check

| Risk | Mitigation |
|------|------------|
| Duplicate rows | Pre-insert check for existing `id`; `setCanonicalFeedback` still dedupes by `id` via `Map`. |
| Missing rows beyond API + pagination | Unchanged: older rows still require **load more**; realtime window is still capped at 30 in the store. |
| `removed` ignored | Same class of correctness as old merge (which did not evict rows that left the realtime window). True multi-client deletes may need a separate signal if product requires it. |
| `refetchFirstPage` drops pages 2+ | By design (full replace of page 1); callers must use only when a hard reset is intended. |
| Counts vs `items.length` | Still using **`sessionCountsStore` / `fetchCountsDedup`** for totals; not tied to loaded list length. |
