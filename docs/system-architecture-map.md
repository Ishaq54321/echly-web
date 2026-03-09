# Echly System Architecture Map

> **Document Purpose:** Complete architecture analysis for the Echly product. Use this map before implementing any new features.

---

## 1. Repository Structure Overview

```
echly/
├── app/                          # Next.js App Router
│   ├── (app)/dashboard/          # Dashboard web app
│   │   ├── page.tsx               # Workspace list (sessions)
│   │   ├── insights/page.tsx
│   │   ├── [sessionId]/           # Session detail pages
│   │   │   ├── page.tsx
│   │   │   ├── overview/page.tsx
│   │   │   └── SessionPageClient.tsx
│   │   └── hooks/
│   └── api/                      # Backend API routes
│       ├── feedback/              # GET/POST feedback
│       ├── feedback/counts/
│       ├── sessions/             # GET/POST sessions
│       ├── sessions/[id]/        # PATCH/DELETE session
│       ├── tickets/[id]/         # GET/PATCH/DELETE ticket
│       ├── structure-feedback/   # AI structuring
│       ├── upload-screenshot/
│       └── ...
├── components/                   # Shared React components
│   ├── CaptureWidget/            # Extension capture UI
│   │   ├── CaptureWidget.tsx     # Main widget container
│   │   ├── CaptureLayer.tsx      # Overlay orchestration
│   │   ├── RegionCaptureOverlay.tsx
│   │   ├── SessionOverlay.tsx
│   │   ├── VoiceCapturePanel.tsx
│   │   ├── FeedbackItem.tsx      # Ticket card (inline editor)
│   │   ├── hideEchlyUI.ts        # Screenshot UI hiding
│   │   └── hooks/useCaptureWidget.ts
│   └── dashboard/
├── echly-extension/              # Chrome Extension
│   ├── manifest.json             # MV3 manifest
│   ├── src/
│   │   ├── background.ts         # Service worker
│   │   ├── content.tsx           # Content script
│   │   ├── popup.tsx             # Extension popup
│   │   ├── contentAuthFetch.ts   # API proxy via background
│   │   ├── contentScreenshot.ts  # Upload helpers
│   │   └── ocr.ts                # Tesseract OCR
│   ├── popup.css
│   ├── popup.js                  # Built by esbuild
│   ├── content.js
│   └── background.js
├── lib/
│   ├── ai/                       # AI pipeline
│   │   ├── runFeedbackPipeline.ts
│   │   └── voiceToTicketPipeline.ts
│   ├── captureContext.ts         # DOM context extraction
│   ├── firebase.ts
│   ├── authFetch.ts
│   └── repositories/             # Firestore data access
└── esbuild-extension.mjs         # Extension build script
```

**Build outputs:**
- `npm run dev` → Next.js dev server (dashboard + API)
- `npm run build:extension` → echly-extension/popup.js, content.js, background.js

---

## 2. Extension Architecture

### Manifest (MV3)

| Key | Value |
|-----|-------|
| `manifest_version` | 3 |
| `background` | `background.js` (service worker) |
| `content_scripts` | `content.js` on `<all_urls>`, `document_idle` |
| `action.default_popup` | `popup.html` |
| `permissions` | identity, storage, activeTab, tabs |
| `host_permissions` | `<all_urls>`, localhost:3000, echly-web.vercel.app, Firebase |

### Component Hierarchy

```
popup.html (popup.js)
  └── PopupApp (login-only; toggles visibility, closes)

content.tsx (content.js) — injected into every page
  └── #echly-shadow-host (document.body)
        └── Shadow DOM
              ├── popup.css (link)
              ├── echly-reset (style)
              └── #echly-root
                    └── ContentApp
                          └── CaptureWidget
```

### Key Files

| File | Responsibility |
|------|----------------|
| `echly-extension/manifest.json` | Extension config, permissions |
| `echly-extension/src/background.ts` | Auth, token refresh, session state, message routing |
| `echly-extension/src/content.tsx` | Mount CaptureWidget in Shadow DOM, handle global state |
| `echly-extension/src/popup.tsx` | Sign-in UI; if authenticated → toggle visibility, close |
| `echly-extension/src/contentAuthFetch.ts` | Proxy API calls through background (Bearer token) |
| `echly-extension/src/contentScreenshot.ts` | `uploadScreenshot()`, `generateFeedbackId()`, `generateScreenshotId()` |

