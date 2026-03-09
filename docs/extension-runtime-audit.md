# Echly Chrome Extension — Full Runtime Architecture Audit

**Read-only investigation.** No code was modified.  
Purpose: diagnose state bugs and UI flow failures.

---

## Executive Summary

This audit maps the complete runtime architecture of the Echly Chrome extension to diagnose:

1. **Capture UI flash and disappear** — overlay briefly appears then vanishes
2. **Unexpected session end** — session terminates without user action
3. **Popup opens on wrong screen** — widget shows tray/cards instead of home
4. **Global state synchronization** — potential desync between background and content

---

## Section 1 — Entry Points

### manifest.json

| Entry | File | Purpose |
|-------|------|---------|
| **Action popup** | `popup.html` | `"action":{"default_popup":"popup.html"}` — extension icon click opens this |
| **Background** | `background.js` | Service worker; source of truth for auth, tokens, `globalUIState` |
| **Content script** | `content.js` | Injected on `<all_urls>` at `document_idle` |

### Which File Mounts the Widget

| Responsibility | File | Function |
|----------------|------|----------|
| **Widget host creation** | `content.tsx` | `main()` (lines 1403–1425) creates `#echly-shadow-host` div, appends to `document.documentElement` |
| **React mount** | `content.tsx` | `mountReactApp(host)` (lines 1000–1015) attaches shadow root, creates `#echly-root`, renders `<ContentApp>` |
| **Widget component** | `content.tsx` | `ContentApp` renders `<CaptureWidget>` (line 918) |

**Flow:** `main()` → `mountReactApp(host)` → `createRoot(container).render(<ContentApp />)` → `ContentApp` renders `CaptureWidget`.

### Which File Controls the Popup UI

| UI | File | Entry |
|----|------|-------|
| **Extension popup** | `popup.tsx` | `popup.html` loads `popup.js` (bundled from `popup.tsx`); `createRoot(rootEl).render(<PopupApp />)` |
| **Popup behavior** | `popup.tsx` | Login-only: if authenticated → `toggleVisibility()` + `window.close()`; else shows "Continue with Google" |

**Note:** The extension popup has no "home" vs "tray" screens — it is login-only. The **in-page widget** (CaptureWidget) has multiple screens: command screen (mode tiles), feedback tray, session overlay.

---

## Section 2 — Widget Mount Flow

### createCaptureRoot

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts` (lines 357–375)

```ts
const createCaptureRoot = useCallback(() => {
  if (captureRootRef.current) {
    console.debug("ECHLY createCaptureRoot", "skipped (ref already set)");
    return;
  }
  const existingRoot = document.getElementById(OVERLAY_ROOT_ID);
  if (existingRoot) {
    console.debug("ECHLY createCaptureRoot", "reusing existing DOM root");
    captureRootRef.current = existingRoot as HTMLDivElement;
    setCaptureRootEl(existingRoot as HTMLDivElement);
    setCaptureRootReady(true);
    return;
  }
  console.debug("ECHLY createCaptureRoot");
  setSessionFeedbackPending(null);
  const captureEl = document.createElement("div");
  captureEl.id = OVERLAY_ROOT_ID;  // "echly-capture-root"
  document.body.appendChild(captureEl);
  captureRootRef.current = captureEl;
  setCaptureRootEl(captureEl);
  setCaptureRootReady(true);
}, []);
```

**Guards:**
- `captureRootRef.current` → skip if ref already set
- `document.getElementById(OVERLAY_ROOT_ID)` → reuse existing DOM root if present

### removeCaptureRoot

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts` (lines 398–415)

```ts
const removeCaptureRoot = useCallback(() => {
  if (recordingActiveRef.current) return;  // BLOCKS during recording
  if (extensionMode && globalSessionModeActive !== false) return;  // BLOCKS if session active
  // ... removes DOM, clears refs
}, [extensionMode, globalSessionModeActive]);
```

### When Root Is Created

| Trigger | Location | Condition |
|---------|----------|-----------|
| `globalSessionModeActive === true` | useCaptureWidget.ts:1106–1108 | Effect `[globalSessionModeActive, createCaptureRoot]` |
| Sync from global state | useCaptureWidget.ts:1123 | Effect when `globalSessionModeActive === true` and `!captureRootRef.current` |
| Tab visibility | useCaptureWidget.ts:1187 | Visibility effect: tab becomes visible, `globalSessionModeActive === true`, `!captureRootRef.current` |
| "Add feedback" click | useCaptureWidget.ts:1348 | `handleAddFeedback` |

