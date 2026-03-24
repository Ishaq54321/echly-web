# Phase 3 Cleanup Report

## Removed Code

- **`echly-extension/src/background.ts`**
  - Dead message handler **`ECHLY_GET_TOKEN`** (no callers in repo; token access uses **`ECHLY_GET_EXTENSION_TOKEN`**).
  - Redundant wrappers **`getExtensionToken`** and **`getValidToken`** — all call sites now use **`getOrRefreshToken()`** only.
  - Verbose **`console.log`** traces: `loadMore` pagination dumps, token YES/NO lines, OPEN_WIDGET / OPEN_RECORDER / injection / capture-mode / LOAD_MORE / feedback lock lifecycle / `echly-api` token probe, and owner-tab lifecycle chatter.
- **`echly-extension/src/contentAuthFetch.ts`**
  - Unused **`ECHLY_DEBUG`** import and duplicate **`API_BASE`** startup log (same signal already available from **`api.ts`** in the content bundle).
- **`lib/capture-engine/core/CaptureWidget.tsx`**
  - Empty diagnostic **`useEffect`** that only logged when **`SessionLimitUpgradeView`** would render.
  - Unconditional scroll/pagination **`console.log`** spam; optional **`ECHLY_DEBUG`** **`console.debug`** only for attach/detach of the scroll listener.
- **`lib/capture-engine/core/ResumeSessionModal.tsx`**
  - Unconditional UX **`console.log`** for modal fetch start and session count → gated behind **`ECHLY_DEBUG`**.
- **`lib/capture-engine/core/WidgetFooter.tsx`**
  - Click **`console.log`** → **`ECHLY_DEBUG`** **`console.debug`** only.
- **`lib/capture-engine/core/hooks/useCaptureWidget.ts`**
  - **`console.count("useCaptureWidget render")`** (noisy per-render diagnostic).

## Simplifications

- **Single token entry point in the background**: **`getOrRefreshToken()`** is the only async token resolver used by **`rehydrateSession`**, **`loadMore`**, **`hydrateAuthState`**, **`ECHLY_GET_EXTENSION_TOKEN`**, **`ECHLY_UPLOAD_SCREENSHOT`**, **`ECHLY_CREATE_FEEDBACK`**, and **`echly-api`**.
- **Background logging**: default builds emit almost no **`console.log`** from the service worker; lifecycle noise is behind **`ECHLY_DEBUG`** (install/activate/init).
- **UI / capture-engine**: pagination and load-more behavior unchanged; only logging volume and dead effects were reduced.

## What was intentionally kept

- **State ownership & broadcasts**: **`getCanonicalGlobalState`**, **`broadcastUIState`**, **`echlyLog`** (still **`ECHLY_DEBUG`**-gated), **`chrome.tabs` sync** listeners, and session idle handling — untouched except log removal.
- **Rehydration & pagination**: **`rehydrateSession`**, **`loadMore`**, **`retryRehydrateWithBackoff`**, **`shouldForceRehydrate`**, **`ECHLY_LOAD_MORE`**, **`ECHLY_GLOBAL_STATE`** — no logic rewrites.
- **Token system**: **`ECHLY_GET_EXTENSION_TOKEN`**, **`ECHLY_SET_EXTENSION_TOKEN`**, **`echly-api`** proxy, **`apiFetch`** / **`contentAuthFetch`** split (different responsibilities: message proxy vs direct cookie **`fetch`**).
- **Message types**: **`GET_AUTH_STATE`** alias and **`ECHLY_GET_AUTH_STATE`** kept (external/legacy callers not fully auditable from this pass).
- **Critical diagnostics**: **`console.error`**, **`console.warn`**, guardrail logs, and **`logMessageDeliveryError`** for failed **`sendMessage`** deliveries.

## Risk Check

**PASS** — Extension build (`npm run build:extension`) succeeds after cleanup. No architectural refactors; removals were limited to dead handler, duplicate token wrappers, redundant logs, and one empty UI effect.

**Manual verification recommended** (not run in this session): pagination near bottom, tray minimize → reopen, cold rehydrate after resume, and feedback create — behavior should match pre-cleanup.
