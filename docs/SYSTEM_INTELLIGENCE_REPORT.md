# Echly — Complete System Intelligence Report

**Purpose:** Full architecture analysis for safe cleanup and refactoring. No code modifications; documentation only.

**Generated:** 2025-03-05

---

## SECTION 1 — Full File Tree

Source tree for `/app`, `/lib`, `/components`, `/echly-extension`, `/api` (under app), `/hooks`, `/utils`. Build artifacts (`.next`, `node_modules`) excluded.

```
echly/
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── hooks/
│   │   │   │   ├── useCommandCenterData.ts
│   │   │   │   └── useWorkspaceOverview.ts
│   │   │   ├── insights/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── [sessionId]/
│   │           ├── hooks/
│   │           │   ├── useFeedback.ts
│   │           │   ├── useFeedbackDetailController.ts
│   │           │   └── useSessionFeedbackPaginated.ts
│   │           ├── overview/
│   │           │   ├── hooks/
│   │           │   │   └── useSessionOverview.ts
│   │           │   └── page.tsx
│   │           ├── SessionPageClient.tsx
│   │           └── page.tsx
│   ├── api/
│   │   ├── dashboard/
│   │   │   └── metrics/
│   │   │       └── route.ts
│   │   ├── feedback/
│   │   │   ├── counts/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── session-insight/
│   │   │   └── route.ts
│   │   ├── sessions/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── structure-feedback/
│   │   │   └── route.ts
│   │   ├── tickets/
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── upload-screenshot/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── page.tsx
├── lib/
│   ├── ai/
│   │   ├── aiCalls.ts
│   │   ├── contextFilter.ts
│   │   ├── copy-correction.ts
│   │   ├── element-resolver.ts
│   │   ├── fuzzy-similarity.ts
│   │   ├── pipelineMetrics.ts
│   │   ├── pipelineTokenBudget.ts
│   │   ├── runFeedbackPipeline.ts
│   │   ├── spatial-context-builder.ts
│   │   ├── spatial-distance.ts
│   │   └── ticketTitle.ts
│   ├── domain/
│   │   ├── comment.ts
│   │   ├── feedback.ts
│   │   ├── feedback-display.ts
│   │   ├── session.ts
│   │   └── signal.ts
│   ├── formatters/
│   │   └── formatActionStep.ts
│   ├── graph/
│   │   └── instructionGraphEngine.ts
│   ├── hooks/
│   │   └── useAuthGuard.ts
│   ├── intelligence/
│   │   ├── clustering.ts
│   │   ├── impactScoring.ts
│   │   ├── index.ts
│   │   ├── riskForecast.ts
│   │   ├── timeDecay.ts
│   │   ├── types.ts
│   │   └── velocityAnalyzer.ts
│   ├── repositories/
│   │   ├── commentsRepository.ts
│   │   ├── feedbackRepository.ts
│   │   ├── sessionsRepository.ts
│   │   └── usersRepository.ts
│   ├── server/
│   │   ├── auth.ts
│   │   ├── clauseSplitter.ts
│   │   ├── groundTranscriptClauses.ts
│   │   ├── instructionExtraction.ts
│   │   ├── instructionGraph.ts
│   │   ├── instructionOntology.ts
│   │   ├── instructionRefinement.ts
│   │   ├── instructionSegmentation.ts
│   │   ├── intentExtraction.ts
│   │   ├── patternDetection.ts
│   │   ├── pipelineContext.ts
│   │   ├── pipelineStages.ts
│   │   ├── properNounAnchoring.ts
│   │   ├── resolveAllOpenFeedbackInSession.ts
│   │   ├── serializeFeedback.ts
│   │   ├── speechNormalization.ts
│   │   ├── ticketVerification.ts
│   │   ├── transcriptNormalization.ts
│   │   ├── uiVocabularyNormalization.ts
│   │   └── (transcriptNormalization — see above)
│   ├── utils/
│   │   ├── date.ts
│   │   ├── logger.ts
│   │   └── time.ts
│   ├── authFetch.ts
│   ├── capture.ts
│   ├── captureContext.ts
│   ├── comments.ts
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── feedback.ts
│   ├── playDoneClick.ts
│   ├── playShutterSound.ts
│   ├── querySafety.ts
│   ├── screenshot.ts
│   ├── sessions.ts
│   ├── tagConfig.ts
│   ├── types/
│   │   └── index.ts
│   ├── viewerId.ts
│   └── firebase/
│       └── config.ts
├── components/
│   ├── CaptureWidget/
│   │   ├── hooks/
│   │   │   └── useCaptureWidget.ts
│   │   ├── session/
│   │   │   ├── clickCapture.ts
│   │   │   ├── cropAroundElement.ts
│   │   │   ├── elementHighlighter.ts
│   │   │   ├── feedbackMarkers.ts
│   │   │   └── sessionMode.ts
│   │   ├── CaptureHeader.tsx
│   │   ├── CaptureLayer.tsx
│   │   ├── CaptureWidget.tsx
│   │   ├── FeedbackItem.tsx
│   │   ├── FeedbackList.tsx
│   │   ├── index.tsx
│   │   ├── MicOrb.tsx
│   │   ├── RecordingCapsule.tsx
│   │   ├── RecordingMicOrb.tsx
│   │   ├── RegionCaptureOverlay.tsx
│   │   ├── ResumeSessionModal.tsx
│   │   ├── SessionControlPanel.tsx
│   │   ├── SessionFeedbackPopup.tsx
│   │   ├── SessionOverlay.tsx
│   │   ├── types.ts
│   │   ├── VoiceBubble.tsx
│   │   └── WidgetFooter.tsx
│   ├── command-center/
│   │   ├── AIExecutiveSummaryBlock.tsx
│   │   ├── ExecutionMomentumBlock.tsx
│   │   ├── FocusNowBlock.tsx
│   │   ├── index.ts
│   │   ├── MomentumBlock.tsx
│   │   ├── PriorityRadarBlock.tsx
│   │   ├── RiskBlock.tsx
│   │   ├── SignalHeatmapBlock.tsx
│   │   └── SystemOverviewBlock.tsx
│   ├── comments/
│   │   ├── CommentInput.tsx
│   │   ├── CommentItem.tsx
│   │   └── CommentThread.tsx
│   ├── dashboard/
│   │   ├── DashboardAIInsightsCard.tsx
│   │   ├── DashboardMetricsStrip.tsx
│   │   ├── DeleteSessionModal.tsx
│   │   ├── InsightStrip.tsx
│   │   ├── NeedsAttentionSection.tsx
│   │   ├── PriorityStack.tsx
│   │   ├── SessionsTableView.tsx
│   │   ├── ShareSessionModal.tsx
│   │   └── WorkspaceCard.tsx
│   ├── layout/
│   │   ├── operating-system/
│   │   │   ├── ActivitySlideOver.tsx
│   │   │   ├── CommentModeIndicator.tsx
│   │   │   ├── CommentPanel.tsx
│   │   │   ├── ContextIntelligenceColumn.tsx
│   │   │   ├── ContextPanel.tsx
│   │   │   ├── ExecutionCanvas.tsx
│   │   │   ├── ExecutionModeLayout.tsx
│   │   │   ├── ExecutionModeView.tsx
│   │   │   ├── ExecutionView.tsx
│   │   │   ├── FeedbackCommandPanel.tsx
│   │   │   ├── FeedbackListPanel.tsx
│   │   │   ├── FourZoneLayout.tsx
│   │   │   ├── index.ts
│   │   │   ├── SessionNavigator.tsx
│   │   │   ├── SignalStream.tsx
│   │   │   ├── SystemNavigationRail.tsx
│   │   │   ├── TicketItem.tsx
│   │   │   ├── TicketList.tsx
│   │   │   └── TicketMetadata.tsx
│   │   ├── AppLayoutClient.tsx
│   │   ├── GlobalNavBar.tsx
│   │   └── GlobalRail.tsx
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   ├── session/
│   │   ├── feedbackDetail/
│   │   │   ├── ActionItemsSection.tsx
│   │   │   ├── ActivityCollapsibleSection.tsx
│   │   │   ├── ActivityComposer.tsx
│   │   │   ├── ActivityPanel.tsx
│   │   │   ├── ActivityThread.tsx
│   │   │   ├── DescriptionSection.tsx
│   │   │   ├── ExecutionModeActionSteps.tsx
│   │   │   ├── FeedbackContent.tsx
│   │   │   ├── FeedbackDetail.tsx
│   │   │   ├── FeedbackHeader.tsx
│   │   │   ├── index.ts
│   │   │   ├── ScreenshotBlock.tsx
│   │   │   ├── ScreenshotWithPins.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── SelectableText.tsx
│   │   │   ├── SuggestionSection.tsx
│   │   │   └── types.ts
│   │   ├── FeedbackPremiumLoader.tsx
│   │   ├── FeedbackSidebar.tsx
│   │   ├── SessionHeader.tsx
│   │   └── SessionPremiumLoader.tsx
│   ├── system/
│   │   └── CommandPalette.tsx
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── FeedbackTag.tsx
│   │   ├── ResolvedToggle.tsx
│   │   └── Tag.tsx
│   ├── AudioWaveform.tsx
│   └── ErrorBoundary.tsx
├── echly-extension/
│   ├── assets/
│   │   └── Echly_logo.svg
│   ├── src/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── background.ts
│   │   ├── content.tsx
│   │   ├── contentAuthFetch.ts
│   │   ├── contentScreenshot.ts
│   │   ├── firebase.ts
│   │   ├── ocr.ts
│   │   ├── popup.ts
│   │   ├── popup.tsx
│   │   └── screenshotUpload.ts
│   ├── stubs/
│   │   └── next-image.tsx
│   ├── background.js
│   ├── content.js
│   ├── input.css
│   ├── manifest.json
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js
│   └── README.md
├── hooks/                    (empty at repo root)
├── utils/                    (empty at repo root)
├── docs/
├── middleware.ts
├── public/
└── (config files: package.json, tsconfig, etc.)
```

