# ECHLY — FULL ARCHITECTURE VERIFICATION REPORT (EXTENSION + DASHBOARD)

**Date:** 2025-03-17  
**Scope:** Capture engine centralization, extension/dashboard separation, environment abstraction, duplication, dependency flow, dead code.  
**Rule:** Analysis and report only; no file modifications.

---

## SECTION 1 — CAPTURE ENGINE STRUCTURE

### 1.1 Folder structure (tree)

```
lib/capture-engine/
├── CaptureEnvironment.ts          # Interface only
├── ExtensionCaptureEnvironment.ts  # Extension adapter (implements CaptureEnvironment)
└── core/
    ├── index.ts                    # Public exports
    ├── types.ts
    ├── CaptureWidget.tsx
    ├── CaptureHeader.tsx
    ├── FeedbackItem.tsx
    ├── WidgetFooter.tsx
    ├── CaptureLayer.tsx
    ├── ResumeSessionModal.tsx
    ├── MicrophonePanel.tsx
    ├── SessionLimitUpgradeView.tsx
    └── hooks/
        └── useCaptureWidget.ts
```

### 1.2 All exported modules

**From `lib/capture-engine/core/index.ts`:**
- `default` / `CaptureWidget` from `./CaptureWidget`
- `CaptureHeader` from `./CaptureHeader`
- `FeedbackItem` from `./FeedbackItem`
- `WidgetFooter` from `./WidgetFooter`
- `CaptureLayer` from `./CaptureLayer`
- `ResumeSessionModal` from `./ResumeSessionModal`
- `MicrophonePanel` from `./MicrophonePanel`
- `SessionLimitUpgradeView` from `./SessionLimitUpgradeView`
- `useCaptureWidget` from `./hooks/useCaptureWidget`
- `export * from "./types"`

**From `lib/capture-engine/`:**
- `CaptureEnvironment` (interface) from `CaptureEnvironment.ts`
- `ExtensionCaptureEnvironment` and `ExtensionCaptureEnvironmentDeps` from `ExtensionCaptureEnvironment.ts` (not re-exported via core/index; consumed directly by extension)

**Types (from `core/types.ts`):**
- `StructuredFeedback`, `ElementRect`, `SessionFeedbackPending`, `CaptureContext`, `Recording`, `CaptureState`, `CaptureWidgetProps`, `FeedbackJob`, `Position`, etc.

### 1.3 What logic lives here

| Area | Location | Description |
|------|----------|-------------|
| **Capture** | `useCaptureWidget.ts` | State machine (idle → focus_mode → region_selecting → voice_listening → processing), region capture flow, screenshot via `getFullTabImage`/`captureScreenshot`, `handleRegionCaptured`, `startCapture`, `handleCancelCapture`. Uses `environment?.captureTabScreenshot` or fallback chrome/canvas. |
| **Session** | `useCaptureWidget.ts`, `CaptureWidget.tsx`, `ResumeSessionModal.tsx` | Start/pause/resume/end session, session mode, session feedback pending, createSession (via `environment.createSession()` or props). Load feedback (authFetch when !extensionMode). |
| **UI** | `CaptureWidget.tsx`, `CaptureHeader.tsx`, `FeedbackItem.tsx`, `WidgetFooter.tsx`, `CaptureLayer.tsx`, `MicrophonePanel.tsx`, `SessionLimitUpgradeView.tsx` | Sidebar, header, feedback list, footer (Start Session / Add Feedback / Previous Sessions), capture layer portal, mode tiles (Voice/Write), upgrade view. |
| **Hooks** | `useCaptureWidget.ts` | Single main hook: state, handlers, refs, captureRootEl; speech recognition, pointers CRUD, session lifecycle, screenshot capture, region selection. |

### 1.4 Confirm: NO direct Chrome API usage in core

**VIOLATIONS — Direct Chrome API usage inside `lib/capture-engine`:**

