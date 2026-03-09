# Echly Extension — Phase 2: Safe Refactor Plan

**Strict rules:** No architecture or pipeline changes. No new dependencies. No behavior change. Cleanup only.

---

## 1. LOGGING STANDARD

- **Introduce `ECHLY_DEBUG`:** Define in `lib/utils/logger.ts` (or shared place used by app + extension):
  - `ECHLY_DEBUG = (typeof process !== "undefined" && process.env?.NODE_ENV === "development") || (typeof window !== "undefined" && (window as any).__ECHLY_DEBUG__ === true)`
  - Use so extension can enable via `window.__ECHLY_DEBUG__ = true` when process is undefined.
- **Replace or wrap:** All debug `console.log` / `console.debug` with `if (ECHLY_DEBUG) { console.log(...) }`. Keep `console.error` for real failures (permission denied, delete failed, etc.).
- **Centralize:** Use `echlyDebug(label, data)` from logger where applicable; ensure it respects ECHLY_DEBUG (logger already uses isDev; align with ECHLY_DEBUG).
- **echlyLogger.ts:** Gate `echlyLog()` with ECHLY_DEBUG so it no-op in production unless __ECHLY_DEBUG__ is set.
- **captureContext.ts:** Replace local `echlyDebug` with shared ECHLY_DEBUG or logger.echlyDebug.

---

## 2. FILES TO SPLIT (DEFERRED)

- **useCaptureWidget.ts (~1478 lines):** Extract speech recognition setup and handlers into a hook (e.g. `useSpeechRecognition`) and/or extract capture-root lifecycle into a small module. Defer to a separate PR to avoid behavior risk.
- **content.tsx (~1452 lines):** Extract message handlers or OCR/AI submission into modules. Defer.
- **background.ts (~750 lines):** Extract auth vs. message handlers. Defer.

No splits in this cleanup; only logging and dead-code removal.

---

## 3. FILES TO MERGE

- None. No merging proposed.

---

## 4. FUNCTIONS TO DELETE

- None. No dead functions identified; only log removal/gating.

---

## 5. LOGS TO REMOVE OR WRAP

- **Remove:** API_BASE logs in background.ts, api.ts, contentAuthFetch.ts (or gate with ECHLY_DEBUG).
- **Wrap in ECHLY_DEBUG:** All debug console.log/console.debug listed in Phase 1 §4 in:
  - RegionCaptureOverlay.tsx
  - useCaptureWidget.ts
  - feedbackMarkers.ts
  - sessionMode.ts (already behind check; align with ECHLY_DEBUG if used)
  - ResumeSessionModal.tsx
  - background.ts (debug + API_BASE)
  - content.tsx
  - api.ts, contentAuthFetch.ts
  - captureContext.ts (echlyDebug)
  - instructionGraphEngine.ts
  - SessionPageClient.tsx (ECHLY CLARITY DEBUG / CLARITY DEBUG)
- **Keep as-is:** console.error for real errors (Microphone denied, Delete failed, Save failed, etc.).

---

## 6. LOGIC TO SIMPLIFY

- **Logger usage:** Prefer single `ECHLY_DEBUG` and `echlyDebug()` / `echlyLog()` gated by it; avoid ad-hoc `process.env.NODE_ENV` checks for logging.
- No algorithm or pipeline logic changes.

---

## 7. HOOKS TO CLEAN

- **useCaptureWidget:** Remove or gate `console.count("useCaptureWidget render")` (already behind NODE_ENV); gate with ECHLY_DEBUG for consistency. No dependency or behavior change.

---

## 8. UTILITY CENTRALIZATION

- **ECHLY_DEBUG:** Single export from `lib/utils/logger.ts` (or `lib/debug/constants.ts`). Extension and app both use it.
- **echlyDebug / echlyLog:** Both respect ECHLY_DEBUG; no new utilities.

---

## 9. IMPLEMENTATION ORDER (PHASE 3)

1. Add `ECHLY_DEBUG` and gate `echlyDebug` / `echlyLog` in logger and echlyLogger.
2. Gate or remove API_BASE logs in extension (background, api, contentAuthFetch).
3. Gate debug logs in RegionCaptureOverlay, useCaptureWidget, feedbackMarkers, ResumeSessionModal, sessionMode.
4. Gate debug logs in content.tsx, background.ts (remaining debug logs).
5. Gate captureContext echlyDebug and instructionGraphEngine log.
6. Gate SessionPageClient clarity debug logs.
7. Keep all console.error for failures; no removal of error reporting.

---

## 10. SAFETY CHECK (POST-REFACTOR)

Verify unchanged behavior for:

- Region capture (drag → capture → crop → voice → structure-feedback).
- Session capture (click element → crop → voice → structure-feedback).
- Voice recording (start → transcript → finish → pipeline).
- OCR extraction (visibleText in context).
- AI pipeline (POST /api/structure-feedback, clarity, tickets).
- Ticket creation and screenshot upload.

No automated tests run in this plan; manual verification recommended.