**Notes:**
- **Hooks** live under `app/(app)/dashboard/**/hooks/`, `components/CaptureWidget/hooks/`, and `lib/hooks/`; there is no top-level `/hooks` folder with files.
- **Utils** live under `lib/utils/`; there is no top-level `/utils` folder with files.
- **API** routes are under `app/api/` (Next.js App Router).

---

## SECTION 2 — Extension Architecture

### 2.1 Components

| Component | Role | Entry |
|-----------|------|--------|
| **Background script** | Service worker: auth, token refresh, global UI state, screenshot capture, upload, feedback processing. | `echly-extension/background.js` (built from `src/background.ts`) |
| **Content script** | Injected on `<all_urls>` at `document_idle`. Single script. Creates shadow host, mounts React widget, wires messaging. | `echly-extension/content.js` (from `src/content.tsx`) |
| **Popup** | Sign-in (Google OAuth) and toggle widget visibility. | `popup.html` → `popup.js` (from `src/popup.tsx`) |
| **Widget** | React UI inside content script’s shadow DOM (shared `components/CaptureWidget/*`). | Rendered by content script via `createRoot` → `ContentApp` |
| **Session overlay** | Session Feedback Mode UI: element hover, click capture, control panel, feedback popup. | `CaptureLayer` → `SessionOverlay` when `sessionMode && extensionMode` |
| **Capture layer** | Portal into `#echly-capture-root`: dim overlay, region drag, or session overlay. | `CaptureLayer.tsx`; portal target is div created in `useCaptureWidget` |