| File | Line(s) | Usage |
|------|---------|--------|
| `lib/capture-engine/core/CaptureWidget.tsx` | 194–195 | `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })` |
| `lib/capture-engine/core/CaptureWidget.tsx` | 205–206 | `chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode })` |
| `lib/capture-engine/core/CaptureWidget.tsx` | 353–354 | `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_BILLING" })` |
| `lib/capture-engine/core/CaptureWidget.tsx` | 485–486 | `chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" })` |
| `lib/capture-engine/core/CaptureHeader.tsx` | 140–141 | `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_DASHBOARD" })` |
| `lib/capture-engine/core/SessionLimitUpgradeView.tsx` | 18–19 | `chrome.runtime.getURL("assets/feedback-tray-session-limit.png")` |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 1023–1037, 1064–1065 | `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" }, ...)` inside `getFullTabImage` when `environment?.captureTabScreenshot` is not used but chrome is available; fallback `captureScreenshot` also uses chrome path. |

**Note:** `ExtensionCaptureEnvironment.ts` correctly uses Chrome APIs as the extension adapter; it lives under `lib/capture-engine` but is the designated platform implementation. The violations above are in **core** components that should rely only on `CaptureEnvironment` (or props), not on `chrome` directly.

### 1.5 Confirm: NO dashboard-specific logic in core

**VIOLATIONS — Dashboard-specific logic inside `lib/capture-engine`:**

| File | Line(s) | Issue |
|------|---------|--------|
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 3 | `import { authFetch } from "@/lib/authFetch"` — app-level auth. |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 520–521 | `authFetch(\`/api/feedback?sessionId=${sessionId}&limit=200\`)` — loading session feedback when !extensionMode. |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 929, 964 | `authFetch(\`/api/tickets/${id}\`, { method: "PATCH", ... })` in `saveEdit` and `updatePointer` (when `onUpdate` not provided). |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 1065–1067 | Fallback `import("@/lib/capture").then(m => m.captureScreenshot())` when no environment and no chrome — web/dashboard path. |

The engine should use `environment.authenticatedFetch` (when `environment` is provided) for all API calls (feedback load, ticket PATCH). Currently it uses `authFetch` and fixed `/api/` paths regardless of environment.

### 1.6 List ANY violations (summary)

- **Chrome in core:** 7 locations across `CaptureWidget.tsx`, `CaptureHeader.tsx`, `SessionLimitUpgradeView.tsx`, `useCaptureWidget.ts` (see table above).
- **Dashboard/API in core:** 4 locations in `useCaptureWidget.ts` (authFetch + `/api/feedback`, `/api/tickets`; plus `@/lib/capture` fallback).
- **External UI deps:** Core imports from outside `lib/capture-engine`:
  - `@/components/CaptureWidget/RegionCaptureOverlay` (detectVisualContainer, clampRect, cropImageToRegion, and overlay)
  - `@/components/CaptureWidget/SessionOverlay`
  - `@/components/CaptureWidget/hideEchlyUI`, `restoreEchlyUI`
  - `@/components/CaptureWidget/session/feedbackMarkers` (createMarker, removeAllMarkers, updateMarker, removeMarker)
  - `@/components/CaptureWidget/session/sessionMode` (logSession)
  - `@/components/CaptureWidget/utils/shortDeviceName`
  - `@/lib/captureContext` (buildCaptureContext)
  - `@/lib/playDoneClick`, `@/lib/playShutterSound`
  - `@/lib/authFetch`
  - `@/lib/utils/logger`, `@/lib/debug/echlyLogger`

So the “core” is **not self-contained**: it depends on `components/CaptureWidget/*` and app libs. For true centralization, capture-specific overlay/session/marker logic could live under `lib/capture-engine` or be injected via props/environment.

---

## SECTION 2 — EXTENSION ANALYSIS

### 2.1 Entry points

| Entry | Path | Role |
|-------|------|------|
| **Content script** | `echly-extension/src/content.tsx` | Injected when user clicks extension icon (no separate popup). Build output: `content.js` (and `content.js.map`). Mounts React root in shadow DOM, renders `ContentApp` → `CaptureWidget` with `ExtensionCaptureEnvironment`. |
| **Background** | `echly-extension/src/background.ts` | Service worker (`background.js` in manifest). Handles auth (extension token, broker), messaging (ECHLY_*), CAPTURE_TAB (chrome.tabs.captureVisibleTab), global UI state, session sync. |
| **Popup** | None | `manifest.json` has `action` with `default_title` and `default_icon` only; no `default_popup`. Tray is content-script UI, not a popup HTML. |
| **Session relay** | `echly-extension/sessionRelay.js` (from `src/sessionRelay.ts`) | Content script for `extension-auth` pages; runs at `document_start`. |

