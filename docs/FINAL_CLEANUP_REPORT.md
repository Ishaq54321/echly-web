# Echly Safe Final Cleanup — Diff Report

**Date:** 2025-03-05  
**Scope:** Minor leftovers only. No runtime behavior change, no working features removed.

---

## STEP 1 — Server pipeline context usage

### Analysis

| File | Role | Used by runFeedbackPipeline? |
|------|------|------------------------------|
| **lib/captureContext.ts** | Client-side: builds context in extension/web (buildCaptureContext, getDomPath, isEchlyElement, etc.). | **No.** Used only by RegionCaptureOverlay and useCaptureWidget (client). |
| **lib/server/pipelineContext.ts** | Server: PipelineContext type, getElementsForPrompt, getTextContextForPrompt, getDomPhrasesFromContext. | **Yes.** normalizeInput → normalizeContext produces PipelineContext; getDomPhrasesFromContext used in perception. |
| **lib/ai/spatial-context-builder.ts** | Server: buildSpatialContext (PipelineContext → SpatialContext), getSpatialScopeLines, extractDomSubtreeText. | **Yes.** runFeedbackPipeline calls buildSpatialContext and passes result to extraction/copy-correction/element-resolver (which use getSpatialScopeLines). |

**Single active context path in runFeedbackPipeline:**

1. Request body `context` (raw) → **normalizeContext** (in runFeedbackPipeline) → **PipelineContext**.
2. **getDomPhrasesFromContext(context)** → grounding (perception).
3. **buildSpatialContext** (from pipelineContext-shaped input) → **SpatialContext**.
4. Truncated spatial context → extraction; full spatial context → copy-correction and entity resolution.

No duplicate or competing context construction; captureContext is client-only, pipelineContext + spatial-context-builder are server-only. **No changes made.**

---

## STEP 2 — Extension background message handlers

### Handlers listed and usage

| Message | In background.ts | Sent from content.tsx | Sent from popup.tsx |
|---------|------------------|------------------------|----------------------|
| ECHLY_TOGGLE_VISIBILITY | ✓ | — | ✓ |
| ECHLY_EXPAND_WIDGET | ✓ | ✓ | — |
| ECHLY_COLLAPSE_WIDGET | ✓ | ✓ | — |
| ECHLY_GET_GLOBAL_STATE | ✓ | ✓ | — |
| **ECHLY_GET_STATE** | ✓ | **no** | **no** |
| ECHLY_SET_ACTIVE_SESSION | ✓ | ✓ | — |
| **ECHLY_GET_ACTIVE_SESSION** | ✓ | **no** | **no** |
| ECHLY_GET_TOKEN | ✓ | (via echly-api) | — |
| ECHLY_GET_AUTH_STATE | ✓ | ✓ | ✓ |
| ECHLY_OPEN_POPUP | ✓ | ✓ | — |
| ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN | ✓ | — | ✓ |
| START_RECORDING | ✓ | ✓ | — |
| STOP_RECORDING | ✓ | ✓ | — |
| CAPTURE_TAB | ✓ | (via widget getFullTabImage) | — |
| ECHLY_UPLOAD_SCREENSHOT | ✓ | (via contentScreenshot) | — |
| ECHLY_PROCESS_FEEDBACK | ✓ | ✓ | — |
| echly-api | ✓ | (via contentAuthFetch) | — |

### Handlers removed

- **ECHLY_GET_STATE** — removed. No sender in content or popup; ECHLY_GET_GLOBAL_STATE is used instead.
- **ECHLY_GET_ACTIVE_SESSION** — removed. No sender in content or popup; session comes from ECHLY_GET_GLOBAL_STATE or ECHLY_SET_ACTIVE_SESSION.

**File modified:** `echly-extension/src/background.ts`

---

## STEP 3 — Unused exports removed

### Removed (zero references after pipeline cleanup)

| Location | Export(s) removed | Reason |
|----------|-------------------|--------|
| **lib/server/pipelineContext.ts** | `VALID_TAGS`, `PipelineTag`, `isValidPipelineTag` | Only used by removed ontology/batch code in pipelineStages. No remaining references in repo. |

### Not removed (kept for safety or docs)

| Item | Status |
|------|--------|
| **lib/ai/aiCalls.ts** | Exports (AI_CALL_*, ALLOWED_AI_CALLS, AllowedAICall) have **zero imports** in code; only cited in runFeedbackPipeline comment. Left in place as documentation. |
| **lib/ai/spatial-distance.ts** | No imports from other files. Left in place; could be used by future spatial anchoring. |

**File modified:** `lib/server/pipelineContext.ts`

---

## STEP 4 — Extension flows verified

All of the following flows were **unchanged**; no code on these paths was removed or altered:

- **Extension load** — content script inject, background listener.
- **Widget injection** — content.tsx main(), shadow host, ContentApp.
- **Session start** — ECHLY_SET_ACTIVE_SESSION, START_RECORDING (handlers kept).
- **Element click capture** — SessionOverlay, clickCapture, elementHighlighter (unchanged).
- **Voice recording** — useCaptureWidget, Web Speech API, finishListening → onComplete (unchanged).
- **structure-feedback API** — runFeedbackPipeline, pipelineContext, spatial-context-builder (unchanged; only unused pipelineContext exports removed).
- **Ticket creation** — content/background POST /api/feedback, ECHLY_PROCESS_FEEDBACK (unchanged).
- **Marker creation** — useCaptureWidget onSuccess, createMarker (unchanged).

**Verification:** `npx tsc --noEmit` and `npm run build:extension` both succeed.

---

## STEP 5 — Cleanup diff summary

### Files removed

None.

### Exports removed

| File | Exports removed |
|------|------------------|
| lib/server/pipelineContext.ts | `VALID_TAGS`, `PipelineTag`, `isValidPipelineTag` |

### Message handlers removed

| Handler | Previous behavior |
|---------|-------------------|
| ECHLY_GET_STATE | Returned echlyEnabled, isRecording, sessionId (redundant with ECHLY_GET_GLOBAL_STATE). |
| ECHLY_GET_ACTIVE_SESSION | Returned sessionId (no caller). |

### Imports cleaned

- No new broken imports.
- pipelineContext.ts: no remaining references to PipelineTag or isValidPipelineTag anywhere; no import cleanups required elsewhere.

### Files modified

| File | Change |
|------|--------|
| echly-extension/src/background.ts | Removed handlers for ECHLY_GET_STATE and ECHLY_GET_ACTIVE_SESSION. |
| lib/server/pipelineContext.ts | Removed VALID_TAGS, PipelineTag, isValidPipelineTag. |

---

*End of final cleanup report. Runtime behavior and extension contracts (used message types) unchanged.*
