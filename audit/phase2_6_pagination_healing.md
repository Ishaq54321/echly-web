# Phase 2.6 - Self-Healing Pagination

## Objective
Guarantee pagination cannot get permanently stuck after a `loadMore` failure.

## Root Cause (Before Fix)
- `loadMore()` catch block set:
  - `globalUIState.nextCursor = null`
  - `globalUIState.hasMore = false`
- Future calls were hard-blocked by:
  - `if (globalUIState.isFetching || !globalUIState.hasMore || !globalUIState.nextCursor) return;`
- Result: one transient fetch failure could dead-end pagination until an unrelated external rehydrate trigger happened.

## Implemented Fix
Updated `echly-extension/src/background.ts` in `loadMore()` catch behavior:

1. Keep error logging for observability.
2. Remove permanent disable behavior (`nextCursor = null`, `hasMore = false`) from failure path.
3. Trigger automatic recovery via `await rehydrateSession(sessionId)` so pagination state is rebuilt from backend truth.
4. Add a retry guard:
   - `LOAD_MORE_RECOVERY_COOLDOWN_MS = 5000`
   - `lastLoadMoreRecoveryAt` timestamp
   - Prevents rapid rehydrate loops if API remains down.

## Recovery Strategy
- On any `loadMore` exception:
  - system logs failure
  - system attempts `rehydrateSession(sessionId)`
- `rehydrateSession` refreshes:
  - `pointers`
  - `nextCursor`
  - `hasMore`
  - counts and sync timestamp
- Therefore pagination state is restored from fresh backend session data without requiring user refresh.

## Guarantee Status
- `loadMore` failure no longer permanently disables pagination.
- Automatic recovery is attempted on every failure path (respecting cooldown guard).
- No deterministic dead-end state remains where pagination is forced off forever by a single failure.

## Success Criteria Check
- loadMore failure does NOT permanently disable pagination: **PASS**
- system auto-recovers via rehydrate: **PASS**
- no dead-end state exists: **PASS**