### 2.2 How CaptureWidget is used

- **Import path:** `import CaptureWidget from "@/lib/capture-engine/core/CaptureWidget";` (extension uses `@/` pointing to repo root).
- **Environment:** `const environment = new ExtensionCaptureEnvironment({ createSession, authenticatedFetch: apiFetch, notifyFeedbackCreated });` (created inside `ContentApp`, around line 906).
- **Props passed (summary):**  
  `sessionId`, `userId`, `extensionMode={true}`, `captureMode`, `onComplete`, `onDelete`, `onUpdate`, `widgetToggleRef`, `onRecordingChange`, `expanded`, `onExpandRequest`, `onCollapseRequest`, `captureDisabled`, `theme`, `onThemeToggle`, `fetchSessions`, `hasPreviousSessions`, `onPreviousSessionSelect`, `pointers`, `sessionLoading`, `sessionTitleProp`, `onSessionTitleChange`, `isProcessingFeedback`, `feedbackJobs`, `onSessionEnd`, `onCreateSession`, `onActiveSessionChange`, `ensureAuthenticated`, `verifySessionBeforeSessions`, `onTriggerLogin`, `globalSessionModeActive`, `globalSessionPaused`, `onSessionModeStart`, `onSessionModePause`, `onSessionModeResume`, `onSessionActivity`, `onSessionModeEnd`, `captureRootParent`, `launcherLogoUrl`, `openResumeModal`, `onResumeModalClose`, `sessionLimitReached`, **`environment`**.

Extension correctly passes `environment` and uses `ExtensionCaptureEnvironment` for createSession, apiFetch, notifyFeedbackCreated; Chrome-specific behavior (setActiveSession, startSessionMode, captureTabScreenshot, etc.) is inside `ExtensionCaptureEnvironment`.

### 2.3 Check for violations

- **Duplicated capture logic:**  
  - Screenshot: Extension implements `CAPTURE_TAB` in background and `ExtensionCaptureEnvironment.captureTabScreenshot()`; **useCaptureWidget** also has a fallback branch that calls `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })` when `environment?.captureTabScreenshot` is not used but chrome exists — so CAPTURE_TAB is invoked from both the adapter and the hook (redundant when environment is passed; hook should rely only on environment when present).
- **Business logic outside capture engine:**  
  - Content script holds: createSession (POST /api/sessions), fetchSessions, hasPreviousSessions, session limit state, feedback job queue, clarity assistant, submitPendingFeedback, onComplete implementation (apiFetch /api/feedback, ECHLY_PROCESS_FEEDBACK, etc.). This is appropriate: host owns session/API and passes callbacks + environment; the engine does not duplicate session creation or feedback POST.
- **Dashboard-related imports:**  
  - None. Extension imports from `@/lib/capture-engine`, `@/lib/utils/logger`, `@/lib/debug/echlyLogger`, and extension-local modules (api, contentScreenshot, ocr, etc.). No dashboard routes or dashboard-only components.
- **Unused legacy code:**  
  - Not assessed in depth; extension content is large (e.g. clarity flow, multiple feedback paths). No obvious dead entry points.

### 2.4 Confirm: extension ONLY provides Chrome APIs, messaging, environment adapter

- **Chrome APIs:** Used in background (tabs, storage, scripting, captureVisibleTab) and in content (runtime.sendMessage, runtime.getURL). Content also uses chrome in `ExtensionCaptureEnvironment` (correct) and in direct callbacks (e.g. onSessionModeEnd, onPreviousSessionSelect) — those are host responsibilities.
- **Messaging:** Background handles ECHLY_* and CAPTURE_TAB; content sends/receives messages and updates global state.
- **Environment adapter:** `ExtensionCaptureEnvironment` implements `CaptureEnvironment` and is the only adapter used by the extension for the widget.

