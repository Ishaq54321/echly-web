# Echly Extension — Phase 3: Implemented Refactor Changes

**Date:** 2025-03-10  
**Scope:** Logging cleanup and ECHLY_DEBUG gating only. No behavior or pipeline changes.

---

## 1. LOGGING STANDARD

### ECHLY_DEBUG

- **Defined in** `lib/utils/logger.ts`:
  - `ECHLY_DEBUG = (process.env?.NODE_ENV === "development") || (window.__ECHLY_DEBUG__ === true)`
  - Ensures debug logs run in Next.js development and in extension when `window.__ECHLY_DEBUG__ = true` (e.g. from console).
- **Used for:** All debug `console.log` / `console.debug` / `console.warn` that were previously always-on. Real failures still use `console.error` (unchanged).

### echlyLog

- **Updated** `lib/debug/echlyLogger.ts`: `echlyLog()` now checks `ECHLY_DEBUG` and returns immediately when false. No-op in production unless `__ECHLY_DEBUG__` is set.

### echlyDebug (logger)

- **Updated** `lib/utils/logger.ts`: `log()`, `warn()`, `echlyDebug()` now use `ECHLY_DEBUG` instead of `isDev` so extension can enable via `window.__ECHLY_DEBUG__`. `isDev` remains for other use (still `process.env.NODE_ENV === "development"`).

---

## 2. FILES MODIFIED

### Lib

- **lib/utils/logger.ts** — Added `ECHLY_DEBUG`; `log`, `warn`, `echlyDebug` gated by it.
- **lib/debug/echlyLogger.ts** — Import `ECHLY_DEBUG`; `echlyLog` no-op when `!ECHLY_DEBUG`.
- **lib/captureContext.ts** — Import `ECHLY_DEBUG`; internal `echlyDebug()` only logs when `ECHLY_DEBUG`.
- **lib/graph/instructionGraphEngine.ts** — Import `ECHLY_DEBUG`; graph node key log gated.

### Components

- **components/CaptureWidget/RegionCaptureOverlay.tsx** — Import `ECHLY_DEBUG`; gated 3 capture/element/rect logs; dimension mismatch `console.warn` gated.
- **components/CaptureWidget/hooks/useCaptureWidget.ts** — Import `ECHLY_DEBUG`; all debug `console.log`/`console.debug`/`console.warn` (pending clear, voice, createCaptureRoot, removeCaptureRoot, session, pipeline) gated. `console.error` for real failures left as-is.
- **components/CaptureWidget/session/feedbackMarkers.ts** — Import `ECHLY_DEBUG`; marker clicked/created/removed logs gated.
- **components/CaptureWidget/session/sessionMode.ts** — Import `ECHLY_DEBUG`; `logSession()` only calls `console.debug` when `ECHLY_DEBUG`.
- **components/CaptureWidget/ResumeSessionModal.tsx** — Import `ECHLY_DEBUG`; sessions-returned log gated.

### App

- **app/(app)/dashboard/[sessionId]/SessionPageClient.tsx** — Import `ECHLY_DEBUG`; "ECHLY CLARITY DEBUG" and "CLARITY DEBUG" `console.log` gated.

### Extension

- **echly-extension/src/background.ts** — Import `ECHLY_DEBUG`; API_BASE log and all `console.debug` (broadcast/sync failures) gated. `console.error` for upload/structure/create errors left as-is.
- **echly-extension/src/api.ts** — Import `ECHLY_DEBUG`; API_BASE log gated.
- **echly-extension/src/contentAuthFetch.ts** — Import `ECHLY_DEBUG`; API_BASE log gated.
- **echly-extension/src/content.tsx** — Import `ECHLY_DEBUG`; all OCR, AI payload, voice submitted, clarity, sessions, create-session logs and wheel/scroll debug gated.

---

## 3. WHAT WAS NOT CHANGED

- No file splits or merges.
- No function or pipeline logic changes.
- No capture flow changes (hideEchlyUI, captureVisibleTab, cropImageToRegion, getFullTabImage).
- No AI or session behavior changes.
- `console.error` for real errors (e.g. microphone denied, delete/save failed, structure failed) kept as-is.
- content.js is built from content.tsx; no direct edits to content.js.

---

## 4. SAFETY CHECK (MANUAL)

After refactor, verify:

- **Region capture:** Drag region → capture → crop → voice → structure-feedback → ticket.
- **Session capture:** Click element → crop → voice → structure-feedback → marker.
- **Voice recording:** Start → transcript → finish → pipeline; no change in when pipeline runs.
- **OCR:** visibleText still passed in context to structure-feedback.
- **AI pipeline:** POST /api/structure-feedback unchanged.
- **Ticket creation & screenshot upload:** Unchanged.

In production build, debug logs should not appear unless `window.__ECHLY_DEBUG__ = true` is set in the console (extension) or NODE_ENV is development (Next.js).