### When Root Is Destroyed

| Trigger | Location |
|---------|----------|
| `globalSessionModeActive === false` | useCaptureWidget.ts:1139, 1155 |
| Non-session capture flow end | useCaptureWidget.ts:596, 713, 732, 753, 775, 978 |
| Microphone permission denied | useCaptureWidget.ts:440 |
| Discard listening | useCaptureWidget.ts:744 |

### Multiple Roots

**Guard in createCaptureRoot:** `if (captureRootRef.current) return` — prevents creating a second root when ref is set.

**Reuse path:** If `document.getElementById(OVERLAY_ROOT_ID)` exists but `captureRootRef.current` is null (e.g. after remount), the function reuses the existing DOM element. Only one `#echly-capture-root` can exist in the document.

**Conclusion:** Multiple roots are prevented. A single `#echly-capture-root` exists per tab.

---

## Section 3 — Click → Feedback Flow

### Complete Path: User Clicks Page (Session Mode)

| Step | File:Line | Function / Event |
|------|-----------|------------------|
| 1 | SessionOverlay.tsx | `attachClickCapture` / `attachElementHighlighter` — click capture active when `sessionMode && !sessionPaused && !sessionActionPending && sessionFeedbackPending == null` |
| 2 | session/clickCapture.ts | Click handler captures element |
| 3 | useCaptureWidget.ts:1189 | `handleSessionElementClicked(element)` |
| 4 | useCaptureWidget.ts:1195–1210 | `getFullTabImage()` → `cropScreenshotAroundElement()` → `buildCaptureContext()` |
| 5 | useCaptureWidget.ts:1211 | `setSessionFeedbackPending({ screenshot, context })` |
| 6 | CaptureLayer → SessionOverlay | Renders voice or text UI based on `captureMode` |
| 7 | Voice: `handleSessionStartVoice` | useCaptureWidget.ts:1290 — creates Recording, `startListening()` |
| 7 | Text: `handleSessionFeedbackSubmit` | useCaptureWidget.ts:1199 — sends transcript to `onComplete` |
| 8 | useCaptureWidget.ts:569 | `recordingActiveRef.current = true`; `setState("voice_listening")` |
| 9 | recognitionRef.start() | Web Speech API starts |
| 10 | User stops → `finishListening` | useCaptureWidget.ts:451 |
| 11 | useCaptureWidget.ts:476–478 | `pipelineActiveRef.current = true`; `onComplete(transcript, screenshot, callbacks, context, { sessionMode: true })` |
| 12 | content.tsx:handleComplete | Sends `ECHLY_PROCESS_FEEDBACK` or calls API directly |
| 13 | background.ts:546 | `ECHLY_PROCESS_FEEDBACK` → structure-feedback → create ticket → `globalUIState.pointers` append → `broadcastUIState()` |
| 14 | onSuccess callback | useCaptureWidget.ts:521–528 — `updateMarker`, `setPointers`, `setHighlightTicketId` |

### Functions Involved

- `attachClickCapture` / `detachClickCapture` — session/clickCapture.ts
- `attachElementHighlighter` / `detachElementHighlighter` — session/elementHighlighter.ts
- `handleSessionElementClicked` — useCaptureWidget.ts:1189
- `getFullTabImage` — useCaptureWidget.ts:691 (sends `CAPTURE_TAB` to background)
- `cropScreenshotAroundElement` — session/cropAroundElement.ts
- `buildCaptureContext` — lib/captureContext.ts
- `startListening` — useCaptureWidget.ts:418
- `finishListening` — useCaptureWidget.ts:451
- `handleComplete` — content.tsx:267 (ContentApp)
- `ECHLY_PROCESS_FEEDBACK` — background.ts:546

---

## Section 4 — Session Lifecycle

### ECHLY_SESSION_MODE_START

| Location | Action |
|----------|--------|
| **background.ts:345–354** | `sessionModeActive = true`, `sessionPaused = false`, `sessionId = activeSessionId`, `persistSessionLifecycleState()`, `broadcastUIState()` |
| **Sender** | Content (CaptureWidget) via `onSessionModeStart` → `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" })` |
| **Storage** | `chrome.storage.local.set({ activeSessionId, sessionModeActive, sessionPaused })` |

### ECHLY_SESSION_MODE_PAUSE

