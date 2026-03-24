## Rehydration triggers

- Background startup: when `activeSessionId` exists in `chrome.storage.local`, startup treats this as restart/cold state and calls `rehydrateSession(sessionId)`.
- `ECHLY_GET_GLOBAL_STATE`: background checks storage + memory; if state is empty or stale (`lastSyncedAt` older than 60s), it triggers rehydration.
- Visibility/tab regain: on `chrome.tabs.onActivated`, if a session exists and state is stale, background rehydrates before normal sync flow.
- Token refresh: on `ECHLY_EXTENSION_TOKEN` and `ECHLY_SET_EXTENSION_TOKEN`, if a session exists, rehydration is triggered to rebuild authoritative state from backend.

## Cold start handling

- Cold start detection uses persisted storage truth:
  - in-memory state has no sync marker (`lastSyncedAt` is null)
  - `chrome.storage.local.activeSessionId` exists
- This is treated as lifecycle restart (service worker restart / extension reopen), not a warm continuation.
- Rehydration sets loading flags immediately and clears in-memory feedback/cursor/counts before fetching, preventing stale list display.

## State replacement logic

- `rehydrateSession(sessionId)` performs strict replacement only:
  - sets `sessionLoading = true` and `isFetching = true`
  - clears feedback items, counts, `nextCursor`, and `hasMore`
  - fetches first page: `GET /api/feedback?sessionId=...&limit=20`
  - fetches fresh counts: `GET /api/feedback/counts?sessionId=...`
  - replaces full state (`items`, `nextCursor`, `hasMore`, counts)
  - updates `lastSyncedAt = Date.now()`
  - sets session lifecycle state active and broadcasts canonical state
- No old cursor reuse, no list merge, and no fallback to stale memory.

## Edge cases handled

- Service worker restart with active session in storage: rehydrates from backend on startup.
- Idle/background return after >60s: stale timestamp forces rehydrate.
- Tab inactivity then activation: stale check on activation forces rebuild.
- Token renewed while session is active: rehydrate executes to avoid carrying stale pointers/cursor.
- Concurrent rehydrate requests: guarded by a shared in-flight promise to avoid duplicated concurrent fetches.
- Rehydrate failure: state remains intentionally empty/loading-resolved (not stale), so UI never shows previously cached pointers.