### 2.2 Interactions

1. **Popup → Background:** `chrome.runtime.sendMessage`: `ECHLY_TOGGLE_VISIBILITY`, `ECHLY_GET_AUTH_STATE`, `ECHLY_START_LOGIN`.
2. **Background → All tabs:** `chrome.tabs.query` + `chrome.tabs.sendMessage`: `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`.
3. **Content → Background:** `chrome.runtime.sendMessage`: token, auth, global state, session, capture tab, upload screenshot, process feedback, `echly-api` proxy.
4. **Content script ↔ Widget:** Same process. Content script registers `chrome.runtime.onMessage`; on `ECHLY_GLOBAL_STATE` / `ECHLY_FEEDBACK_CREATED` / `ECHLY_TOGGLE` it sets host visibility and dispatches **CustomEvents** (`ECHLY_GLOBAL_STATE`, `ECHLY_TOGGLE_WIDGET`, `ECHLY_FEEDBACK_CREATED`). React tree subscribes to these events.
5. **Widget UI:** Rendered inside content script’s shadow root; all Chrome messaging is done by the content script, not by React components directly.

---

## SECTION 3 — Runtime Execution Flow

End-to-end path from extension load through marker creation.

| Step | Location | Description |
|------|----------|-------------|
| 1. Extension load | Chrome | Content script injected at `document_idle` on matching URLs. |
| 2. Widget injection | `content.tsx` `main()` | Creates `#echly-shadow-host`, open shadow root, injects styles, `#echly-root`, `createRoot` → `ContentApp`. |
| 3. Initial state sync | `content.tsx` | `syncInitialGlobalState(host)` sends `ECHLY_GET_GLOBAL_STATE`; sets host display; `ensureMessageListener` registers `onMessage` and re-dispatches `ECHLY_GLOBAL_STATE` / `ECHLY_FEEDBACK_CREATED` / `ECHLY_TOGGLE_WIDGET`. |
| 4. Session start | User / content | User selects session (or URL segment); content sends `ECHLY_SET_ACTIVE_SESSION`. Optional: “Start recording” → `START_RECORDING` (background sets `isRecording`, broadcasts). Session Feedback Mode: `handleSessionStart` in `useCaptureWidget` sets `sessionMode`, `createCaptureRoot()`. |
| 5. Element click (Session Mode) | `SessionOverlay` → `clickCapture.ts` | When session mode and not paused: `attachClickCapture` on capture root; click handler uses `isSessionCaptureTarget`; prevents default and calls `onElementClicked(element)`. |
| 5. Region capture (Region Mode) | `RegionCaptureOverlay` | User drags rectangle; on release with min size, “Speak feedback” triggers capture. |
| 6. Screenshot capture | Content → Background | Widget calls `getFullTabImage()` → `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })`. Background runs `chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" })`, returns data URL. |
| 7. Crop (region or element) | `RegionCaptureOverlay` / `cropAroundElement` | Region: `cropImageToRegion(fullImageDataUrl, region, dpr)`. Session: `cropScreenshotAroundElement(fullImageDataUrl, element)` using `getCropRegionForElement` + `cropImageToRegion`. |
| 8. Context build | `lib/captureContext.ts` | `buildCaptureContext(window, element)` (element from region center `elementsFromPoint` or session clicked element). DOM path, nearby/subtree/visible text, viewport, url. |
| 9. Voice recording | `useCaptureWidget` | `startListening()`: getUserMedia (level), SpeechRecognition (transcript). Transcript stored on active `Recording`. `finishListening()` reads transcript and calls `onComplete(transcript, screenshot, { onSuccess, onError }, context)`. |
| 10. Transcript processing (content) | `content.tsx` `handleComplete` | Optional OCR `getVisibleTextFromScreenshot`; merge `visibleText` into context. Upload screenshot via `ECHLY_UPLOAD_SCREENSHOT` (background → POST `/api/upload-screenshot`). Then either: (a) `apiFetch("/api/structure-feedback", { transcript, context })` or (b) `ECHLY_PROCESS_FEEDBACK` to background. |
| 11. structure-feedback API | `app/api/structure-feedback/route.ts` | `runFeedbackPipeline(client, { transcript, context })`: perception → understanding (extract + optional refine) → structuring (graph, ticket titles) → output (optional verify, clarity). Returns `{ success, tickets, clarityScore, … }`. |
| 12. Ticket creation | Content or Background | Content: for each ticket, `apiFetch("/api/feedback", body)` with `screenshotUrl` on first. Background (ECHLY_PROCESS_FEEDBACK): same flow, background does structure-feedback then POST `/api/feedback` per ticket. |
| 13. Marker creation | `useCaptureWidget` `onSuccess` | When session mode and capture root still set: `createMarker(captureRoot, { id, x, y, element, title }, options)`. Markers appended to `#echly-marker-layer` inside capture root. |

