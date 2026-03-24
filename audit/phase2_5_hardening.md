# Phase 2.5 - System Hardening

## Fixes applied

- Hardened `ECHLY_GET_GLOBAL_STATE` in `echly-extension/src/background.ts` to await `rehydrateSession()` before returning state whenever rehydration is required.
- Added a single deterministic token function `getOrRefreshToken()` and routed both `getExtensionToken()` and `getValidToken()` through it.
- Added shared `clearAuthState()` to keep token/user cleanup consistent across all auth-failure paths.
- Added explicit error logs in failure paths for `rehydrateSession`, `loadMore`, active-session rehydrate, login trigger, and tab message delivery.
- Set `extensionTokenExpiresAt` when handling `ECHLY_SET_EXTENSION_TOKEN` to prevent token metadata drift.

## Removed silent failures

- Replaced silent pagination catch in `loadMore()` with explicit logging and deterministic failure behavior.
- Replaced `sendMessage(...).catch(() => {})` usages in background message dispatch paths with logged errors via `logMessageDeliveryError(...)`.
- Converted empty catches in critical background flows to observable logs:
  - pre-injection probe failure
  - set-active-session rehydrate failure
  - login trigger failure
  - auth hydrate refresh failure

## Token system unified

- Introduced `getOrRefreshToken()` as the single source of token truth:
  - returns token when still valid (after dashboard session verification),
  - refreshes from `/api/extension/session` when missing/expired,
  - throws `NOT_AUTHENTICATED` on any failure (no silent fallback).
- Existing token entrypoints now delegate to the unified function:
  - `getExtensionToken()`
  - `getValidToken()`
- This removes the prior inconsistency where pagination depended on a non-refresh path while rehydrate used refresh logic.

## Stale-state prevention added

- `ECHLY_GET_GLOBAL_STATE` no longer returns immediate possibly stale state while rehydration runs asynchronously.
- When state is empty/stale and session exists, background now:
  1. starts `rehydrateSession(sessionId)`
  2. waits for completion
  3. then responds with canonical fresh state
- This closes stale-window races during service-worker cold starts, tab activation resyncs, and visibility recoveries.

