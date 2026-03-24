# Phase 2.8 — UI Consistency Hardening

## Objective

Ensure the extension content UI does not hide failures, show stale placeholder global state, or simulate success locally. The UI reflects **background truth** only.

## What changed

### 1. Remove silent failures (`content.tsx`, `background.ts`)

- Added helpers **`logSendMessageRejection`** and **`logRuntimeLastError`** in `content.tsx` so every `chrome.runtime.sendMessage` promise rejection and `chrome.runtime.lastError` is surfaced via **`console.error`** with a `[ECHLY]` context label.
- Replaced every **`.catch(() => {})`** on `sendMessage` chains with **`(err) => logSendMessageRejection("…", err)`** (or equivalent).
- Replaced empty **`sendMessage(..., () => {})`** callbacks on **`ECHLY_SET_ACTIVE_SESSION`** with **`logRuntimeLastError`** when `lastError` is set.
- **`START_RECORDING`** callback now logs **`lastError`** and logs when **`response?.ok`** is false instead of returning silently.
- **`getExtensionToken`**, **`GET_AUTH_STATE`** (content paths), **`ECHLY_VERIFY_DASHBOARD_SESSION`**: callbacks now call **`logRuntimeLastError`**.
- **`getSessionsCached`** failure: **`console.error`** only; **no longer sets `hasPreviousSessions` to false** (avoids masking “unknown” as “none”).
- **`getPreferredTheme` / `applyThemeToRoot`**: empty `catch` blocks replaced with **`console.error`**.
- **`background.ts` `broadcastUIState`**: tab `sendMessage` rejection now uses **`console.error`** instead of a debug-only empty catch.

### 2. Remove fallback “success” for feedback (`content.tsx`)

- Removed **`fallbackResult`** in **`handleComplete`**: on failure the pipeline **rethrows** after **`onError`** so the UI does not return a fake local ticket.
- Removed **`fallbackTicket`** when **`/api/structure-feedback`** fails or returns no ticket: pipeline now **throws** (with **`console.error`** on network failure) instead of fabricating a ticket for the create path.

### 3. Eliminate stale global UI before first confirmation (`content.tsx`)

- **`globalState`** is now **`GlobalUIState | null`**, starting **`null`** (no default “idle” session snapshot).
- Until the first confirmed payload from **`ECHLY_GET_GLOBAL_STATE`** or **`ECHLY_GLOBAL_STATE`**, the app shows **“Syncing extension state…”** and does **not** render **`CaptureWidget`** with placeholder data.
- **Mount / visibility / inject / sync** **`ECHLY_GET_GLOBAL_STATE`** callbacks: **`logRuntimeLastError`**, **`console.error`** when `state` is missing or invalid, and normalized state applied before dispatch.
- **`ECHLY_GLOBAL_STATE`** runtime message path applies **`normalizeGlobalState`** before **`setHostVisibilityFromState`** / dispatch.

### 4. Strict render contract (single normalization path)

- **`normalizeGlobalState`** is the single place that defensively maps background payloads into **`GlobalUIState`** (including **`openCount` / `skippedCount` / `resolvedCount`** defaults when the message omits fields).
- **`CaptureWidget`** props use **`globalState` fields directly** after the **`globalState === null`** guard (no `?? 0` / `?? []` in JSX for counts and pointers).
- **`applyGlobalState`** and **`ECHLY_GLOBAL_STATE`** listeners always apply **normalized** state.

## Files touched

| File | Role |
|------|------|
| `echly-extension/src/content.tsx` | Primary UI hardening |
| `echly-extension/src/background.ts` | Broadcast failure logging |

## Verification

- `npm run build:extension:js` completes successfully.
- Grep: no **`.catch(() => {})`** in `echly-extension/src`.

## Success criteria (Phase 2.8)

| Criterion | Status |
|-----------|--------|
| No `.catch(() => {})` in extension `src` | Met |
| No local fake success for feedback completion | Met (`fallbackResult` / `fallbackTicket` removed) |
| No stale “default” global state before first background sync | Met (`null` + loading) |
| UI driven by background-confirmed global state | Met (normalize + null gate) |

## Notes

- **`createSession`** still returns **`null`** on API failure (failure signal, not a fake session id). That is unchanged from prior behavior.
- **`onSessionEnd={() => {}}`** remains a no-op; wiring session end to background was out of scope for this phase.