**Violation:** Core still contains direct `chrome.*` usage (Section 1.4); from the extension’s perspective it “provides” behavior via environment, but the core also talks to chrome when it should go through environment or props only.

### 2.5 List ALL violations (extension)

1. **Redundant CAPTURE_TAB in core:** `useCaptureWidget.ts` implements a chrome fallback for tab capture when environment is present but screenshot is taken via a path that can still hit chrome (duplicate of what ExtensionCaptureEnvironment already does).
2. **Core Chrome usage:** As in Section 1.4, core widgets and hook call `chrome.runtime.sendMessage` / `chrome.runtime.getURL` directly instead of via environment or callbacks.
3. No dashboard imports or dashboard-only logic in the extension itself.

---

## SECTION 3 — DASHBOARD ANALYSIS

### 3.1 DashboardCaptureHost.tsx (IMPORTANT)

**File:** `app/(app)/dashboard/components/DashboardCaptureHost.tsx`

- **CaptureWidget usage:** **NONE.** The component does not import or render `CaptureWidget`.
- **useCaptureWidget usage:** **NONE.**
- **Environment object:** **NONE.**
- **html2canvas usage:** **NONE.**
- **Screenshot logic:** **NONE.**

**Behavior:** DashboardCaptureHost is a **CTA modal** that:
- Renders when `open` is true (e.g. “New Session” → `setCaptureOpen(true)`).
- Shows “Capture feedback anywhere”, “Install the Echly extension”, and an “Install Chrome Extension” button (opens Chrome Web Store URL).
- No capture engine, no session, no feedback, no screenshot.

So the dashboard **no longer uses the capture engine** in this component; it only prompts to install the extension.

### 3.2 Search entire dashboard for capture-related terms

Searched in `app/(app)/dashboard/` for:

- `captureTabScreenshot` — **0 matches**
- `CaptureWidget` — **0 matches**
- `useCaptureWidget` — **0 matches**
- `environment` (in capture sense) — **0 matches** (only unrelated use of “environment” if any)

**Conclusion:** Dashboard does not use CaptureWidget, useCaptureWidget, or any capture environment.

### 3.3 Confirm: dashboard NO LONGER uses capture engine; dashboard is purely UI + API layer

- **Dashboard pages:** Use workspace overview, sessions list, folders, session detail, feedback list, insights, etc. They use `authFetch` for API calls (sessions, feedback, tickets). No `lib/capture-engine` imports.
- **DashboardCaptureHost:** Only install-extension CTA; no capture engine.
- **Dashboard** is UI + API layer only; no in-dashboard capture or screenshot flow.

### 3.4 List any violations

**None.** Dashboard is clean of capture engine usage and extension-only logic.

---

## SECTION 4 — ENVIRONMENT ABSTRACTION

### 4.1 CaptureEnvironment type — all methods

**File:** `lib/capture-engine/CaptureEnvironment.ts`

| Method | Signature / purpose |
|--------|---------------------|
| `createSession` | `(): Promise<{ id: string } \| { limitReached: true; message: string; upgradePlan: unknown } \| null>` |
| `authenticatedFetch` | `(url: string, options?: RequestInit): Promise<Response>` |
| `notifyFeedbackCreated` | `(ticket: { id, title, actionSteps?, type? }): void` |
| `setActiveSession` | `(sessionId: string): void \| Promise<void>` |
| `startSessionMode` | `(): void \| Promise<void>` |
| `pauseSessionMode` | `(): void \| Promise<void>` |
| `resumeSessionMode` | `(): void \| Promise<void>` |
| `endSessionMode` | `(): void \| Promise<void>` |
| `reportActivity` | `(): void \| Promise<void>` |
| `expandWidget` | `(): void` |
| `collapseWidget` | `(): void` |
| `openLogin` | `(): void` |
| `openDashboard` | `(url: string): void` |
| `captureTabScreenshot` | `(): Promise<string \| null>` |

### 4.2 Where each method is implemented