### Shadow DOM & Isolation

- Host: `#echly-shadow-host` (fixed bottom-right)
- Root: `#echly-root` inside Shadow DOM
- Styles: `popup.css` + `echly-reset` injected into shadow root
- Capture overlay: `#echly-capture-root` created in `captureRootParent` (default `document.body`) — **outside** shadow DOM so `document.getElementById` works for markers

---

## 3. Capture Pipeline

### Flow (Region Selection)

```
User clicks "Add feedback" (extension)
  → handleAddFeedback() → createCaptureRoot() → setState("focus_mode")
  → CaptureLayer shows RegionCaptureOverlay

User drags region
  → RegionCaptureOverlay: onMouseDown → onMouseMove → onMouseUp
  → setReleasedRect(rect)
  → User clicks "Speak feedback"
  → performCapture(releasedRect)
```

### performCapture Sequence

1. **hideEchlyUI()** — `components/CaptureWidget/hideEchlyUI.ts`
   - Hides: `.echly-sidebar-container`, `.echly-floating-trigger-wrapper`, `.echly-session-tray`, etc.
   - Does **not** hide: `.echly-region-overlay`, `.echly-region-cutout` (selection must stay visible)

2. **requestAnimationFrame x2** — wait for paint

3. **getFullTabImage()** — `useCaptureWidget.ts`
   - Extension: `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })`
   - Background: `chrome.tabs.captureVisibleTab(windowId, { format: "png" })`
   - Returns full-viewport data URL

4. **restoreEchlyUI(hidden)** — restore visibility of hidden elements

5. **Element detection** — `document.elementFromPoint(centerX, centerY)` at selection center; skip Echly elements

6. **cropImageToRegion()** — `RegionCaptureOverlay.tsx`
   - Crops full image to `targetRect` (selection) and `containerRect` (visual container)
   - Uses `window.devicePixelRatio` for scaling

7. **buildCaptureContext()** — `lib/captureContext.ts`
   - Extracts domPath, subtreeText, nearbyText, visibleText

8. **onAddVoice(containerCrop, context)** — starts voice recording with screenshot + context attached

### Critical Code Locations

| Step | File | Function |
|------|------|----------|
| Hide UI | `components/CaptureWidget/hideEchlyUI.ts` | `hideEchlyUI()`, `restoreEchlyUI()` |
| Capture tab | `echly-extension/src/background.ts` | `CAPTURE_TAB` handler |
| Capture without overlay | `components/CaptureWidget/hooks/useCaptureWidget.ts` | `captureTabWithoutOverlay()` |
| Region capture | `components/CaptureWidget/RegionCaptureOverlay.tsx` | `performCapture()`, `cropImageToRegion()` |
| Get full image | `components/CaptureWidget/hooks/useCaptureWidget.ts` | `getFullTabImage()` |

---

## 4. Voice Processing Pipeline

### Flow

```
Voice mode selected
  → User drags region → performCapture → onAddVoice(containerCrop, context)
  → handleRegionCaptured() → startListening()

startListening()
  → navigator.mediaDevices.getUserMedia({ audio })
  → SpeechRecognition (Web Speech API) .start()
  → setState("voice_listening")

User speaks
  → recognition.onresult → transcript accumulated in Recording
  → User clicks Done
  → finishListening()
  → onComplete(transcript, screenshot, callbacks, context)
```

### Speech Recognition

- **API:** `window.SpeechRecognition` or `window.webkitSpeechRecognition`
- **Config:** `continuous: true`, `interimResults: true`, `lang: "en-US"`
- **Location:** `components/CaptureWidget/hooks/useCaptureWidget.ts` (recognition setup, onresult, onend)

### Transcript → Ticket Flow

1. **Content script** (`content.tsx`): `handleComplete(transcript, screenshot, callbacks, context)`
2. **OCR** (optional): `getVisibleTextFromScreenshot(ocrImageDataUrl ?? screenshot)` — `echly-extension/src/ocr.ts` (Tesseract.js)
3. **Enrich context:** `visibleText` from OCR or DOM; `url`, `domPath`, `subtreeText`, `nearbyText` from `CaptureContext`
4. **POST /api/structure-feedback** — via `apiFetch` (contentAuthFetch) or `ECHLY_PROCESS_FEEDBACK` (background)
5. **POST /api/feedback** — create ticket(s)
6. **PATCH /api/tickets/:id** — attach screenshot URL after upload

