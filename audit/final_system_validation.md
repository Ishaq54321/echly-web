# Final System Validation (Unbiased)

## 1. Source of Truth Verdict
- **FAIL**
- `background.ts` is the primary owner of runtime session state (`sessionId`, feedback list, pagination cursor, `hasMore`, counts, lifecycle flags) and is the only file that mutates those canonical values directly.
- But ownership is not perfectly single-source in practice:
  - `content.tsx` keeps its own `globalState` React state and initializes it with defaults, then overwrites from background. That is a mirror, but still a second in-memory copy.
  - `useCaptureWidget.ts` keeps additional local pointer/session-related fallback paths (`pointersProp ?? loadSessionWithPointers?.pointers ?? initialPointers ?? []`), which can create alternate render inputs outside immediate background pushes.
- No evidence that files outside `background.ts` directly mutate `nextCursor`/`hasMore` canonical values in extension runtime.

## 2. State Flow Integrity
- **FAIL**
- Flow trace (`Start session -> Add feedback -> Receive global state -> Render UI`):
  - **State created**:
    - Session lifecycle baseline is created in `background.ts` (`ECHLY_SET_ACTIVE_SESSION`, `ECHLY_SESSION_MODE_START`, and startup `initializeSessionState`).
    - Rehydrated feedback/cursor/hasMore are created in `rehydrateSession`.
  - **State mutated**:
    - `background.ts` mutates canonical state on `ECHLY_SET_ACTIVE_SESSION`, `rehydrateSession`, `loadMore`, `ECHLY_FEEDBACK_CREATED`, and session mode events.
    - `content.tsx` mutates only local mirror (`setGlobalState`) from inbound background state/messages.
  - **State stored**:
    - Durable lifecycle keys (`activeSessionId`, `sessionModeActive`, `sessionPaused`) in `chrome.storage.local`.
    - Canonical feedback list/cursor/hasMore are in-memory in background only.
    - UI mirror copy exists in content React state.
- Duplicate ownership risk:
  - `ECHLY_GET_GLOBAL_STATE` can return current snapshot while rehydrate is triggered asynchronously, so renderer can temporarily present stale/old mirror before replacement arrives.

## 3. Rehydration System
- **FAIL**
- **Scenario A: service worker restart, memory cleared, storage still has session**
  1. `rehydrateSession` is triggered from startup `initializeSessionState` when `activeSessionId` exists.
  2. Old in-memory feedback is not reused (memory is cold; rehydrate sets empty loading state first).
  3. Cursor is not reused from old memory; replaced from API or null.
  4. List is replaced, not merged, during rehydrate.
  5. Stale UI risk is low after worker restart, but not zero at tab level until first broadcast lands.
- **Scenario B: idle >60s, user reopens extension**
  1. Rehydrate is triggered by staleness checks (`shouldForceRehydrate`) on tab activation and `ECHLY_GET_GLOBAL_STATE`.
  2. Old state may be briefly reused because `ECHLY_GET_GLOBAL_STATE` responds immediately while `rehydrateSession` runs async.
  3. Cursor can be briefly reused in that immediate response window.
  4. Eventually replaced by rehydrate result.
  5. **Yes, stale UI can appear transiently** before rehydrate broadcast updates content.
- **Scenario C: token expires and refreshes**
  1. Rehydrate path calls `getExtensionToken` (can refresh token via session endpoint) so rehydrate can proceed.
  2. `loadMore` path uses `getValidToken` only (no refresh path), so pagination can fail when token expires until another flow refreshes token.
  3. Cursor may remain stale if pagination fails after expiry.
  4. List remains previous list (pagination catch keeps existing pointers).
  5. Stale UI risk exists if token expiry happens during pagination without immediate rehydrate/refresh.

## 4. Failure Handling
- **FAIL**
- `rehydrateSession` failure handling intentionally resets to empty state (good for avoiding stale merge), but catch is silent (no surfaced failure reason).
- `loadMore` failure path silently swallows errors and preserves existing list/cursor state; this can keep invalid cursor and stale pagination readiness.
- Multiple `.catch(() => {})` fire-and-forget message sends hide transport failures; this can mask missed UI sync events.
- Partial initialization case:
  - If storage indicates session active but rehydrate fails, UI ends in active session mode with empty pointers/counts. Deterministic, but potentially misleading without explicit error signal.

## 5. Hidden Violations
- Remaining merge/fallback/preserve behaviors found:
  - `background.ts` pagination appends (`globalUIState.pointers = [...globalUIState.pointers, ...filteredItems]`) and preserves existing pointers on pagination error.
  - `content.tsx` normalization/fallback defaults (`items: []`, `nextCursor: null`, `hasMore: false`) can mask malformed/partial upstream state.
  - `useCaptureWidget.ts` pointer selection fallback chain (`pointersProp ?? loadSessionWithPointers?.pointers ?? initialPointers ?? []`) is an extra source for rendered list inputs.
- Silent catches present in critical paths (`rehydrate`, pagination, message passing), reducing observability and making hidden desync harder to detect.

## 6. Final Verdict

❌ SYSTEM IS NOT RELIABLE

The current implementation is closer to deterministic than older merge-based models, but it still has meaningful reliability gaps under lifecycle stress: asynchronous stale-state windows, silent failure swallowing, and token-expiry pagination behavior that can preserve stale cursor/list state without explicit recovery signaling.