---

## SECTION 4 — AI System Map

All AI (LLM) calls with file, model, and purpose.

| # | Purpose | File | Function | Model | Temp | Max tokens |
|---|---------|------|----------|-------|------|------------|
| 1 | Transcript normalization (optional) | `lib/server/transcriptNormalization.ts` | `normalizeTranscript` | gpt-4o-mini | 0 | 500 |
| 2 | Instruction extraction | `lib/server/instructionExtraction.ts` | `extractStructuredInstructions` | gpt-4o | 0 | 1600 |
| 3 | Instruction refinement (structured) | `lib/server/instructionRefinement.ts` | `refineStructuredInstructions` | gpt-4o-mini | 0 | 2000 |
| 4 | Instruction refinement (string, deprecated) | `lib/server/instructionRefinement.ts` | `refineInstructions` | gpt-4o-mini | 0 | 1500 |
| 5 | Instruction ontology (fallback) | `lib/server/instructionOntology.ts` | `mapInstructionsToOntology` | gpt-4o-mini | 0 | 3000 |
| 6 | Batch intent/tickets from ontology | `lib/server/pipelineStages.ts` | `batchIntentAndTicketsFromOntology` | gpt-4o-mini | 0 | 2500 |
| 7 | Batch intent/tickets (instruction strings) | `lib/server/pipelineStages.ts` | `batchIntentAndTickets` | gpt-4o-mini | 0 | 2500 |
| 8 | Ticket verification | `lib/server/ticketVerification.ts` | `verifyTicketsBatch` | gpt-4o-mini | 0 | 1500 |
| 9 | Ticket titles (batch) | `lib/ai/ticketTitle.ts` | `generateTicketTitlesBatch` | gpt-4o-mini | 0 | 120 |
| 10 | Session insight | `app/api/session-insight/route.ts` | inline `client.chat.completions.create` | gpt-4o-mini | 0 | 160 |
| 11 | Intent extraction (unused) | `lib/server/intentExtraction.ts` | `extractIntent` | gpt-4o-mini | 0 | 300 |
| 12 | Instruction segmentation (unused) | `lib/server/instructionSegmentation.ts` | `segmentInstructions` | gpt-4o | 0 | 1200 |