### Clarity Assistant

- When `clarityScore <= 20` or `needsClarification && tickets.length === 0`, content script shows clarity assistant modal
- User can "Edit feedback", "Submit anyway", or "Done" (submit edited)
- Session mode: clarity assistant is **never** shown; process silently

---

## 5. AI Structuring Pipeline

### Entry Points

1. **Content script** — `apiFetch("/api/structure-feedback", ...)` or `ECHLY_PROCESS_FEEDBACK` message
2. **Dashboard** — `authFetch("/api/structure-feedback", ...)` in `SessionPageClient.tsx`

### API: POST /api/structure-feedback

**Location:** `app/api/structure-feedback/route.ts`

**Request body:**
```json
{
  "transcript": "string",
  "context": {
    "url": "string",
    "viewportWidth": number,
    "viewportHeight": number,
    "domPath": "string | null",
    "nearbyText": "string | null",
    "subtreeText": "string | null",
    "visibleText": "string | null"
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "tickets": [{ "title", "description", "suggestedTags", "actionSteps" }],
  "clarityScore": number,
  "clarityIssues": string[],
  "suggestedRewrite": string | null,
  "confidence": number,
  "needsClarification": boolean,
  "verificationIssues": string[]
}
```

### Pipeline Implementation

| File | Responsibility |
|------|----------------|
| `app/api/structure-feedback/route.ts` | Auth, rate limit, delegate to pipeline |
| `lib/ai/runFeedbackPipeline.ts` | Orchestrator; calls `runVoiceToTicket` |
| `lib/ai/voiceToTicketPipeline.ts` | GPT-4o-mini call, single ticket output |

**Architecture:** One recording → one ticket. Optional review pass when confidence < 0.85.

---

## 6. Session State Architecture

### Background Service Worker State

**Location:** `echly-extension/src/background.ts`

| Variable | Type | Persisted |
|----------|------|-----------|
| `activeSessionId` | `string \| null` | `chrome.storage.local` |
| `globalUIState` | Object | No (in-memory) |
| `tokenState` | TokenState | `chrome.storage.local` |

**globalUIState shape:**
```ts
{
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  sessionLoading: boolean;
  pointers: StructuredFeedback[];
  captureMode: "voice" | "text";
}
```

**chrome.storage.local keys:**
- `activeSessionId`
- `sessionModeActive`
- `sessionPaused`
- `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`

### Session Lifecycle

- **Start:** `ECHLY_SET_ACTIVE_SESSION` → create or select session → fetch feedback from `/api/feedback`, sessions from `/api/sessions`
- **Pause:** `ECHLY_SESSION_MODE_PAUSE` → `sessionPaused: true`
- **Resume:** `ECHLY_SESSION_MODE_RESUME` → `sessionPaused: false`
- **End:** `ECHLY_SESSION_MODE_END` → clear state, broadcast `ECHLY_RESET_WIDGET` to all tabs

### Idle Timeout

- **SESSION_IDLE_TIMEOUT:** 30 minutes
- `resetSessionIdleTimer()` on activity; `endSessionFromIdle()` clears session and broadcasts reset

### Entry Points

1. **Start Session:** `onCreateSession()` → POST /api/sessions → `ECHLY_SET_ACTIVE_SESSION`
2. **Previous Sessions:** `ResumeSessionModal` → `onPreviousSessionSelect(sessionId)` → `ECHLY_SET_ACTIVE_SESSION` + `ECHLY_SESSION_MODE_START`

---

## 7. Dashboard Architecture