- **Extension:** All 14 methods are implemented in `lib/capture-engine/ExtensionCaptureEnvironment.ts`. Session/createSession/notifyFeedbackCreated delegate to deps (content script); the rest use `chrome.runtime.sendMessage` (or getURL for assets where applicable). `captureTabScreenshot` sends `CAPTURE_TAB` to background.
- **Dashboard:** There is **no** `DashboardCaptureEnvironment` or dashboard implementation of `CaptureEnvironment`. The dashboard does not host the capture engine; it only shows the install-extension CTA.

### 4.3 Confirm: capture engine depends ONLY on environment; no direct platform logic in core

**Not fully satisfied:**

- When `environment` is provided, the engine uses it for:
  - `createSession`, `setActiveSession`, `startSessionMode` (startSession in useCaptureWidget).
  - `captureTabScreenshot` in getFullTabImage/captureScreenshot (with a chrome fallback in the same hook).
- But core **also**:
  - Calls `chrome.runtime.sendMessage` in CaptureWidget (Previous Sessions, Set Capture Mode, Open Billing, Start Session) and CaptureHeader (Open Dashboard), and uses `chrome.runtime.getURL` in SessionLimitUpgradeView.
  - Uses `authFetch` and `/api/feedback`, `/api/tickets` in useCaptureWidget (feedback load, saveEdit, updatePointer when no onUpdate).
  - Has a fallback to `@/lib/capture` for screenshot when no environment and no chrome.

So the engine **does** depend on the environment for session and screenshot when present, but it still contains **direct platform logic** (Chrome + dashboard auth/API) in core. Full abstraction would require: (1) moving all chrome.* behind environment or callbacks, and (2) using `environment.authenticatedFetch` for all API calls when environment is provided.

---

## SECTION 5 — DUPLICATION CHECK

Searched for duplicate logic related to capture, feedback, session, screenshot.

### 5.1 Screenshot / tab capture

| Location | Responsibility | Severity |
|----------|----------------|----------|
| `lib/capture-engine/ExtensionCaptureEnvironment.ts` | `captureTabScreenshot()` → sendMessage CAPTURE_TAB | — |
| `echly-extension/src/background.ts` | Handles CAPTURE_TAB, calls chrome.tabs.captureVisibleTab | — |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | getFullTabImage: uses environment.captureTabScreenshot **or** chrome sendMessage CAPTURE_TAB; captureScreenshot also has chrome branch and `@/lib/capture` fallback | **Medium:** Same CAPTURE_TAB protocol implemented in adapter and again in hook when env present but code path can still use chrome. |

### 5.2 Session creation

- **Extension:** content.tsx `createSession()` → apiFetch POST /api/sessions; passed to ExtensionCaptureEnvironment.
- **Engine:** useCaptureWidget `startSession` calls `environment.createSession()` when environment is set.
- **Dashboard:** useWorkspaceOverview (e.g. handleCreateSession) uses authFetch POST /api/sessions for workspace sessions, not for the capture widget (dashboard doesn’t use the widget).
- No duplication between engine and extension for session creation; extension provides createSession, engine calls environment.createSession().

### 5.3 Feedback POST / ticket update

- **Extension content:** Multiple places POST to /api/feedback (onComplete flows, submitPendingFeedback, clarity flows) and PATCH /api/tickets.
- **Engine:** Does not POST feedback itself; it calls `onComplete` and `onUpdate`/`onDelete`. Extension implements those with apiFetch. So feedback creation is in the host, not duplicated in the engine.
- **Engine:** `saveEdit` and `updatePointer` use `authFetch(\`/api/tickets/${id}\`)` when onUpdate is not provided — this is the **dashboard path**. In extension, onUpdate is provided, so no duplication with extension’s ticket PATCH. Duplication is **low**: same API contract, different call sites (host vs engine fallback).

### 5.4 Summary

- **Duplicate logic:** Main finding is **screenshot**: hook both uses environment.captureTabScreenshot and has its own chrome CAPTURE_TAB fallback (and web capture fallback). Severity **medium** (redundant, tight coupling to chrome in core).
- **File locations:** `lib/capture-engine/core/hooks/useCaptureWidget.ts` (getFullTabImage, captureScreenshot), `lib/capture-engine/ExtensionCaptureEnvironment.ts`, `echly-extension/src/background.ts`.
- Other areas: session create and feedback submit are appropriately split between host and engine; ticket PATCH exists in engine only as fallback when onUpdate is absent.