**Main pipeline usage:** 1 (optional), 2, 3 (when compound), 8 (when useVerification), 9. Session insight: 10. Items 4, 5, 6, 7 are legacy/fallback; 11, 12 are unused by any route.

---

## SECTION 5 — API Endpoints

| Endpoint | Methods | Purpose | Called from |
|----------|---------|---------|-------------|
| `/api/upload-screenshot` | POST | Upload image data URL; return Firebase Storage URL | Extension: content (via ECHLY_UPLOAD_SCREENSHOT → background) |
| `/api/structure-feedback` | POST | Run AI pipeline on transcript + context; return tickets, clarity | Extension: content (`apiFetch`) and background (ECHLY_PROCESS_FEEDBACK); Web: SessionPageClient, useFeedback |
| `/api/feedback` | GET, POST | List feedback for session; create ticket | Extension: content, background; Web: useSessionFeedbackPaginated, SessionPageClient, useFeedback, popup (popup.ts) |
| `/api/feedback/counts` | GET | Feedback count for session | Web: useSessionFeedbackPaginated |
| `/api/sessions` | GET, POST | List/create sessions | Extension: content, popup; Web: WorkspaceCard, useWorkspaceOverview |
| `/api/sessions/[id]` | PATCH, DELETE | Update/delete session | Web: WorkspaceCard |
| `/api/tickets/[id]` | GET, PATCH, DELETE | Get/update/delete single ticket | Web: SessionPageClient; Widget (useCaptureWidget) for PATCH/DELETE |
| `/api/session-insight` | POST | Generate session summary (AI) | Web: SessionPageClient |
| `/api/dashboard/metrics` | GET | Dashboard metrics | Web: InsightStrip |

All extension API calls from content script use `contentAuthFetch` → background `echly-api` with token. Background uses `getValidToken()` for upload, structure-feedback, and feedback when handling ECHLY_PROCESS_FEEDBACK.

---

## SECTION 6 — Message Passing Map