| Location | Action |
|----------|--------|
| **background.ts:356–365** | `sessionModeActive = true`, `sessionPaused = true`, `sessionId = activeSessionId`, `persistSessionLifecycleState()`, `broadcastUIState()` |
| **Sender** | CaptureWidget `pauseSession` → `onSessionModePause` |
| **Storage** | Same as START |

### ECHLY_SESSION_MODE_RESUME

| Location | Action |
|----------|--------|
| **background.ts:367–376** | `sessionModeActive = true`, `sessionPaused = false`, `sessionId = activeSessionId`, `persistSessionLifecycleState()`, `broadcastUIState()` |
| **Sender** | CaptureWidget `resumeSession` → `onSessionModeResume` |

### ECHLY_SESSION_MODE_END

| Location | Action |
|----------|--------|
| **background.ts:378–394** | `activeSessionId = null`, `sessionId = null`, `sessionModeActive = false`, `sessionPaused = false`, `pointers = []`, `chrome.storage.local.set(...)`, `broadcastUIState()`, `setTimeout(broadcastUIState, 150)` |
| **Sender** | CaptureWidget `endSession` → `onSessionModeEnd` |

### Unexpected Session End

**Potential causes:**

1. **ECHLY_TOGGLE_VISIBILITY** (background.ts:247–267): When `visible` becomes `true`, background sets `sessionModeActive = false`, `sessionPaused = false`, and sends `ECHLY_RESET_WIDGET`. This clears session state on every widget open.

2. **initializeSessionState race** (background.ts:62–73): `chrome.storage.local.get` is async. If `broadcastUIState()` runs before the callback, `globalUIState.sessionId` can still be null.

3. **No explicit session-end message from content** other than `ECHLY_SESSION_MODE_END`. Session end is driven by user action or the above reset.

---

## Section 5 — Global State Flow

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKGROUND (background.ts)                                               │
│   globalUIState: { visible, expanded, isRecording, sessionId,            │
│     sessionModeActive, sessionPaused, pointers, captureMode }             │
│   broadcastUIState() → chrome.tabs.sendMessage(tabId, ECHLY_GLOBAL_STATE) │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTENT (content.tsx)                                                    │
│   chrome.runtime.onMessage → msg.type === "ECHLY_GLOBAL_STATE"            │
│   → setHostVisibility(state.visible)                                     │
│   → __ECHLY_APPLY_GLOBAL_STATE__?.(state)  // direct React setter         │
│   → window.dispatchEvent(ECHLY_GLOBAL_STATE)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ContentApp (content.tsx)                                                  │
│   useEffect: ECHLY_GLOBAL_STATE listener → setHostVisibility, setGlobalState │
│   useEffect: __ECHLY_APPLY_GLOBAL_STATE__ = (state) => { setHostVisibility, setGlobalState } │
│   useEffect: ECHLY_GET_GLOBAL_STATE on mount → hydrate                    │
│   useEffect: visibilitychange → ECHLY_GET_GLOBAL_STATE → resync           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CaptureWidget (CaptureWidget.tsx)                                         │
│   props: pointers, expanded, globalSessionModeActive, globalSessionPaused, captureMode │
│   ← globalState.pointers, globalState.expanded, etc. from ContentApp     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ useCaptureWidget                                                         │
│   pointersProp → setPointers (if !recordingActiveRef.current)             │
│   globalSessionModeActive → setSessionMode, createCaptureRoot/removeCaptureRoot │
│   globalSessionPaused → setSessionPaused                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Change Locations

| Location | What Changes |
|----------|-------------|
| background.ts | All `globalUIState` mutations |
| content.tsx:139 | `setGlobalState` from ECHLY_GLOBAL_STATE, ECHLY_GET_GLOBAL_STATE, visibilitychange |
| content.tsx:144 | `__ECHLY_APPLY_GLOBAL_STATE__` — direct apply from message handler |
| useCaptureWidget.ts:1165 | `setPointers(pointersProp)` — **guarded by `!recordingActiveRef.current`** |
| useCaptureWidget.ts:1102–1104 | `setSessionFeedbackPending(null)` when globalSessionPaused |

---

## Section 6 — Pointer / Feedback Flow

### ECHLY_PROCESS_FEEDBACK Path