### Pages

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Workspace list (sessions) |
| `/dashboard/[sessionId]` | `app/(app)/dashboard/[sessionId]/page.tsx` | Session detail |
| `/dashboard/[sessionId]/overview` | `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Session overview |
| `/dashboard/insights` | `app/(app)/dashboard/insights/page.tsx` | Insights |

### Session Page

- **SessionPageClient.tsx** — main client component
- Ticket list + detail panel
- Uses `authFetch` for API calls (Firebase token in Authorization header)
- Can create feedback via structure-feedback + feedback APIs (e.g. from screenshot + text)

### State Management

- **useWorkspaceOverview** — sessions list, create, update, remove
- **useSessionFeedbackPaginated** — paginated feedback for session
- **useFeedbackDetailController** — selected ticket, CRUD
- **useSessionOverview** — session overview data

### Key Components

- `WorkspaceCard` — session card on dashboard
- `InsightStrip`, `NeedsAttentionSection`
- Session detail: ticket list, screenshot viewer, commenting (if implemented)

---

## 8. Backend API Architecture

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sessions` | List sessions |
| POST | `/api/sessions` | Create session |
| GET | `/api/sessions/[id]` | Get session |
| PATCH | `/api/sessions/[id]` | Update session (title, archived) |
| DELETE | `/api/sessions/[id]` | Delete session |
| GET | `/api/feedback` | List feedback (sessionId, cursor, limit) |
| POST | `/api/feedback` | Create feedback (ticket) |
| GET | `/api/feedback/counts` | Feedback counts by session |
| GET | `/api/tickets/[id]` | Get ticket |
| PATCH | `/api/tickets/[id]` | Update ticket |
| DELETE | `/api/tickets/[id]` | Delete ticket |
| POST | `/api/structure-feedback` | AI structure transcript → tickets |
| POST | `/api/upload-screenshot` | Upload screenshot, return URL |

### Auth

- **requireAuth(req)** — validates Firebase Bearer token
- Extension: token from background via `ECHLY_GET_TOKEN` / `getValidToken()`
- Dashboard: `authFetch` uses Firebase `getIdToken()`

### Data Layer

- **Firestore** — sessions, feedback (tickets), screenshots
- **Repositories:** `lib/repositories/` — `sessionsRepository`, `feedbackRepository`, `screenshotsRepository`

---

## 9. Extension ↔ Dashboard Communication

### No Direct Messaging