| Message | Direction | Purpose |
|---------|-----------|---------|
| `ECHLY_TOGGLE_VISIBILITY` | Popup/Content → Background | Toggle widget visible; background broadcasts `ECHLY_GLOBAL_STATE`. |
| `ECHLY_GET_GLOBAL_STATE` | Content → Background | Get `{ visible, expanded, isRecording, sessionId }`; content sets host display and dispatches CustomEvent. |
| `ECHLY_GLOBAL_STATE` | Background → All tabs | Push global UI state; content sets host display and dispatches CustomEvent. |
| `ECHLY_GET_STATE` | (optional alias) | Same idea as global state. |
| `ECHLY_SET_ACTIVE_SESSION` | Content → Background | Set activeSessionId and globalUIState.sessionId; persist; broadcast. |
| `ECHLY_GET_ACTIVE_SESSION` | Content → Background | Get current sessionId. |
| `ECHLY_GET_TOKEN` | Content (via echly-api) → Background | Get valid Firebase id token for API calls. |
| `ECHLY_GET_AUTH_STATE` | Content/Popup → Background | Get `{ authenticated, user }`. |
| `ECHLY_OPEN_POPUP` | Content → Background | Open extension popup (e.g. tab to popup.html). |
| `ECHLY_START_LOGIN` / `ECHLY_SIGN_IN` / `LOGIN` | Popup → Background | Start Google OAuth; exchange token; store; respond. |
| `ECHLY_EXPAND_WIDGET` | Content → Background | Set expanded true; broadcast. |
| `ECHLY_COLLAPSE_WIDGET` | Content → Background | Set expanded false; broadcast. |
| `START_RECORDING` | Content → Background | Set isRecording true, sessionId from activeSessionId; broadcast. |
| `STOP_RECORDING` | Content → Background | Set isRecording false; broadcast. |
| `CAPTURE_TAB` | Content → Background | captureVisibleTab; respond with `{ success, screenshot }` (data URL). |
| `ECHLY_UPLOAD_SCREENSHOT` | Content → Background | POST `/api/upload-screenshot` with token; respond with `{ url }` or `{ error }`. |
| `ECHLY_PROCESS_FEEDBACK` | Content → Background | Run structure-feedback + create feedback in background; respond with `{ success, ticket }`; broadcast `ECHLY_FEEDBACK_CREATED`. |
| `echly-api` | Content → Background | Proxy arbitrary request with token; respond with `{ ok, status, headers, body }`. |
| `ECHLY_FEEDBACK_CREATED` | Background → All tabs | Notify new ticket + sessionId; content dispatches CustomEvent. |
| `ECHLY_TOGGLE` | Background → Content | Content dispatches CustomEvent `ECHLY_TOGGLE_WIDGET`. |

**CustomEvents (window, content script context):** `ECHLY_GLOBAL_STATE`, `ECHLY_TOGGLE_WIDGET`, `ECHLY_FEEDBACK_CREATED` — used so React widget can subscribe without holding Chrome API.

---

## SECTION 7 — Capture System

### 7.1 Region capture

- **Entry:** User clicks “Capture feedback” in extension → focus mode → dim overlay + region overlay.
- **UI:** `CaptureLayer` shows `RegionCaptureOverlay` when `extensionMode` and state `focus_mode` or `region_selecting`.
- **Interaction:** User drags to draw rectangle; min size 24px; on release, `releasedRect` stored; “Retake” / “Speak feedback”.
- **Capture:** On “Speak feedback”, `performCapture(targetRect)`: shutter sound, `getFullTabImage()` (CAPTURE_TAB), `cropImageToRegion(full, region, dpr)`, element at center via `elementsFromPoint`, `buildCaptureContext(window, element)`, then `onAddVoice(cropped, context)`.

### 7.2 Session capture (Session Feedback Mode)

- **Entry:** Session mode on + extension: `CaptureLayer` shows only `SessionOverlay` (no region overlay).
- **Element highlighter:** `attachElementHighlighter(captureRoot, { getActive })` — single overlay div, mousemove updates position; target from `elementsFromPoint` filtered by `isSessionCaptureTarget`.
- **Click interception:** `attachClickCapture(captureRoot, { enabled, onElementClicked })` — capture-phase click listener; prevents default and stops propagation for valid targets; calls `onElementClicked(element)`.
- **Flow:** Click → element stored, optional full-tab capture + `cropScreenshotAroundElement` + `buildCaptureContext(window, element)` → voice or text → same structure-feedback and feedback APIs.

### 7.3 Element highlighter

- **File:** `components/CaptureWidget/session/elementHighlighter.ts`.
- **Behavior:** One fixed overlay div; on mousemove, `getElementUnderPoint` with `isSessionCaptureTarget`; overlay rect = target’s getBoundingClientRect; pointer-events none; z-index 2147483646.

### 7.4 Click interception

- **File:** `components/CaptureWidget/session/clickCapture.ts`.
- **Behavior:** Document capture-phase click; left button only; `enabledRef()` and `isSessionCaptureTarget(target)`; then preventDefault, stopPropagation, `callbackRef(target)`.

### 7.5 Crop system

- **Region crop:** `RegionCaptureOverlay.tsx` — `cropImageToRegion(fullImageDataUrl, region, dpr)` (canvas drawImage with region in device pixels).
- **Element crop:** `session/cropAroundElement.ts` — `getCropRegionForElement(element, padding, vw, vh)` (viewport-clamped rect with padding), then `cropScreenshotAroundElement(full, element, padding)` uses `cropImageToRegion` from RegionCaptureOverlay.

