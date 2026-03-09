# Echly Extension — Phase 1: Full System Audit

**Date:** 2025-03-10  
**Scope:** Read-only audit. No behavior or architecture changes.

---

## 1. FULL ARCHITECTURE MAP

### User interaction flow
```
extension open → region selection (RegionCaptureOverlay) → voice recording (VoiceCapturePanel)
→ transcript → screenshot capture (getFullTabImage / CAPTURE_TAB) → OCR extraction (visibleText)
→ AI structure pipeline (POST /api/structure-feedback) → ticket creation → screenshot upload
→ ticket patch (screenshotUrl)
```

### Capture pipeline
```
RegionCaptureOverlay (performCapture)
  → getFullTabImage() = captureTabWithoutOverlay(capture)
  → hideEchlyUI() [hides sidebar, launcher, voice UI; does NOT hide echly-region-overlay / echly-region-cutout]
  → chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })
  → background: chrome.tabs.captureVisibleTab(windowId, { format: "png" })  [single call per capture]
  → restoreEchlyUI()
  → cropImageToRegion(fullImage, region, dpr) → containerCrop, selectionCrop
  → onAddVoice(containerCrop, context)
```

### Session pipeline
```
Session overlay → element click (isSessionCaptureTarget) → element detection
→ container detection (detectVisualContainer) → DOM context (buildCaptureContext)
→ cropAroundElement / cropImageToRegion → context + screenshot → AI processing
```

### AI pipeline
```
transcript + DOM context (visibleText, nearbyText, subtreeText, domPath)
→ POST /api/structure-feedback → runFeedbackPipeline / voiceToTicketPipeline
→ tickets + clarityScore / needsClarification
```

### Key files
| Role | File(s) |
|------|---------|
| Manifest | echly-extension/manifest.json |
| Background | echly-extension/src/background.ts |
| Content | echly-extension/src/content.tsx → content.js (bundled) |
| Popup | echly-extension/src/popup.tsx, popup.js |
| Region overlay | components/CaptureWidget/RegionCaptureOverlay.tsx |
| Capture hook | components/CaptureWidget/hooks/useCaptureWidget.ts |
| UI hide | components/CaptureWidget/hideEchlyUI.ts |
| Context | lib/captureContext.ts |
| Structure API | app/api/structure-feedback/route.ts |
| Upload | app/api/upload-screenshot/route.ts, lib/screenshot.ts, echly-extension/src/screenshotUpload.ts |

### Architectural guarantees verified
- **UI hiding:** hideEchlyUI does NOT hide `#echly-root`, `#echly-capture-root`, `.echly-region-overlay`, `.echly-region-cutout`. Selection overlay remains visible during capture.
- **Screenshot:** captureVisibleTab called only once per capture (background CAPTURE_TAB handler). Cropping happens after capture (cropImageToRegion).
- **OCR:** visibleText from context / getVisibleTextFromScreenshot; used in AI payload.
- **DOM snippet:** buildCaptureContext scoped to selected element; no full DOM in AI payload.
- **Capture flow:** No change to overlay visibility logic; captureTabWithoutOverlay hides only feedback UI.

---

## 2. FILE SIZE REPORT

| Lines | Path (source only) |
|-------|--------------------|
| 3902 | echly-extension/content.js (bundle) |
| 1478 | components/CaptureWidget/hooks/useCaptureWidget.ts |
| 1452 | echly-extension/src/content.tsx |
| 750 | echly-extension/src/background.ts |
| 543 | components/layout/operating-system/CommentPanel.tsx |
| 493 | lib/repositories/feedbackRepository.ts |
| 443 | components/session/feedbackDetail/ScreenshotWithPins.tsx |
| 431 | components/dashboard/WorkspaceCard.tsx |
| 425 | components/CaptureWidget/CaptureWidget.tsx |
| 403 | components/CaptureWidget/RegionCaptureOverlay.tsx (approx) |
| 394 | components/layout/operating-system/TicketList.tsx |
| 391 | components/layout/operating-system/FeedbackCommandPanel.tsx |
| 358 | lib/server/properNounAnchoring.ts |
| 347 | lib/ai/voiceToTicketPipeline.ts |
| 338 | components/layout/operating-system/ExecutionCanvas.tsx |

**Files >400 lines (candidates for modularization in a later, non-behavioral refactor):**  
useCaptureWidget.ts, content.tsx, background.ts, CommentPanel.tsx, feedbackRepository.ts, ScreenshotWithPins.tsx, WorkspaceCard.tsx, CaptureWidget.tsx, RegionCaptureOverlay.tsx, TicketList.tsx, FeedbackCommandPanel.tsx, properNounAnchoring.ts.

