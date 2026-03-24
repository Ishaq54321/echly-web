# Final System Certification V4

**Scope:** Extension runtime only — `echly-extension/src/**`, built `background.js` / `content.js` / `manifest.json`, and `lib/capture-engine/core/hooks/useCaptureWidget.ts`.

**Method:** Source and built artifacts were read and cross-checked; patterns were searched for token paths, empty error handling, and ownership of session/feedback/pagination. Previous audit docs were not trusted.

---

## Runtime Alignment

**PASS**

- `manifest.json` declares `background.service_worker: "background.js"` and `content_scripts[0].js: ["content.js"]` — matches the audited built files.
- `background.js` contains `HARDENED BACKGROUND RUNNING`, the bundled `apiFetch` + `x-extension-token` path, `rehydrateSession` / `loadMore` / `retry` (`LOAD_MORE_RECOVERY_DELAYS` equivalent), and `getOrRefreshToken` logic (`te()` / session POST). This aligns with `echly-extension/src/background.ts`.
- `content.js` is a large bundle consistent with React + `content.tsx` compilation (not re-verified line-by-line against source; structural match only).

---

## Source of Truth

**FAIL**

- **Background** owns `globalUIState`: session id/mode, feedback pointers, pagination cursors, counts, rehydration, `loadMore`, token acquisition via `getOrRefreshToken()`, and API calls using `utils/apiFetch` after `setExtensionToken`.
- **Content** is largely a mirror: `globalState` is applied from `ECHLY_GLOBAL_STATE` / `ECHLY_GET_GLOBAL_STATE` with “full replacement” comments (`content.tsx`). Session creation uses `apiFetch` → background `echly-api` + `getExtensionToken()`.
- **Violations:**
  - `lib/capture-engine/ExtensionCaptureEnvironment.ts` wraps many `chrome.runtime.sendMessage` calls in **`.catch(() => {})`**, so failures to sync session mode / expand / activity to the background are **silently dropped** — the UI can think background was updated when it was not.
  - `useCaptureWidget.ts` keeps **`window.__ECHLY_CAPTURE_STATE__.pending`** for remount survival — local persistence that is not the background’s canonical session/feedback store (acceptable for capture UX, but not “pure mirror only” under a literal reading).

---

## State Flow Integrity

**FAIL**

- **Happy path** is coherent: content creates session → `ECHLY_SET_ACTIVE_SESSION` → background `rehydrateSession`; feedback creation goes through `ECHLY_CREATE_FEEDBACK` / `notifyFeedbackCreated`; pagination via `ECHLY_LOAD_MORE` → `loadMore()`.
- **Failure paths:**
  - `startSession` in `useCaptureWidget.ts` catches errors with **`logger.error` only** — user can remain in a misleading “starting” / idle state with **no surfaced error** (see `catch (e) { logger.error("error", "session_start_failed", e); }` before `finally`).
  - `ExtensionCaptureEnvironment` silent `.catch(() => {})` on lifecycle messages can desync **content assumptions** from **background truth** without surfacing failure.
  - `saveEdit` exits edit mode then may **fail persistence with only `logger.error`** — user sees edit closed as if saved (`useCaptureWidget.ts`).

---

## Lifecycle Safety

**FAIL**

- **Strengths:** Service worker restart loads `chrome.storage.local`, cold path calls `rehydrateSession`; `REHYDRATION_STALE_MS` (60s) drives `shouldForceRehydrate()` on tab activation; idle timeout ends session and broadcasts reset; `setRehydratingLoadingState` clears in-memory feedback before rehydrate to avoid showing stale lists.
- **Gaps:**
  - `hydrateAuthState()` returns **`true` when `sw.currentUser && sw.extensionToken` without checking expiry** — stale in-memory auth can be reported as authenticated until something calls `getOrRefreshToken()` (`background.ts`).
  - Tab `sendMessage` failures on activation are often **`ECHLY_DEBUG`-gated** `console.debug` — easy to miss in production (`background.ts` `onActivated`).
  - Messaging is inherently racy; **no formal ordering guarantee** between broadcast and content `visibilitychange` resync.

---

## Stale State Protection

**FAIL**

- Rehydration and “clear pointers while loading” reduce stale **lists** after recovery.
- Remaining issues:
  - **Auth:** short-circuit in `hydrateAuthState` (above) can yield **stale “authenticated”** relative to token validity.
  - **UI:** `saveEdit` optimistic close; **`startSession` silent catch**; concurrent async updates (feedback jobs + global pointers) without a single serial queue — **brief inconsistent frames are possible**.
  - **`isProcessingFeedback` failsafe** clears stuck state after 5s without distinguishing success/failure (`content.tsx`) — can hide a stuck pipeline from the user.