---

## SECTION 8 — State Systems

| System | Location | What it holds |
|--------|----------|----------------|
| **React state (widget)** | `useCaptureWidget`, `ContentApp` | recordings, activeRecordingId, isOpen, state (idle/focus_mode/region_selecting/voice_listening/processing), pointers, expandedId, editingId, position, sessionMode, sessionPaused, sessionFeedbackPending, captureRootEl, liveStructured, etc. |
| **Session state (extension)** | Background `globalUIState` + `activeSessionId` | visible, expanded, isRecording, sessionId; persisted activeSessionId in chrome.storage.local. |
| **Recording state** | Widget `recordings` array | Per recording: id, screenshot, transcript, context; activeRecordingId points to current. |
| **Background global state** | `background.ts` | tokenState (idToken, refreshToken, expiresAtMs, user), globalUIState, activeSessionId. |
| **Auth state** | Background + chrome.storage | auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user. |
| **Capture root ref** | useCaptureWidget `captureRootRef` | DOM reference to `#echly-capture-root`; created in createCaptureRoot, cleared in removeCaptureRoot. |
| **Markers (imperative)** | `feedbackMarkers.ts` | In-memory array of marker entries; DOM nodes under `#echly-marker-layer`. |

---

## SECTION 9 — Dead Code Detection

### 9.1 Unused files / entry points

- **`lib/server/intentExtraction.ts`** — `extractIntent` not called by any route or pipeline.
- **`lib/server/instructionSegmentation.ts`** — `segmentInstructions` not used; pipeline uses `instructionExtraction` (structured) instead.
- **`lib/server/instructionRefinement.ts`** — `refineInstructions` (string-based) deprecated; only `refineStructuredInstructions` is used.

### 9.2 Unused functions

- **`extractIntent`** (intentExtraction.ts).
- **`segmentInstructions`** (instructionSegmentation.ts).
- **`refineInstructions`** (instructionRefinement.ts) — string-based refinement.
- **`mapInstructionsToOntology`** — only referenced inside instructionOntology and pipelineStages; not called from `runFeedbackPipeline.ts` (no ontology in main path).
- **`batchIntentAndTicketsFromOntology`**, **`batchIntentAndTickets`** (pipelineStages.ts) — ontology/fallback path; not invoked from main pipeline.

### 9.3 Unused hooks

- All hooks under app/components/lib are referenced; no clearly unused hook file identified. (Use project-wide “find references” to confirm any specific hook.)

### 9.4 Unused utilities

- **`lib/capture.ts`** — verify if still used (e.g. by screenshot flow); if only captureContext is used, capture.ts may be redundant.
- **`lib/graph/instructionGraphEngine.ts`** — confirm whether used or superseded by `lib/server/instructionGraph.ts`.

### 9.5 Duplicate logic

- **Refinement:** Two entry points in instructionRefinement (structured vs string); only structured is used.
- **Context extraction / DOM text:** `captureContext.ts` vs pipelineContext/getDomPhrasesFromContext — different layers (client capture vs server pipeline); not duplicate but overlapping concern.
- **Popup:** Both `popup.ts` and `popup.tsx` exist; build likely uses one; the other may be legacy or alternate entry.

---

## SECTION 10 — Legacy Systems

| System | Evidence | Notes |
|--------|----------|------|
| **Region capture remnants** | Region flow is primary in docs; session mode added later. | Both flows coexist; region capture is still the main “draw a box” path. |
| **Ontology pipeline** | `instructionOntology.ts`, `pipelineStages.ts` (mapInstructionsToOntology, batchIntentAndTicketsFromOntology, batchIntentAndTickets). | Not called from runFeedbackPipeline; “no ontology fallback in current default path”. |
| **String-based refinement** | `refineInstructions` in instructionRefinement.ts. | Deprecated; pipeline uses refineStructuredInstructions. |
| **Unused AI modules** | intentExtraction, instructionSegmentation. | Not referenced by structure-feedback or any route. |
| **Duplicate context extractors** | Client: captureContext. Server: pipelineContext, getDomPhrasesFromContext, spatial-context-builder. | Client captures DOM/text; server normalizes and uses for prompts; intentional split, but server path could be simplified if client sends richer context. |
| **popup.ts vs popup.tsx** | Two popup entry files. | Confirm which is built (esbuild/package scripts); the other may be legacy. |