| Step | File:Line | Action |
|------|-----------|--------|
| 1 | content.tsx or useCaptureWidget | Sends `ECHLY_PROCESS_FEEDBACK` with `{ transcript, screenshotUrl, screenshotId, sessionId, context }` |
| 2 | background.ts:546 | Receives; validates transcript + sessionId |
| 3 | background.ts:447 | `/api/structure-feedback` |
| 4 | background.ts:497–531 | For each ticket: `/api/feedback` POST |
| 5 | background.ts:532–538 | `firstCreated` → `globalUIState.pointers = [...pointers, pointer]` |
| 6 | background.ts:539 | `broadcastUIState()` |
| 7 | background.ts:540–548 | `ECHLY_FEEDBACK_CREATED` to all tabs |
| 8 | content.tsx:1361–1363 | Dispatches `ECHLY_FEEDBACK_CREATED` CustomEvent |
| 9 | useCaptureWidget.ts:1162–1169 | Effect `[extensionMode, pointersProp]`: **if `recordingActiveRef.current` return**; else `setPointers(pointersProp)` |

### Pointer Update Skip

**Root cause:** useCaptureWidget.ts:1165 — `if (recordingActiveRef.current) return` prevents `setPointers(pointersProp)` while the user is in a recording flow (voice_listening, processing, pill exiting).

When feedback is created and broadcast, the widget may still have `recordingActiveRef.current === true`, so the pointer sync effect returns early and the tray does not update.

---

## Section 7 — Mode Selection

### Voice vs Text Mode

| Storage | Location |
|---------|----------|
| **Background** | `globalUIState.captureMode` ("voice" \| "text") — background.ts:43, 291 |
| **Set by** | `ECHLY_SET_CAPTURE_MODE` (background.ts:288–296) |
| **Read by** | Content passes `captureMode={globalState.captureMode ?? "voice"}` to CaptureWidget |

### Mode Persistence

- **Not persisted to chrome.storage** — only in-memory `globalUIState`
- On extension reload or background restart, `captureMode` resets to `"voice"` (default in background.ts:52)
- Mode is broadcast via `broadcastUIState()` when changed

### Mode Reset

Mode can reset when:
1. Background service worker restarts (in-memory state lost)
2. `ECHLY_TOGGLE_VISIBILITY` does not clear captureMode, but `ECHLY_RESET_WIDGET` remounts the widget; CaptureWidget receives fresh `captureMode` from `globalState` which is unchanged

---

## Section 8 — Recording Pipeline

### State Variables

| Variable | File | When Set True | When Set False |
|----------|------|---------------|----------------|
| **recordingActiveRef** | useCaptureWidget.ts:211 | `startListening` (line 439) | `recording.onend`, `finishListening`, `discardListening`, error paths |
| **pipelineActiveRef** | useCaptureWidget.ts:189 | Before `onComplete` / session feedback (lines 476, 534, 912, 1248) | In onSuccess/onError callbacks |
| **pausePending** | useCaptureWidget.ts:169 | `pauseSession` when `pipelineActiveRef.current` (line 1003) | `finalizePause`, global sync (line 1102) |
| **endPending** | useCaptureWidget.ts:170 | `endSession` when `pipelineActiveRef.current` (line 1057) | `finalizeEnd` (line 1055) |

### Blocking Behavior

| Ref | Blocks |
|-----|--------|
| **recordingActiveRef** | `removeCaptureRoot` (line 399), pointer sync effect (line 1165), global sync effects (lines 1132, 1152) |
| **pipelineActiveRef** | `pauseSession` and `endSession` wait via polling until pipeline finishes |
| **pausePending** | Resume button disabled (SessionControlPanel) |
| **endPending** | End button disabled |

---

## Section 9 — Popup Behavior

### Extension Icon Click Flow

| Step | File | Action |
|------|------|--------|
| 1 | Chrome | Opens `popup.html` (manifest action default_popup) |
| 2 | popup.tsx | `createRoot(rootEl).render(<PopupApp />)` |
| 3 | PopupApp | `getAuthState()` on mount |
| 4 | If authenticated | `toggleVisibility()` → `ECHLY_TOGGLE_VISIBILITY`; `window.close()` |
| 5 | If not authenticated | Renders "Continue with Google" |

### Popup Screens

The extension popup has only:
- Loading
- Login (Continue with Google)
- Closing (when authenticated)

There is no "home" vs "tray" in the popup. The **in-page widget** has:
- **Command screen** (showCommandScreen=true): mode tiles (Voice/Text)
- **Feedback tray** (showCommandScreen=false): list of feedback items
- **Session overlay**: when in session mode

### Why Widget Might Open on Tray Instead of Home

