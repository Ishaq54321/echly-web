# Extension Session System — Architecture Audit (Internal Summary)

## 1. How sessions start

- **Trigger:** User clicks "Start New Feedback Session" in `WidgetFooter` → `handlers.startSession` in `useCaptureWidget`.
- **Flow:** `startSession` calls `onCreateSession()` (content’s `createSession` → POST `/api/sessions`), then `onActiveSessionChange(session.id)` → `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId })`, then `onSessionModeStart?.()` → `ECHLY_SESSION_MODE_START`.
- **Background:** `ECHLY_SET_ACTIVE_SESSION` sets `activeSessionId`, `globalUIState.sessionId`, `globalUIState.sessionModeActive = true`, `sessionPaused = false`, fetches feedback for the session into `globalUIState.pointers`, persists to storage, and calls `broadcastUIState()`. `ECHLY_SESSION_MODE_START` sets `sessionModeActive = true`, `sessionPaused = false`, persists, and broadcasts again.
- **Content:** Receives `ECHLY_GLOBAL_STATE` → `setGlobalState(state)` → `CaptureWidget` gets `globalSessionModeActive`, `globalSessionPaused`, `pointers` from `globalState`. `useCaptureWidget` effects create capture root and sync session/paused from global state.

## 2. How pause/resume works

- **Pause:** SessionControlPanel **Pause** → `onPause` → `handlers.pauseSession` → `onSessionModePause` → `ECHLY_SESSION_MODE_PAUSE`. If pipeline is active, hook sets `pausePending` and polls until pipeline finishes, then finalizes: `onSessionModePause()`, `setPausePending(false)`. Background sets `sessionPaused = true`, persists, broadcasts.
- **Resume:** **Resume** → `handlers.resumeSession` → `onSessionModeResume` → `ECHLY_SESSION_MODE_RESUME`. Background sets `sessionPaused = false`, persists, broadcasts.

## 3. How feedback tickets are created

- **Session flow:** User clicks element → `handleSessionElementClicked` → crop screenshot, `setPending({ screenshot, context, elementRect })`. Voice or text panel submits → `onComplete(transcript, screenshot, { onSuccess, onError }, context, { sessionMode: true })`. Content’s `handleComplete`: calls structure-feedback then POST `/api/feedback` (or fallback `ECHLY_PROCESS_FEEDBACK`). On success, `onSuccess(ticket)` in the widget runs → `setPointers(prev => [ticket, ...prev])`.
- **Background path:** `ECHLY_PROCESS_FEEDBACK` runs structure-feedback + POST `/api/feedback`, then `globalUIState.pointers = [...globalUIState.pointers, pointer]`, `broadcastUIState()`, and sends `ECHLY_FEEDBACK_CREATED` to all tabs. Content dispatches a CustomEvent for `ECHLY_FEEDBACK_CREATED`; the widget’s pointer list is driven by `pointers` prop from `globalState`, which is updated by `ECHLY_GLOBAL_STATE` (so tray updates when background broadcasts after adding the pointer).

## 4. How tray state is controlled

- **Visibility:** Content `getShouldShowTray(state)` = `visible === true || sessionModeActive === true || sessionPaused === true`. `setHostVisibility(getShouldShowTray(state))` on every global state apply.
- **Expanded/collapsed:** `globalUIState.expanded` from background; widget gets `expanded={globalState.expanded}`, `onExpandRequest` (ECHLY_EXPAND_WIDGET), `onCollapseRequest` (ECHLY_COLLAPSE_WIDGET).
- **Auto-collapse:** In `CaptureWidget`, when `isInCaptureFlow` becomes true, an effect calls `onCollapseRequest?.()` once (`didCollapseRef`) → tray collapses during focus_mode / region_selecting / voice_listening / processing.

## 5. How pointers are synced

- **Source of truth:** Background `globalUIState.pointers`. Updated on `ECHLY_SET_ACTIVE_SESSION` (fetch feedback) and when `ECHLY_PROCESS_FEEDBACK` succeeds (append new pointer); then `broadcastUIState()`.
- **Content:** Message listener receives `ECHLY_GLOBAL_STATE` → `setGlobalState(state)` → `CaptureWidget` gets `pointers={globalState.pointers}`. In `useCaptureWidget`, effect `[extensionMode, pointersProp]`: `pointersPropRef.current = pointersProp`; `setPointers(pointersProp)` with no guard — pointer sync runs whenever `pointersProp` changes so tray should update in real time when background broadcasts.

## 6. Inactivity timers

- **Found:** No explicit session idle/inactivity timeout in `background.ts` or `content.tsx`. `SESSION_WAIT_POLL_MS` (120 ms) in `useCaptureWidget` is only used to poll for pipeline completion on pause/end. No 20–30 s timeout found in code; observed “timeout” may be from tray auto-collapse when entering capture flow or from other UI behavior.