---

## SECTION 11 — Dependency Graph (Key Modules)

High-level; only main dependencies.

```
app/api/structure-feedback/route.ts
  → lib/ai/runFeedbackPipeline.ts
      → lib/server/* (perception: properNounAnchoring, uiVocabularyNormalization, speechNormalization, clauseSplitter, groundTranscriptClauses, transcriptNormalization)
      → lib/ai/spatial-context-builder.ts, pipelineTokenBudget.ts, contextFilter.ts
      → lib/server/instructionExtraction.ts, instructionRefinement.ts (refineStructuredInstructions)
      → lib/ai/copy-correction.ts, element-resolver.ts, fuzzy-similarity.ts
      → lib/server/instructionGraph.ts
      → lib/ai/ticketTitle.ts
      → lib/server/ticketVerification.ts
      → lib/server/pipelineContext.ts
      → lib/server/pipelineStages.ts (types only in main path)

echly-extension/src/content.tsx
  → components/CaptureWidget/* (CaptureWidget, CaptureLayer, etc.)
  → contentAuthFetch.ts, contentScreenshot.ts, ocr.ts

components/CaptureWidget/CaptureWidget.tsx
  → hooks/useCaptureWidget.ts
      → lib/authFetch, captureContext, feedback, playShutterSound, playDoneClick
      → session/sessionMode, cropAroundElement, feedbackMarkers

components/CaptureWidget/CaptureLayer.tsx
  → RegionCaptureOverlay.tsx, SessionOverlay.tsx

SessionOverlay.tsx
  → session/elementHighlighter.ts, session/clickCapture.ts

useCaptureWidget.ts
  → session/feedbackMarkers.ts, session/cropAroundElement.ts (→ RegionCaptureOverlay cropImageToRegion)

RegionCaptureOverlay.tsx
  → lib/captureContext.ts, playShutterSound
```

---

## SECTION 12 — Risk Areas

Areas where deleting or changing code can break the system.

| Area | Risk | Mitigation |
|------|------|------------|
| **Message contract** | Renaming or dropping a message type (e.g. ECHLY_PROCESS_FEEDBACK, CAPTURE_TAB) breaks content ↔ background. | Keep message names and payload shapes documented; prefer feature flags over removing handlers until clients updated. |
| **Capture root lifecycle** | Removing or moving `createCaptureRoot` / `removeCaptureRoot` or the ref can break portal target and markers. | Markers and SessionOverlay/CaptureLayer depend on same root; any change to when root is created/destroyed must be tested in both region and session flows. |
| **Marker DOM** | Markers appended imperatively to `#echly-marker-layer`; React portals also render into same root. | React may reconcile and remove non-React children; see MARKER_LIFECYCLE_ANALYSIS_REPORT. Do not assume marker DOM survives next React commit without verification. |
| **runFeedbackPipeline** | Single entry for structure-feedback; removing a layer or changing options breaks API contract. | Changes to perception/understanding/structuring/output must preserve response shape and clarity/verification behavior. |
| **instructionExtraction + instructionGraph** | Pipeline assumes structured instructions → graph → tickets; graph logic is central. | Removing or replacing instructionGraph or instructionExtraction requires end-to-end tests and possible API versioning. |
| **Token / auth in background** | getValidToken and storage keys are shared by content (via messages) and background. | Changing storage keys or token flow breaks all extension API calls. |
| **contentAuthFetch / echly-api** | All content-initiated API calls go through this path. | Removing or changing proxy breaks structure-feedback and feedback creation from widget. |
| **Session overlay vs region** | `sessionMode` and `extensionMode` gate which overlay is shown; click/highlighter only in session mode. | Turning off session mode or changing conditions can leave dead code or broken session flow. |
| **buildCaptureContext / isEchlyElement** | Used by region center element, session element, and sessionMode (isSessionCaptureTarget). | Changing captureContext or Echly filtering can leak widget into context or break target detection. |
| **ECHLY_GET_GLOBAL_STATE / broadcast** | Widget visibility and expanded/recording/sessionId depend on it. | If background stops broadcasting or content stops dispatching CustomEvents, widget state desyncs. |

---

*End of System Intelligence Report. No code was modified. Use this document to plan safe cleanup and refactors.*