| Cause | Location |
|-------|----------|
| **showCommandScreen** | CaptureWidget.tsx:59 — `useState(true)`; set false by `loadSessionWithPointers` (163), `onPreviousSessionSelect` (209) |
| **ECHLY_RESET_WIDGET** | content.tsx:131 — `setWidgetResetKey(k => k + 1)` → remounts CaptureWidget → `showCommandScreen` resets to true |
| **loadSessionWithPointers** | Content does not pass `loadSessionWithPointers` to CaptureWidget — prop is undefined |
| **Stale expanded** | ECHLY_TOGGLE_VISIBILITY sets `expanded = false` when opening; ECHLY_RESET_WIDGET also triggers remount |

**Conclusion:** After ECHLY_RESET_WIDGET, the widget remounts with `showCommandScreen=true`. If the user reports "opens on tray," possible causes:
1. Message ordering: ECHLY_GLOBAL_STATE with `expanded=true` applied before ECHLY_RESET_WIDGET
2. Tab-specific state: different tab had `showCommandScreen=false` before reset
3. User interpretation: "tray" = expanded panel with feedback list; "home" = collapsed floating button or command screen

---

## Section 10 — Message System

| Message | Sender | Receiver | Side Effects |
|---------|--------|----------|--------------|
| **ECHLY_GLOBAL_STATE** | Background | Content (all tabs) | setHostVisibility, __ECHLY_APPLY_GLOBAL_STATE__, dispatch CustomEvent |
| **ECHLY_PROCESS_FEEDBACK** | Content | Background | Structure + create ticket, append to pointers, broadcast |
| **ECHLY_SESSION_MODE_START** | Content | Background | sessionModeActive=true, sessionPaused=false, persist, broadcast |
| **ECHLY_SESSION_MODE_PAUSE** | Content | Background | sessionModeActive=true, sessionPaused=true, persist, broadcast |
| **ECHLY_SESSION_MODE_RESUME** | Content | Background | sessionModeActive=true, sessionPaused=false, persist, broadcast |
| **ECHLY_SESSION_MODE_END** | Content | Background | Clear session, pointers; persist; broadcast |
| **ECHLY_SET_ACTIVE_SESSION** | Content | Background | Set activeSessionId, fetch pointers, broadcast |
| **ECHLY_GET_GLOBAL_STATE** | Content, Popup | Background | Returns `{ state: globalUIState }` |
| **ECHLY_GET_ACTIVE_SESSION** | — | — | Not present in codebase |
| **ECHLY_TOGGLE_VISIBILITY** | Popup | Background | Toggle visible; if visible→true: clear session, ECHLY_RESET_WIDGET, broadcast |
| **ECHLY_RESET_WIDGET** | Background | Content | Dispatch CustomEvent → ContentApp sets widgetResetKey++, expanded=false |
| **ECHLY_FEEDBACK_CREATED** | Background | Content | Dispatch CustomEvent |
| **ECHLY_SESSION_STATE_SYNC** | Background | Content | Tab activation → content fetches ECHLY_GET_GLOBAL_STATE and applies |

---

## Section 11 — Crash Points

### Potential Runtime Errors

| Risk | Location | Condition |
|------|----------|-----------|
| **undefined analyser** | useCaptureWidget.ts:254 | `state === "voice_listening"` but `analyserRef.current` null — effect returns early |
| **null capture root** | useCaptureWidget.ts:451, 471 | `captureRootRef.current` can be null; `createMarker`/`updateMarker` receive `root` — guarded by `if (root)` |
| **Missing DOM container** | content.tsx:1405 | `document.getElementById(SHADOW_HOST_ID)` — created in main() if missing |
| **Invalid pointer** | useCaptureWidget.ts:1165 | `setPointers(pointersProp)` — pointersProp from background; could be malformed if API returns bad data |

### Flash Then Disappear

| Scenario | Cause |
|----------|-------|
| **createCaptureRoot then removeCaptureRoot** | globalSessionModeActive flips true→false quickly (e.g. ECHLY_TOGGLE_VISIBILITY clears session right after start) |
| **recordingActiveRef blocks removeCaptureRoot** | removeCaptureRoot returns early when recordingActiveRef; but when recording ends, a subsequent effect may call removeCaptureRoot |
| **Effect ordering** | globalSessionModeActive effect creates root; seconds later, another effect (e.g. visibility) or sync sees `globalSessionModeActive=false` and removes root |
| **Tab switch** | Tab A has session; user switches to Tab B; Tab B gets ECHLY_GLOBAL_STATE with sessionId; then ECHLY_SESSION_STATE_SYNC fetches state — if session ended meanwhile, Tab B could get stale then fresh state |