---

## Token System

**FAIL**

- **Strengths:** Background `apiFetch` (`utils/apiFetch.ts`) requires `extensionToken`; `getExtensionToken` / `getValidToken` delegate to **`getOrRefreshToken()`**; `echly-api` handler uses `getExtensionToken()` before proxying.
- **Gaps:**
  - **`hydrateAuthState` / `GET_AUTH_STATE`** can return authenticated **without refreshing or validating TTL** when memory still holds `sw.currentUser` + `sw.extensionToken` (`background.ts`).
  - Content `apiFetch` (`echly-extension/src/api.ts`) uses the background proxy for JSON; FormData uses **`ECHLY_GET_EXTENSION_TOKEN`** — still centralized in background, but **if** memory auth is stale, behavior depends on who calls what first.

---

## Failure Handling

**FAIL**

- **Explicit logging:** Many `chrome.runtime.sendMessage(...).catch` handlers in `content.tsx` and `background.ts` log via `logSendMessageRejection` / `logMessageDeliveryError` — good.
- **Counterexamples:**
  - **`ExtensionCaptureEnvironment.ts`:** multiple **`.catch(() => {})`** on session mode, activity, expand/collapse, login, open tab — **silent**.
  - **`useCaptureWidget.ts`:** **`audioContextRef.current?.close().catch(() => {})`**; empty **`handleShare`** try/catch; empty **`try { } catch { }`** around `mediaRecorder.stop` in some paths.
  - **`ECHLY_CREATE_FEEDBACK`** catch sends `{ success: false }` **without error detail** (`background.ts`).
  - **`CAPTURE_TAB`** failure path responds `{ success: false }` **without logging** in the catch arm.

---

## Pagination Resilience

**FAIL**

- **Strengths:** `loadMore` catch sets `recovering`, increments `recoveryAttempts`, keeps `hasMore` true, and triggers **`retryRehydrateWithBackoff`** with **fixed delays** `[0, 500, 1000, 2000, 4000]`; `isFetching` cleared in `finally`; `rehydrateSession` failure clears cursors and lists.
- **Gaps:**
  - **`rehydrateSession` and `loadMore` do not check `response.ok`** before `json()` and applying payload — non-2xx JSON bodies could be misinterpreted as valid feedback pages (depending on server shape).
  - **`rehydrateSession` swallows errors internally** (never rejects), so the **`catch (rehydrateError)`** in `retryRehydrateWithBackoff` is largely **dead code** for API failures; recovery correctness depends on **`lastSyncedAt` / session id checks** only.

---

## Retry System

**FAIL**

- Bounded loop (**5** attempts), increasing backoff, **no infinite loop** in background recovery for load-more failures.
- After exhaustion, **`recovering` is cleared** and a **warning** is logged — user is not blocked forever, but **UI may not clearly explain** that recovery failed (depends on tray implementation).
- **Dead catch branch** (above) weakens diagnosability.

---

## UI Truthfulness

**FAIL**

- Tray pointers and counts are intended to track **background `ECHLY_GLOBAL_STATE`** — good baseline.
- **Counterexamples:**
  - **`startSession`** does not reliably show failure to the user on thrown errors.
  - **`saveEdit`** can imply success when PATCH failed.
  - **`ExtensionCaptureEnvironment`** can lose session-mode updates silently — UI may **assume** background state that was never applied.
  - **Placeholder markers** (“Saving feedback…”) during async AI processing are **optimistic** by design — acceptable if failures always update UI; **`onError` paths exist** but are not uniform across every code path.

---

## Edge Case Safety

**FAIL**

- **Partial init / failed rehydrate:** Cleared lists and `lastSyncedAt === null` avoid showing fake data; user may see **empty session** without a clear “failed to load” banner in all views.
- **Message delivery failure:** Logged in many places; **not** everywhere (silent catches in `ExtensionCaptureEnvironment`; debug-only paths in tab sync).
- **Rapid interaction:** Duplicate feedback protection (`processingFeedbackIds`, job owner) helps; races between **`ECHLY_FEEDBACK_CREATED`**, rehydrate, and local job state remain possible.
- **Token refresh mid-session:** `hydrateAuthState` short-circuit risks **stale auth reporting**.

---

## FINAL VERDICT

**❌ SYSTEM IS NOT RELIABLE**

Under the certification rules (**PASS only if no failure path exists**), the extension + shared hook stack still has **silent failure surfaces**, **optimistic / unreported UI errors**, **HTTP handling gaps in rehydration/pagination**, and **stale auth short-circuiting**. The architecture moves in the right direction (background-owned session/feedback/pagination, rehydration, bounded retry), but it is **not** “bulletproof” or fully deterministic under production Chrome extension constraints.