---

## SECTION 6 — DEPENDENCY FLOW

### 6.1 Data flow: user click → capture → feedback → API

**Extension:**

1. User clicks extension icon → background sets tray open, injects content (if needed), sends visibility state.
2. Content shows CaptureWidget with `extensionMode={true}` and `environment = ExtensionCaptureEnvironment(...)`.
3. User clicks “Start Session” → CaptureWidget calls `handlers.startSession` → useCaptureWidget’s `startSession` calls `environment.createSession()`, `environment.setActiveSession(id)`, `environment.startSessionMode()` (extension implements these via apiFetch and chrome.runtime.sendMessage).
4. User adds feedback (voice/region): capture flow in useCaptureWidget → screenshot via `environment.captureTabScreenshot()` (or chrome fallback) → onComplete(transcript, screenshot, callbacks) called. Content’s onComplete POSTs to /api/feedback (or sends ECHLY_PROCESS_FEEDBACK), then notifies background (ECHLY_FEEDBACK_CREATED), updates pointers state.
5. Ticket updates: CaptureWidget uses `onUpdate` → content’s handleUpdate → apiFetch PATCH /api/tickets.

So: **user click → CaptureWidget/handlers → environment or callbacks → extension (apiFetch + messaging) → API / background.**

**Dashboard:**

1. User clicks “New Session” (or similar) → dashboard sets `captureOpen=true` → DashboardCaptureHost opens.
2. DashboardCaptureHost does **not** render CaptureWidget; it shows “Install Chrome Extension” CTA. So there is **no** capture → feedback → API flow on the dashboard; the flow is “prompt to install extension” only.

### 6.2 Separate flows for extension vs dashboard

- **Extension:** Full flow: icon click → content script → CaptureWidget + ExtensionCaptureEnvironment → createSession / captureTabScreenshot / onComplete / onUpdate → apiFetch + chrome.runtime.sendMessage → backend / background.
- **Dashboard:** No capture flow. Dashboard uses capture host only to open the install-extension modal. Session creation on dashboard is for workspace sessions (e.g. useWorkspaceOverview), not for the capture widget.

### 6.3 Confirm: both use same engine; only environment differs

- **Extension:** Uses the same engine (`lib/capture-engine`): CaptureWidget + useCaptureWidget + ExtensionCaptureEnvironment. Single engine, extension-specific environment.
- **Dashboard:** Does **not** use the capture engine at all. So it is not “both use same engine”; only the **extension** uses the engine. The dashboard is UI + API only; no CaptureWidget, no environment implementation.

---

## SECTION 7 — UNUSED / DEAD CODE

### 7.1 Unused imports

- Not fully audited file-by-file. In the reviewed files, imports are used. One structural note: `lib/capture-engine` core imports from `@/components/CaptureWidget/*` and `@/lib/captureContext`, etc.; those are dependencies, not unused.

### 7.2 Unused files

- **`components/CaptureWidget/index.tsx`:** Re-exports `default` and types from `@/lib/capture-engine/core/CaptureWidget` and `./types`. No reference found in the codebase to `@/components/CaptureWidget` or `components/CaptureWidget/index` for consumption of the widget; extension imports from `@/lib/capture-engine/core/CaptureWidget`. So the re-export looks **legacy** and possibly unused for the widget itself (other components under `components/CaptureWidget/` are still used by the engine).
- **`lib/capture.ts`:** Exports `captureScreenshot` that returns `null`. Used as dynamic import fallback in useCaptureWidget when there is no environment and no chrome. So it is used but is a stub (web app has no real capture without getDisplayMedia).

### 7.3 Leftover phase 1–5 artifacts