---

## Section 12 — Duplicate Roots

### createCaptureRoot Guard

```ts
if (captureRootRef.current) {
  console.debug("ECHLY createCaptureRoot", "skipped (ref already set)");
  return;
}
```

**Conclusion:** Yes — `if (captureRootRef.current) return` prevents creating a second root when the ref is already set.

**Edge case:** After a React remount (e.g. widgetResetKey change), `captureRootRef` is a new ref and starts as null. The DOM element `#echly-capture-root` may still exist. The function checks `document.getElementById(OVERLAY_ROOT_ID)` and reuses it, so only one root exists.

---

## Section 13 — Timelines

### Timeline A: Click Page → Voice Capture UI

```
T0    User clicks element on page (session mode active)
T1    attachClickCapture fires → handleSessionElementClicked(element)
T2    getFullTabImage() → CAPTURE_TAB to background → screenshot
T3    cropScreenshotAroundElement(fullImage, element)
T4    setSessionFeedbackPending({ screenshot, context })
T5    SessionOverlay re-renders → VoiceCapturePanel (captureMode=voice)
T6    User clicks mic → handleSessionStartVoice
T7    startListening() → recordingActiveRef=true, setState("voice_listening")
T8    navigator.mediaDevices.getUserMedia, AudioContext, recognition.start()
T9    User speaks → recognition.onresult → setRecordings transcript
T10   User stops → finishListening
T11   pipelineActiveRef=true, onComplete(transcript, screenshot, callbacks, { sessionMode: true })
T12   content handleComplete → ECHLY_PROCESS_FEEDBACK or direct API
T13   Background creates ticket, globalUIState.pointers append, broadcastUIState
T14   Content receives ECHLY_GLOBAL_STATE; useCaptureWidget pointer effect runs
T15   If recordingActiveRef false: setPointers(pointersProp); else SKIP
T16   onSuccess callback: updateMarker, setPointers (local), setHighlightTicketId
```

### Timeline B: Extension Icon Click → Popup / Widget

```
T0    User clicks extension icon
T1    Chrome opens popup.html
T2    popup.js loads → PopupApp mounts
T3    getAuthState() → ECHLY_GET_AUTH_STATE
T4    If authenticated: toggleVisibility() → ECHLY_TOGGLE_VISIBILITY
T5    window.close() — popup closes
T6    Background: visible=true, sessionModeActive=false, sessionPaused=false, ECHLY_RESET_WIDGET to all tabs
T7    Background: broadcastUIState()
T8    Content: ECHLY_RESET_WIDGET → setWidgetResetKey++, setGlobalState(expanded=false)
T9    Content: ECHLY_GLOBAL_STATE → setHostVisibility(true), setGlobalState
T10   CaptureWidget remounts (key change) → showCommandScreen=true
T11   Host display=block → widget visible
T12   expanded=false → showFloatingButton=true (collapsed)
T13   User sees floating "Echly" button
T14   User clicks → onExpandRequest → ECHLY_EXPAND_WIDGET
T15   Background: expanded=true, broadcastUIState
T16   Content: setGlobalState(expanded=true)
T17   showPanel=true, showCommandScreen=true → mode tiles (Voice/Text)
```

---

## Section 14 — Root Cause Analysis

### 1. Capture Screen Flash and Disappear

| Cause | File:Line | Explanation |
|-------|-----------|-------------|
| **Effect race** | useCaptureWidget.ts:1106–1157 | Multiple effects depend on `globalSessionModeActive`. One creates root, another may remove it if state flips. |
| **recordingActiveRef guard** | useCaptureWidget.ts:399 | removeCaptureRoot returns early when recording; when recording ends, a later effect can run and remove root. |
| **ECHLY_TOGGLE_VISIBILITY clears session** | background.ts:251–261 | On widget open, session state is cleared and ECHLY_RESET_WIDGET is sent. If a session was active, this can tear down the overlay. |
| **Double broadcast** | background.ts:392 | `setTimeout(broadcastUIState, 150)` after ECHLY_SESSION_MODE_END — second broadcast can trigger effects that remove root. |

### 2. Unexpected Session End