---

## 3. DEAD CODE REPORT

- **Unused exports:** No systematic unused-export scan run; recommended as follow-up (e.g. ts-prune).
- **Unused utilities:** `lib/capture.ts` — `captureScreenshot()` returns `null`; used by web app when not in extension (no screen capture). Not dead.
- **Legacy logic:** None identified that is clearly obsolete; all traced paths are in use.
- **Duplicate helpers:** `detectVisualContainer` and `clampRect` exist only in RegionCaptureOverlay and are imported by useCaptureWidget — no duplication.
- **Unused React state:** Not audited per-variable; recommended in a later pass.
- **Conflicting paths:** Single capture path: getFullTabImage → CAPTURE_TAB → captureVisibleTab → crop. No duplicate capture logic.

---

## 4. DEBUG LOGS & CONSOLE USAGE

### Raw console.log / console.debug (should be gated with ECHLY_DEBUG)
- **components/CaptureWidget/RegionCaptureOverlay.tsx:** 3× console.log (capture, element, container rect), 1× console.warn (dimension mismatch — keep or gate).
- **components/CaptureWidget/hooks/useCaptureWidget.ts:** 40+ console.log/console.debug (pending clear, voice, createCaptureRoot, removeCaptureRoot, etc.). console.error kept for real failures.
- **components/CaptureWidget/session/feedbackMarkers.ts:** 3× console.log (marker clicked/created/removed).
- **components/CaptureWidget/session/sessionMode.ts:** console.debug behind typeof check.
- **components/CaptureWidget/ResumeSessionModal.tsx:** 1× console.log (sessions returned).
- **echly-extension/src/background.ts:** 1× console.log (API_BASE), 4× console.debug (broadcast/sync), multiple console.error (kept for failures).
- **echly-extension/src/content.tsx:** 15+ console.log (OCR, AI payload, sessions, clarity), 2× console.debug (scroll/wheel), multiple console.error (kept).
- **echly-extension/src/api.ts, contentAuthFetch.ts:** 1× console.log each (API_BASE).
- **lib/captureContext.ts:** echlyDebug() always logs; should use central ECHLY_DEBUG.
- **lib/graph/instructionGraphEngine.ts:** 1× console.log ("ECHLY DEBUG — GRAPH NODE KEY").
- **app/(app)/dashboard/[sessionId]/SessionPageClient.tsx:** 2× console.log ("ECHLY CLARITY DEBUG", "CLARITY DEBUG"); log() already dev-gated.

### Already gated or acceptable
- **lib/utils/logger.ts:** isDev, log(), warn(), echlyDebug() — dev only.
- **lib/debug/echlyLogger.ts:** echlyLog() always logs; recommended to gate behind ECHLY_DEBUG.
- **lib/server/groundTranscriptClauses.ts:** DEBUG = process.env?.DEBUG_GROUNDING === "true".
- **app/api/structure-feedback/route.ts:** process.env.NODE_ENV !== "production" check.

---

## 5. REDUNDANT / OUTDATED

- **API_BASE log:** Same message in background.ts, api.ts, contentAuthFetch.ts — log once or gate.
- **Comments:** hideEchlyUI.ts and overlay-ui-structure.md are aligned; no misleading comments identified in critical paths.
- **Shadow DOM:** hideEchlyUI correctly targets shadow root; no unnecessary guards identified.

---

## 6. RACE CONDITIONS & OVERLAY SAFETY

- **Capture flow:** hideEchlyUI → rAF → rAF → capture → restore. Single captureVisibleTab per request. No double-capture race identified.
- **Overlay interference:** hideEchlyUI explicitly excludes region overlay; no code path hides the selection rectangle during capture.

---

## 7. LARGE FILES MIXING UI + LOGIC + UTILITIES

- **useCaptureWidget.ts:** UI state, capture root lifecycle, speech recognition, session, markers, pipeline — mixed; split would be a larger refactor.
- **content.tsx:** Message handling, OCR, structure-feedback, session list, UI — mixed.
- **background.ts:** Auth, session, CAPTURE_TAB, ECHLY_PROCESS_FEEDBACK, ECHLY_UPLOAD_SCREENSHOT — single entry point; splitting would be structural.

Splits are deferred to the refactor plan; this audit does not change behavior.