- **Docs:** `docs/ECHLY_PHASE5_RECORDER_PARITY_REPORT.md`, `docs/ECHLY_COMPLETE_RECORDER_PARITY_FORENSIC.md`, `docs/ECHLY_RECORDER_PARITY_AUDIT.md` describe an earlier design where the dashboard was to host CaptureWidget with a DashboardCaptureHost that provided an environment (createSession, captureTabScreenshot, etc.). Current code no longer implements that; DashboardCaptureHost is install-extension only. So the docs are **outdated** relative to current behavior.
- **DashboardCaptureHost:** No leftover capture/session/environment logic; it’s a single-purpose CTA component.
- **types.ts comments:** Still refer to “Extension” and “Dashboard” for props (e.g. createSession, hasPreviousSessions, sessionLimitReached). These are documentation only; no dead code.

**Summary:** Likely unused: `components/CaptureWidget/index.tsx` as the widget entry (if nothing imports from it). Stub but used: `lib/capture.ts`. Outdated: phase docs that assume dashboard hosts the capture widget.

---

## SECTION 8 — FINAL VERDICT

### 8.1 Is architecture scalable? **PARTIALLY (6/10)**

- **Positives:** Single capture engine in `lib/capture-engine`; extension uses it with a clear adapter (`ExtensionCaptureEnvironment`). Dashboard is decoupled from capture (no engine usage). Adding another platform (e.g. another browser or Electron) would require a new environment implementation and host; the core API is environment-based.
- **Risks:** Core still uses Chrome and dashboard auth/API directly; core depends on `components/CaptureWidget/*` and app libs. Moving to a separate package or another app would require either moving those dependencies into the engine or abstracting them (e.g. inject overlay/markers/buildContext via environment or props). So scalability is **partial**: concept is right, implementation still has platform coupling.

### 8.2 Is extension clean? **MOSTLY (7/10)**

- Extension does not contain dashboard-only logic; it provides Chrome APIs, messaging, and the environment adapter. Capture logic lives in the engine; extension owns session/feedback API and callbacks.
- **Deductions:** Core (used by extension) still has direct chrome usage and duplicate screenshot path; those are core issues, not extension code, but they affect “extension cleanliness” in the sense of “extension + its engine dependency.”

### 8.3 Is dashboard clean? **YES (10/10)**

- Dashboard does not use CaptureWidget, useCaptureWidget, or any capture environment. No capture or screenshot logic in the dashboard. DashboardCaptureHost is a simple install-extension CTA. Dashboard is UI + API only.

### 8.4 Risks for future scaling

1. **Core Chrome and auth coupling:** Any new platform (e.g. Firefox, desktop app) would need the core to stop using `chrome.*` and `authFetch`/`/api/` and rely only on `CaptureEnvironment` (and possibly callbacks) for all platform operations and HTTP.
2. **Core dependency on `components/CaptureWidget`:** RegionCaptureOverlay, SessionOverlay, hideEchlyUI, feedbackMarkers, sessionMode, shortDeviceName live outside the engine. Extracting the engine to a package would require either moving these into the package or defining an overlay/context API supplied by the host.
3. **Single environment implementation:** Only ExtensionCaptureEnvironment exists. A future dashboard-based capture (if reintroduced) would need a DashboardCaptureEnvironment and a host that actually renders CaptureWidget and passes that environment.
4. **Documentation drift:** Phase 5 / forensic docs describe a dashboard that hosts the widget; current product does not. Keeping docs aligned with “dashboard = CTA only” will avoid confusion.

### 8.5 Overall score: **6.5 / 10**

- **Centralization:** Engine is in one place and used only by the extension; but core still has Chrome and dashboard-specific API usage and external UI deps. **6/10**
- **Extension:** Clean of dashboard logic; uses environment; core violations affect score. **7/10**
- **Dashboard:** Clean; no capture engine. **10/10**
- **Environment abstraction:** Interface is clear and extension implements it; core does not rely on it exclusively. **5/10**
- **Duplication:** Screenshot path partially duplicated in core vs adapter. **6/10**
- **Scalability:** Good direction; implementation needs refactor to be platform-agnostic. **6/10**

**Summary:** Architecture is on the right track (one engine, one extension adapter, dashboard decoupled) but the **core** still violates “no Chrome, no dashboard API” and depends on external components. Addressing core violations and optionally consolidating screenshot handling would raise the score and make the system ready for multiple platforms.

---

*End of report. No files were modified.*