- Extension and dashboard are **separate origins** (extension:// vs http(s)://)
- Communication is **indirect** via backend API and Firestore

### Shared Data Flow

```
Extension (content/background)
  → POST /api/feedback (create ticket)
  → PATCH /api/tickets/:id (attach screenshot)
  → Background stores pointers in globalUIState

Dashboard
  → GET /api/feedback?sessionId=...
  → GET /api/tickets/:id
  → Same Firestore data
```

### Session Continuity

- Extension: `activeSessionId` in background; pointers from `/api/feedback`
- Dashboard: sessions from `/api/sessions`; feedback from `/api/feedback`
- Both read/write same Firestore collections

### Opening Dashboard from Extension

- `ECHLY_OPEN_TAB` with `url: ${APP_ORIGIN}/dashboard/${sessionId}`
- Triggered on session end: `onSessionModeEnd` → `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url })`

---

## 10. Known Architectural Risks

### 1. API Base Hardcoded

- **Location:** `echly-extension/src/background.ts`, `contentAuthFetch.ts`
- **Risk:** `API_BASE = "http://localhost:3000"` — production must use `https://echly-web.vercel.app` or env-based URL
- **Mitigation:** Use build-time env or manifest `host_permissions` to derive base

### 2. Duplicate Feedback Pipeline Logic

- **Content script** (`content.tsx`): Full pipeline in `handleComplete` — structure-feedback, create feedback, upload, PATCH ticket
- **Background** (`background.ts`): `ECHLY_PROCESS_FEEDBACK` — fallback when structure returns empty; also does structure + create
- **Risk:** Divergent behavior, harder to maintain
- **Mitigation:** Centralize pipeline in one place (e.g. background only, or shared module)

### 3. Clarity Assistant Complexity

- Multiple code paths: `clarityScore <= 20`, `needsClarification && tickets.length === 0`, session mode bypass
- `submitPendingFeedback`, `submitEditedFeedback`, `handleExtensionClarityUseSuggestion` — significant duplication
- **Mitigation:** Extract clarity flow into a single module/hook

### 4. Capture Root Placement

- Extension: `#echly-capture-root` created in `captureRootParent` (passed from content) or `document.body`
- Content mounts CaptureWidget in Shadow DOM; `captureRootParent` is `widgetRoot` (inside shadow)
- Marker layer: extension uses `document.body` for `#echly-marker-layer` so `getElementById` works
- **Risk:** Confusion about where capture root lives; potential for wrong parent in iframes
- **Mitigation:** Document clearly; consider always using `document.body` for capture root in extension

### 5. State Sync Reliability

- Background broadcasts `ECHLY_GLOBAL_STATE` on tab activation/creation
- Content also pulls on `visibilitychange` and `ECHLY_SESSION_STATE_SYNC`
- **Risk:** Missed broadcasts (e.g. content script not yet injected)
- **Mitigation:** Content already does pull on visibility change; ensure no debounce/skip logic

### 6. OCR Performance

- Tesseract.js runs in content script; can be slow on large images
- **Risk:** Blocks main thread, slow feedback submission
- **Mitigation:** Consider Web Worker; already fail-silent (returns "" on error)

### 7. Session Idle Timeout

- 30-minute inactivity ends session
- **Risk:** User may lose context if timeout fires during pause
- **Mitigation:** Consider extending on pause or adding warning

### 8. authFetch vs apiFetch

- **Dashboard:** `authFetch` from `lib/authFetch.ts` (Firebase token)
- **Extension content:** `apiFetch` from `contentAuthFetch.ts` (proxies via background)
- **Risk:** Different implementations; token handling must stay in sync
- **Mitigation:** Document clearly; consider shared interface

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ECHLY SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │ Chrome Extension │     │  Web Dashboard    │     │  Backend API      │   │
│  │                  │     │                  │     │  (Next.js)        │   │
│  │ • Popup (auth)   │     │ • /dashboard     │     │                   │   │
│  │ • Content script │     │ • /dashboard/:id│     │ • /api/sessions   │   │
│  │ • Background SW │     │ • Session detail  │     │ • /api/feedback   │   │
│  └────────┬─────────┘     └────────┬─────────┘     │ • /api/tickets   │   │
│           │                        │               │ • /api/structure  │   │
│           │ chrome.runtime         │ authFetch     │ • /api/upload     │   │
│           │ sendMessage            │               │                   │   │
│           └────────────────────────┴───────────────┼───────────────────┤   │
│                                                    │                   │   │
│                                                    │  ┌──────────────┐ │   │
│                                                    │  │  Firestore   │ │   │
│                                                    │  │  • sessions  │ │   │
│                                                    │  │  • feedback  │ │   │
│                                                    │  │  • screenshots│ │   │
│                                                    │  └──────────────┘ │   │
│                                                    └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy (Extension UI)

```
ContentApp (content.tsx)
├── Clarity Assistant (modal, when clarityScore <= 20)
└── CaptureWidget
    ├── ResumeSessionModal
    ├── CaptureLayer (portaled to #echly-capture-root)
    │   ├── RegionCaptureOverlay (region drag → performCapture)
    │   └── SessionOverlay (session mode: click element → voice/text)
    │       └── VoiceCapturePanel / TextFeedbackPanel
    ├── Floating trigger (launcher)
    └── Sidebar container
        ├── CaptureHeader
        ├── Feedback list (FeedbackItem per ticket)
        ├── Mode tiles (Voice / Write)
        └── WidgetFooter (Start Session, Previous Sessions)
```

---

## Critical Code Locations Summary

| Concern | Primary Location |
|---------|------------------|
| Extension entry | `echly-extension/src/content.tsx` (main), `background.ts` |
| Capture lifecycle | `components/CaptureWidget/hooks/useCaptureWidget.ts` |
| Region capture | `components/CaptureWidget/RegionCaptureOverlay.tsx` |
| Screenshot hiding | `components/CaptureWidget/hideEchlyUI.ts` |
| DOM context | `lib/captureContext.ts` |
| AI pipeline | `lib/ai/runFeedbackPipeline.ts`, `lib/ai/voiceToTicketPipeline.ts` |
| Session state | `echly-extension/src/background.ts` (globalUIState, activeSessionId) |
| API proxy | `echly-extension/src/contentAuthFetch.ts` |
| Dashboard sessions | `app/(app)/dashboard/page.tsx`, `SessionPageClient.tsx` |
| API routes | `app/api/` (sessions, feedback, tickets, structure-feedback, upload-screenshot) |

---

## Areas Needing Refactor Before Dashboard Work

1. **API base URL** — Make configurable for dev vs production
2. **Feedback pipeline consolidation** — Reduce duplication between content and background
3. **Clarity assistant** — Extract into reusable module
4. **Type consistency** — Ensure `StructuredFeedback`, `CaptureContext`, API payloads align across extension, dashboard, and API
