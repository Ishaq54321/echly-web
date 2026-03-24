# Phase 2.9 — Truth Enforcement and Failure Integrity

## Objective

Make the extension capture stack **failure-transparent**, **HTTP-safe**, **auth-correct**, and **UI-truthful**: no hidden failures, no assumed success, no trusting invalid HTTP responses.

## Fix 1 — Remove silent failures

| Area | Change |
|------|--------|
| `lib/capture-engine/ExtensionCaptureEnvironment.ts` | Replaced all `.catch(() => {})` on `chrome.runtime.sendMessage` with `logSendMessageFailure(...)`. `ECHLY_SET_ACTIVE_SESSION` now logs `chrome.runtime.lastError` in the callback. |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | `AudioContext.close()` rejection logged; empty `catch` around `mediaRecorder.stop` and `handleShare` clipboard now log via `logger.error`. |
| `echly-extension/src/ocr.ts` | Empty `catch` replaced with `console.error` + return `""`. |
| `echly-extension/src/cachedSessions.ts` | Per-session counts failure: `console.error` with `sessionId` + error. |
| `echly-extension/src/background.ts` | `chrome.tabs.onCreated` → `sendMessage` rejection now uses `console.error` (not debug-only). |

**Verification:** `grep` for `.catch(() => {})` and empty `catch {}` under `echly-extension/src` and `lib/capture-engine` returns no matches.

## Fix 2 — HTTP safety

| Path | Behavior |
|------|------------|
| `echly-extension/utils/apiFetch.ts` (background Bearer token) | After 401 handling, **`if (!response.ok) throw new Error("API_ERROR_" + response.status)`** before returning. |
| `echly-extension/src/api.ts` | Exported **`throwIfHttpError(res, context?)`** for JSON/message-proxy callers. **FormData** branch returns the raw `Response` unchanged so transcribe can read `!res.ok` bodies (e.g. `NO_SPEECH_DETECTED`). |
| `echly-extension/src/content.tsx` | `throwIfHttpError` before `res.json()` on: structure-feedback, ticket PATCH/DELETE, session title PATCH, session GET for resume. **createSession** handles `403` + `PLAN_LIMIT_REACHED` before treating other statuses as errors. |
| `echly-extension/src/cachedSessions.ts` | **`!res.ok`** on `/api/sessions` → log + `[]` (no parse of error HTML as JSON). |
| `echly-extension/src/countsRequestStore.ts` | **`!res.ok`** on counts fetch → throw `API_ERROR_*`. |

**Background** `rehydrateSession` / `loadMore` / `fetchFeedbackCountFresh` rely on the shared `utils/apiFetch` throw so invalid pages are not merged into global UI state.

## Fix 3 — Auth shortcut removed

`hydrateAuthState()` in `echly-extension/src/background.ts` **no longer** returns `true` when `sw.currentUser && sw.extensionToken` without validation. It now **`await getOrRefreshToken()`** (expiry + dashboard session checks via existing implementation) and returns **`!!(sw.currentUser?.uid && sw.extensionToken)`**, or `false` on any failure (logged).

## Fix 4 — UI reflects confirmed success only

| Flow | Behavior |
|------|----------|
| **startSession** (`useCaptureWidget`) | Clears `errorMessage` at start; on failure sets **"Could not start session. Try again."** (no silent catch-only log). |
| **ECHLY_START_SESSION** (`content.tsx`) | On `createSession` rejection, sets **`sessionStartErrorBanner`**; cleared when session id exists or user dismisses / session becomes active. |
| **saveEdit** | **Does not** exit edit mode until PATCH succeeds. On failure: **restore `editingId`**, set **`errorMessage`** for save failure. |
| **Feedback pipeline** | Failed jobs set **`errorMessage`** from the error when possible (API vs generic). |

**UI:** `CaptureWidget` shows **`sessionStartErrorBanner`** on the extension home screen with optional Dismiss.

## Fix 5 — Error propagation

- Background `broadcastUIState` / tab `sendMessage` already log failures; **no** empty `catch` on new-tab sync.
- Content `chrome.runtime.sendMessage` chains continue to use **`logSendMessageRejection`** (or equivalent) so promise rejections are not dropped.
- Message-proxy `echly-api` errors still return structured `{ ok: false, body }` to the client when the proxy throws.

## Exceptions / notes

- **Transcribe (FormData)** via `api.ts`: must not auto-throw in the wrapper before the client reads `res.json()` for `!res.ok` cases; the **`useCaptureWidget`** path still branches on **`!res.ok`** after parsing.
- **Web app** (`app/`, `components/`) outside the extension bundle was not part of this phase; some `.catch(() => {})` may remain there.

## Success criteria (checklist)

- [x] No silent `.catch(() => {})` / empty `catch {}` in extension capture + `echly-extension` sources touched above.
- [x] Background API calls use `utils/apiFetch` non-OK → throw.
- [x] Content JSON calls use `throwIfHttpError` or explicit status handling (403 plan limit).
- [x] `hydrateAuthState` always goes through refresh/expiry path.
- [x] UI: session start failure, save-edit failure, and feedback failure surfaces visible.

## Goal

**Honest, deterministic behavior:** state matches what the network and auth layer actually confirmed.