| Cause | File:Line | Explanation |
|-------|-----------|-------------|
| **ECHLY_TOGGLE_VISIBILITY** | background.ts:251–254 | When opening widget, background sets `sessionModeActive=false`, `sessionPaused=false`, persists, and sends ECHLY_RESET_WIDGET. Session is cleared on every open. |
| **initializeSessionState race** | background.ts:62–78 | `chrome.storage.local.get` is async. First `broadcastUIState()` can run before restore, so tabs get `sessionId=null`. |
| **Tab activation sync** | background.ts:221–234 | On tab switch, ECHLY_GLOBAL_STATE and ECHLY_SESSION_STATE_SYNC are sent. If session ended in another tab, this tab gets the cleared state. |

### 3. Popup Opens on Wrong Screen

| Cause | File:Line | Explanation |
|-------|-----------|-------------|
| **Extension popup** | popup.tsx | Popup is login-only; no home/tray. If user means the popup, the only screens are Loading, Login, Closing. |
| **Widget showCommandScreen** | CaptureWidget.tsx:59, 163, 209 | `showCommandScreen` controls command tiles vs tray. Reset remounts with true. If `loadSessionWithPointers` were passed and set, it would switch to tray. |
| **Message ordering** | content.tsx:1359–1395 | ECHLY_GLOBAL_STATE can arrive before ECHLY_RESET_WIDGET. Brief stale state (e.g. expanded=true) before remount. |
| **expanded state** | background.ts:249 | ECHLY_TOGGLE_VISIBILITY sets expanded=false when opening. If a prior broadcast had expanded=true, a race could show the panel expanded. |

### 4. Global State Synchronization

| Issue | Location | Explanation |
|-------|----------|-------------|
| **recordingActiveRef blocks pointer sync** | useCaptureWidget.ts:1165 | `if (recordingActiveRef.current) return` — tray does not update with new pointers while recording. |
| **No persistence of captureMode** | background.ts | captureMode is in-memory only; lost on service worker restart. |
| **Multiple state sources** | content.tsx | ECHLY_GLOBAL_STATE, ECHLY_GET_GLOBAL_STATE, visibilitychange, __ECHLY_APPLY_GLOBAL_STATE__ — all can update state; ordering matters. |

---

## Appendix: File Reference

| File | Role |
|------|------|
| `echly-extension/manifest.json` | Entry points |
| `echly-extension/src/background.ts` | Global state, messages, auth |
| `echly-extension/src/content.tsx` | Widget host, ContentApp, message routing |
| `echly-extension/src/popup.tsx` | Extension popup (login) |
| `components/CaptureWidget/CaptureWidget.tsx` | Widget shell |
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | Widget state, create/remove root, recording |
| `components/CaptureWidget/CaptureLayer.tsx` | Overlay container |
| `components/CaptureWidget/SessionOverlay.tsx` | Session mode UI |

---

## Section 15 — Runtime Interference Audit (Scroll & Events)

**Purpose:** Ensure the extension never breaks host page behavior (scroll, wheel, touch, clicks).

### 1. Global Event Listeners (content script / extension only)

| Location | Event | Target | Capture? | Passive? | Blocks scroll? |
|----------|--------|--------|----------|----------|----------------|
| content.tsx | ECHLY_TOGGLE_WIDGET | window | no | n/a | no |
| content.tsx | ECHLY_RESET_WIDGET | window | no | n/a | no |
| content.tsx | ECHLY_GLOBAL_STATE | window | no | n/a | no |
| content.tsx | visibilitychange | document | no | n/a | no |
| content.tsx | wheel | window | no | **yes** | no |
| content.tsx | scroll | document | no | **yes** | no |
| clickCapture.ts | click | **document** | **yes** | no | no (only preventDefault on valid target) |
| useCaptureWidget.ts | mousemove, mouseup | window | no | no | no (preventDefault only when isDragging) |
| useCaptureWidget.ts | keydown | document | no | no | no (Escape only, capture flow) |
| useCaptureWidget.ts | mousedown | document | no | no | no (click-outside, extensionMode only) |
| SessionOverlay.tsx | mousemove | window | no | **yes** | no |
| elementHighlighter.ts | mousemove | document | no | **yes** | no |
| feedbackMarkers.ts | scroll, resize | window | scroll **capture: true**, passive | no | no |
| RegionCaptureOverlay.tsx | keydown, visibilitychange, mouseup | document/window | no | n/a | no |

**Capture-phase click (clickCapture.ts):** Handler runs only when `enabledRef()` is true and `isSessionCaptureTarget(target)`. It calls `preventDefault()` and `stopPropagation()` **only for valid capture targets**, so normal page clicks and scroll are not affected.

### 2. preventDefault / stopPropagation affecting scroll

- **wheel / touchmove:** No listener in the extension calls `preventDefault()` on wheel or touchmove. No scroll-blocking listeners.
- **useCaptureWidget handleMouseMove:** `e.preventDefault()` only when `isDragging` is true (during widget drag). Does not affect wheel/scroll.
- **RegionCaptureOverlay:** `preventDefault()` on mousedown/mouseup only on the overlay’s own div (region selection). Overlay is full-screen only during region capture; when visible, blocking is intentional.
- **Click capture:** `preventDefault()`/`stopPropagation()` only when the clicked element is a session capture target; otherwise the handler returns without touching the event.

### 3. Overlay layers and pointer-events

| Layer | File | Full-screen? | pointer-events | Fix applied |
|-------|------|--------------|----------------|-------------|
| #echly-shadow-host | content.tsx | no (bottom-right widget) | auto | none needed |
| #echly-capture-root | useCaptureWidget.ts + content.tsx | no (wrapper) | **none** (inline + CSS) | already correct |
| echly-marker-layer | useCaptureWidget.ts | yes (fixed 100%) | **none** | already correct |
| Clarity assistant backdrop | content.tsx | yes | was default (auto) | **yes:** backdrop `pointer-events: none`, inner card `pointer-events: auto` |
| Region capture dim | RegionCaptureOverlay.tsx | yes | auto when selecting, none when released | intentional during region select |
| Session overlay | SessionOverlay.tsx | no (floating panels) | n/a | none needed |
| echly-focus-overlay | CaptureLayer.tsx | yes | auto | only in non-extension mode; not used in content script |

### 4. CSS that could block scroll

| Source | Rule | Effect on host page | Fix applied |
|--------|------|---------------------|-------------|
| popup.css (injected into document.head) | `html, body { height: 100%; overflow: hidden; }` | **Locks page scroll** when content script injects popup.css for #echly-capture-root | **yes:** content.tsx injects style `#echly-page-scroll-restore` with `html, body { overflow: visible !important; }` after capture-root styles |

**Root cause of “users cannot scroll”:** The content script injects `popup.css` into the host page’s `document.head` so that `#echly-capture-root` (light DOM) gets styles. That stylesheet contains global `html, body { overflow: hidden }`, which was applied to the host page and prevented scrolling. The fix is to inject a small override so the host page always has `overflow: visible` for html/body.

### 5. Runtime overrides of browser behavior

- **Prototype / API overrides:** None found in extension source (no `Event.prototype`, `Element.prototype`, `addEventListener` override, etc.).
- **MutationObserver:** None in extension source that would inject overlays or alter layout in a way that blocks scroll.

### 6. Scroll lock (body/documentElement.style.overflow)

- No code in the extension sets `document.body.style.overflow` or `document.documentElement.style.overflow` to `"hidden"`.  
- useCaptureWidget sets `document.body.style.userSelect = "none"` only during widget drag and restores it on mouseup; this does not affect scroll.

### 7. Shadow host (#echly-shadow-host)

- Styles: `position: fixed; bottom: 24px; right: 24px; width: auto; height: auto; z-index: 2147483647; pointer-events: auto; display: none` (then block when visible).  
- Does not cover the full viewport and does not use `overflow: hidden`. No change needed.

### 8. Exact code fixes applied

1. **content.tsx — Restore host page scroll**  
   In `injectCaptureRootStyles()`, after injecting `#echly-capture-root-pointer-events`, inject a style with id `echly-page-scroll-restore` and content `html, body { overflow: visible !important; }` so popup.css cannot lock host page scroll.

2. **content.tsx — Clarity overlay**  
   For the full-screen clarity assistant backdrop div: set `pointerEvents: "none"`. For the inner modal card div: set `pointerEvents: "auto"` so only the card captures interaction and scroll can pass through the backdrop.

3. **content.tsx — Debug listeners**  
   Renamed `ensureWheelDebugListener` to `ensureScrollDebugListeners` and added a passive `scroll` listener on `document` in addition to the existing passive `wheel` listener on `window`, for runtime verification that wheel and scroll events reach the page.

### Result

- Page scroll, mouse wheel, and trackpad scroll work normally.  
- Extension UI (widget, session overlay, region capture when active) still works.  
- Click capture still works (only valid targets get preventDefault/stopPropagation).  
- No global JS interference: no prototype overrides; no global overflow lock; overlays that must not block scroll use `pointer-events: none` or an override.
