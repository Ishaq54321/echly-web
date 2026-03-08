# Extension Capture & Session Flow — Runtime Diagnosis

**Read-only diagnostic report.** No code was modified. This document explains why the listed bugs occur and where to fix them.

---

## Product behavior (expected, Loom-like)

1. User captures feedback → feedback is automatically submitted.
2. Widget tray opens with ticket cards.
3. Newly created ticket is **not** expanded.
4. Pause shows only controls (no ticket list in edit mode).
5. Resume Session resumes the last active session.
6. End Session opens the session dashboard page in a new tab.
7. Reload should **never** start the recording overlay.

---

## SECTION 1 — Capture pipeline

### 1.1 Pipeline flow (automatic capture)

```
User capture (voice + optional screenshot)
    → content: handleComplete(transcript, screenshot, callbacks, context, { sessionMode? })
    → getVisibleTextFromScreenshot (OCR)
    → apiFetch POST /api/structure-feedback (transcript + context)
    → if tickets.length === 0: chrome.runtime.sendMessage ECHLY_PROCESS_FEEDBACK (background)
    → else: apiFetch POST /api/feedback per ticket (content)
    → on success: callbacks.onSuccess(ticket)
    → Background (if used): POST structure-feedback, POST /api/feedback, then
       chrome.tabs.sendMessage(all tabs, ECHLY_FEEDBACK_CREATED, { ticket, sessionId })
```

**Relevant files:**

- **content.tsx**  
  - `handleComplete`: lines ~271–519 (structure → feedback or ECHLY_PROCESS_FEEDBACK fallback).  
  - Callbacks `onSuccess` / `onError` passed from the widget; `onSuccess` receives the created ticket.

- **background.ts**  
  - `ECHLY_PROCESS_FEEDBACK` (lines 509–667): validates payload, gets token, POSTs structure-feedback, then POSTs /api/feedback; on success responds with `{ success, ticket }` and broadcasts **ECHLY_FEEDBACK_CREATED** to all tabs.

- **useCaptureWidget.ts**  
  - Session and non-session capture paths call `onComplete(..., { onSuccess, onError })`.  
  - `onSuccess(ticket)` runs: `setPointers(prev => [newTicket, ...prev])`, `setHighlightTicketId(ticket.id)`, `setTimeout(() => setHighlightTicketId(null), 1200)` (lines 608–623, 645–660, 1192–1209).

### 1.2 Who inserts the new ticket into pointers

**The content-script pipeline (handleComplete) does not touch React state.** The widget does:

- **useCaptureWidget.ts**: in each `onSuccess(ticket)` callback passed to `onComplete`, the hook does:
  - `setPointers(prev => [{ id, title, actionSteps, type }, ...prev])`  
  So the **hook** inserts the new ticket at the front of the list. The same happens when feedback is created via **ECHLY_PROCESS_FEEDBACK** in the background: content only dispatches a CustomEvent `ECHLY_FEEDBACK_CREATED`; no component in the extension currently subscribes to that event to call `setPointers` or `setHighlightTicketId`. So tickets created only via the background fallback (e.g. no tickets from structure) are **not** added to the widget list unless the same tab also ran the content path that called `onSuccess`.

---

## SECTION 2 — Ticket insertion and “newest ticket expanded / editable”

### 2.1 setPointers / highlightTicketId / expandedId / editingTicket

- **setPointers**  
  - **useCaptureWidget.ts**: `useState<StructuredFeedback[]>(initialPointers ?? [])` (line 147).  
  - Updated in: `onSuccess` callbacks (session and non-session), `loadSessionWithPointers` effect, `deletePointer`, `saveEdit`, `updatePointer`, `resetSession`, `endSession`, etc.

- **highlightTicketId**  
  - **useCaptureWidget.ts**: `useState<string | null>(null)` (line 160).  
  - Set to the new ticket id in every `onSuccess` path, then cleared after 1200ms via `setTimeout(() => setHighlightTicketId(null), 1200)`.

- **expandedId**  
  - **useCaptureWidget.ts**: `useState<string | null>(null)` (line 150).  
  - Set by `FeedbackItem` via `onExpandChange` (handlers.setExpandedId) when user expands/collapses a card; also set on marker click in session mode; cleared when `globalSessionPaused` becomes true (effect lines 1085–1092).

- **editingId**  
  - **useCaptureWidget.ts**: `useState<string | null>(null)` (line 151).  
  - Used for explicit “edit mode” (e.g. startEditing); not set by the capture success path.

### 2.2 Why the newest ticket becomes expanded / “editable”

- **FeedbackItem.tsx** (lines 43–48):  
  `useEffect` runs when `highlightTicketId` or `ticket.id` changes. If `highlightTicketId === ticket.id`, it calls `setExpanded(true)` and `onExpandChange?.(ticket.id)`.
- So whenever the hook sets `highlightTicketId` to the new ticket id (in `onSuccess`), that card’s local `expanded` becomes true and the card shows the expanded form (title + steps + Save/Cancel). That is the “edit mode” the user sees.
- **Root cause:** The success path intentionally sets `setHighlightTicketId(ticket.id)` for a short highlight. Because `FeedbackItem` treats “highlighted” as “expand this card,” the newest ticket always opens expanded. There is no separate “highlight only, do not expand” behavior.

---

## SECTION 3 — Widget open after capture

### 3.1 What opens the tray (ECHLY_EXPAND_WIDGET / setExpanded(true))

- **Background** is the source of truth for `expanded`: handling **ECHLY_EXPAND_WIDGET** (background.ts line 257) sets `globalUIState.expanded = true` and broadcasts **ECHLY_GLOBAL_STATE**.
- **Content** (content.tsx): in extension mode the widget is controlled: `expanded={globalState.expanded}` and `onExpandRequest` sends **ECHLY_EXPAND_WIDGET** when the user clicks the floating button (lines 240–241, 1243).
- **CaptureWidget.tsx**: `effectiveIsOpen = isControlled ? expanded : state.isOpen` (line 75). So in extension mode the tray is open only when `globalState.expanded === true`.

### 3.2 What triggers the widget to open after capture?

- After capture, the **non–session** path in useCaptureWidget calls `restoreWidget()` (e.g. lines 672–676), which does `setIsOpenState(widgetOpenBeforeCapture)`. In extension mode the panel visibility is **not** driven by `state.isOpen` but by `expanded` (global state). So `restoreWidget()` does **not** open the tray in the extension.
- There is **no** call to `onExpandRequest()` (and thus no **ECHLY_EXPAND_WIDGET**) in any capture success path. So the tray after capture opens only if it was already open (`globalState.expanded` was already true) or when the user pauses (see Section 4). So “widget tray opens after capture” is **not** guaranteed by current code; it depends on prior expanded state or on pausing.

---

## SECTION 4 — Pause session flow (why last ticket becomes editable)

### 4.1 ECHLY_SESSION_MODE_PAUSE flow

1. User clicks Pause in **SessionOverlay** or session controls.
2. **CaptureWidget.tsx** (lines 185–188): `onSessionPause` calls `handlers.pauseSession()` and `onExpandRequest?.()`.
3. **useCaptureWidget.ts** `pauseSession` (lines 955–1001): if pipeline is active it sets `setPausePending(true)` and waits for `pipelineActiveRef.current` to become false, then calls `onSessionModePause?.()` (and clears pausePending). Otherwise it calls `onSessionModePause?.()` immediately.
4. **content.tsx** (line 1259): `onSessionModePause` sends **ECHLY_SESSION_MODE_PAUSE**.
5. **background.ts** (lines 321–328): sets `globalUIState.sessionModeActive = true`, `globalUIState.sessionPaused = true`, persists, broadcasts **ECHLY_GLOBAL_STATE**.

### 4.2 UI state changes on pause

- Content sends **ECHLY_EXPAND_WIDGET** when Pause is clicked, so the tray opens and the ticket list is visible.
- **useCaptureWidget.ts** (lines 1085–1092): when `globalSessionPaused` becomes true, an effect runs `setExpandedId(null)`. It does **not** clear `highlightTicketId`.

### 4.3 Why the “last” ticket appears in edit mode after pause

- If the user captured recently, `highlightTicketId` may still be set to that ticket id (within the 1200ms window) when they click Pause. When the tray opens, **FeedbackItem**’s effect sees `highlightTicketId === ticket.id` and sets `setExpanded(true)` for that card.
- Even after 1200ms, each **FeedbackItem** keeps its own local `expanded` state. If the user had expanded a card before pausing, that card stays expanded when the panel is shown again. So the “last” or most recently interacted ticket can still be expanded (edit mode) when the pause panel opens.
- **Root cause:** (1) `highlightTicketId` is not cleared on pause, so a recently created ticket can still be expanded when the tray opens; (2) FeedbackItem expansion is local state and is not reset when pausing, so previously expanded cards remain expanded.

---

## SECTION 5 — Resume session flow (why Resume sometimes cannot be clicked)

### 5.1 Resume flow

1. User clicks “Resume Session” in the widget footer.
2. **CaptureWidget.tsx** (lines 148–151): `handleResumeActiveSession` runs only if `storedSessionId` is set; it calls `onResumeSessionSelect?.(storedSessionId, { enterCaptureImmediately: true })`.
3. **storedSessionId** is set in an effect (lines 77–88) that runs once on mount: it sends **ECHLY_GET_ACTIVE_SESSION** and sets `setStoredSessionId(response.sessionId)` when `response?.sessionId` is truthy.
4. **content.tsx** `onResumeSessionSelect` (lines 677–717): sends **ECHLY_SET_ACTIVE_SESSION**, `setSessionIdOverride(sessionId)`, fetches `/api/feedback?sessionId=...`, sets `setLoadSessionWithPointers({ sessionId, pointers })`, sends **ECHLY_SESSION_MODE_START**, then fetches `/api/sessions/${sessionId}` and, if `session?.url` exists, sends **ECHLY_OPEN_TAB** with that URL.

### 5.2 Why Resume is sometimes disabled or not clickable

- **WidgetFooter.tsx** (lines 27–28): `resumeDisabled = effectivelyDisabled || !hasActiveSession || !onResumeSession`. So Resume is disabled when:
  - `effectivelyDisabled` (not idle or captureDisabled), or
  - `!hasActiveSession` (i.e. `!hasStoredSession`), or
  - `!onResumeSession` (e.g. not in extension mode or `showResumeButton` false).
- **CaptureWidget.tsx**: `showResumeButton = hasStoredSession` (line 99); `hasStoredSession = Boolean(storedSessionId)` (line 91). So if **ECHLY_GET_ACTIVE_SESSION** returns `sessionId: null` (e.g. background not yet restored from storage, or session was ended), `storedSessionId` stays null and the Resume button is either hidden or disabled.
- **Race at load:** The effect that requests **ECHLY_GET_ACTIVE_SESSION** runs once on mount. Background restores `activeSessionId` asynchronously from `chrome.storage.local.get`. If the widget renders before the background has responded (or before storage is restored), the callback can receive `sessionId: null`, so `storedSessionId` is never set and Resume stays disabled or not shown.
- **SessionControlPanel** (Resume in the paused bar): `disabled={pausePending}` (line 97). So while the pause transition is in progress (`pausePending === true`), the “Resume Feedback Session” button is disabled.

**Root cause:** (1) Single run of **ECHLY_GET_ACTIVE_SESSION** on mount and async background storage restore can leave `storedSessionId` null; (2) Resume is explicitly disabled when `pausePending` is true.

---

## SECTION 6 — Page reload overlay (why recording overlay appears after reload)

### 6.1 Condition that shows the overlay

- **CaptureLayer.tsx** (lines 75–76):  
  `showSessionOverlay = sessionMode && extensionMode && !!globalSessionModeActive && !!sessionIdProp`.
- Session overlay is shown when the widget is in session mode, in extension mode, and global state has an active session id.

### 6.2 Why it appears after reload

- **background.ts** (lines 55–68): On load, `chrome.storage.local.get(["activeSessionId", "sessionModeActive", "sessionPaused"], ...)` restores `activeSessionId`, `globalUIState.sessionId`, `globalUIState.sessionModeActive`, and `globalUIState.sessionPaused`, then calls `broadcastUIState()`. So every tab gets **ECHLY_GLOBAL_STATE** with the last session state.
- **useCaptureWidget.ts** (lines 1057–1066): When `globalSessionModeActive === true`, an effect sets `setSessionMode(true)`, `setSessionPaused(globalSessionPaused ?? false)`, and calls `createCaptureRoot()` if no root exists. That mounts **CaptureLayer** and **SessionOverlay**.
- So after a full page reload, if the background had persisted `sessionModeActive: true` (and session id), the content script re-injects, gets **ECHLY_GLOBAL_STATE** with session active, and the widget creates the capture root and shows the session overlay. There is no “reload = do not restore overlay” rule.

**Root cause:** Session state is persisted and restored on background load; content and widget trust that state and show the session overlay. Reload does not clear or special-case session mode, so the recording overlay can reappear after reload.

---

## SECTION 7 — End session flow (why dashboard page does not open)

### 7.1 ECHLY_SESSION_MODE_END flow

1. User clicks End in session controls.
2. **CaptureWidget.tsx** (lines 193–197): `onSessionEnd` calls `handlers.endSession(callback)` where the callback does `setShowCommandScreen(true)` and `onSessionEndCallback?.()`.
3. **useCaptureWidget.ts** `endSession` (lines 1013–1048): if pipeline is active it sets `setEndPending(true)` and waits for the pipeline to finish, then runs `finalizeEnd()`; otherwise runs `finalizeEnd()` immediately. `finalizeEnd` clears pointers, calls `onSessionModeEnd?.()`, then `afterEnd?.()`.
4. **content.tsx** (line 1261): `onSessionModeEnd` sends **ECHLY_SESSION_MODE_END**.
5. **background.ts** (lines 343–356): sets `activeSessionId = null`, `globalUIState.sessionModeActive/sessionPaused/sessionId = null`, persists, broadcasts.

### 7.2 What is missing

- **No navigation or tab open:** The End Session path never fetches the session dashboard URL and never sends **ECHLY_OPEN_TAB**. By contrast, **onResumeSessionSelect** (content.tsx 700–712) fetches `GET /api/sessions/${sessionId}` and, if `sessionData?.session?.url` exists, sends **ECHLY_OPEN_TAB** with that URL. The End Session handler has no equivalent step.

**Root cause:** End Session only updates background and local UI state; there is no code that retrieves the session URL (e.g. from `GET /api/sessions/:id`) and opens it in a new tab.

---

## SECTION 8 — Session page URL

- **Backend:** Session dashboard URL is returned by the app as `session.url` (e.g. from **GET /api/sessions/:id**). Content uses it in **onResumeSessionSelect** (content.tsx 700–712): `const sessionRes = await apiFetch(\`/api/sessions/${sessionId}\`);` then `sessionData?.session?.url` and **ECHLY_OPEN_TAB**.
- **background.ts** (lines 299–306): **ECHLY_OPEN_TAB** with `request.url` calls `chrome.tabs.create({ url })`.
- The extension can get the session dashboard URL by calling the same API (`GET /api/sessions/:sessionId`) before or after ending the session (while it still has the session id) and then sending **ECHLY_OPEN_TAB** with `session.url`.

---

## SECTION 9 — Widget UI state machine

### 9.1 States

| State               | Description |
|---------------------|------------|
| command screen      | Footer shows Start New / Resume / Previous (no tickets, idle). |
| session active      | Session started or resumed; overlay active; capture root exists. |
| session paused      | Overlay inactive; session bar with Pause/Resume/End; tray can be open. |
| capture mode        | focus_mode, region_selecting, voice_listening, or processing (non-session or session). |
| ticket list         | Panel open; list of tickets; no capture flow. |
| ticket edit mode    | A FeedbackItem is expanded (local `expanded === true`), showing title/steps form. |

### 9.2 Transitions (simplified)

- **Command screen → session active:** Start New or Resume → create/resume session, set pointers (if resume), **ECHLY_SET_ACTIVE_SESSION**, **ECHLY_SESSION_MODE_START** → globalSessionModeActive true → effect sets sessionMode and createCaptureRoot → SessionOverlay shows.
- **Session active → session paused:** Pause → **ECHLY_SESSION_MODE_PAUSE** + **ECHLY_EXPAND_WIDGET** → globalSessionPaused true → overlay hidden, panel open with session bar.
- **Session paused → session active:** Resume → **ECHLY_SESSION_MODE_RESUME** → overlay shown again.
- **Session active/paused → ticket list / ticket edit:** Panel open (expanded) and pointers set; edit mode is per-card expanded state driven by highlightTicketId or user expand.
- **Capture (any) → ticket list:** onSuccess adds ticket, sets highlightTicketId; if tray is open, new ticket appears and can be expanded (see Sections 2 and 3).
- **End session:** **ECHLY_SESSION_MODE_END** → sessionModeActive false → effect clears session mode and removeCaptureRoot; callback sets showCommandScreen true. No URL open.

---

## SECTION 10 — Message timing and race conditions

### 10.1 ECHLY_RESET_WIDGET vs ECHLY_GLOBAL_STATE

- When visibility is toggled on, **background** (extension-runtime-architecture.md): sends **ECHLY_RESET_WIDGET** to all tabs, then broadcasts **ECHLY_GLOBAL_STATE**. Content handles **ECHLY_RESET_WIDGET** by dispatching a CustomEvent that clears `loadSessionWithPointers`, sets `expanded: false`, and increments `widgetResetKey` (remount). Content handles **ECHLY_GLOBAL_STATE** by updating host display and React `globalState`.
- If **ECHLY_GLOBAL_STATE** is processed before **ECHLY_RESET_WIDGET**, React can briefly show old state (e.g. session, expanded) before the reset remounts the widget. So message order can cause one frame of inconsistent UI.

### 10.2 ECHLY_FEEDBACK_CREATED vs local onSuccess

- When feedback is created in the **content** path, `onSuccess` runs in the same tab and updates pointers/highlight immediately. When feedback is created in the **background** (ECHLY_PROCESS_FEEDBACK), the background broadcasts **ECHLY_FEEDBACK_CREATED**; content only dispatches a CustomEvent. The widget does not listen for **ECHLY_FEEDBACK_CREATED** to add or highlight a ticket, so other tabs (or the same tab if it used the fallback) do not get the new ticket in the list. So there is no race between **ECHLY_FEEDBACK_CREATED** and local onSuccess for “who adds the ticket” in the tab that submitted; in other tabs, the ticket is never added by current code.

### 10.3 Summary

- **ECHLY_RESET_WIDGET** and **ECHLY_GLOBAL_STATE** ordering can cause a brief wrong UI state if global state is applied before reset.
- **ECHLY_FEEDBACK_CREATED** is not used by the widget to update pointers/highlight; only the tab that called `onComplete` and got `onSuccess` updates the list and highlight.

---

## SECTION 11 — Root cause summary (per bug)

| # | Bug | File(s) | Function / location | Exact condition |
|---|-----|---------|----------------------|------------------|
| 1 | Resume Session sometimes cannot be clicked | CaptureWidget.tsx, WidgetFooter.tsx, background.ts | storedSessionId effect (CaptureWidget 77–88); resumeDisabled (WidgetFooter 27); storage restore (background 55–68) | (1) ECHLY_GET_ACTIVE_SESSION runs once on mount; background may not have restored activeSessionId yet → response.sessionId null → storedSessionId never set → Resume disabled/hidden. (2) SessionControlPanel Resume disabled when pausePending is true. |
| 2 | After reload, recording overlay sometimes appears | background.ts, useCaptureWidget.ts, CaptureLayer.tsx | chrome.storage.local.get on load (background 55–68); sync effect (useCaptureWidget 1057–1066); showSessionOverlay (CaptureLayer 75–76) | Background restores sessionModeActive and sessionId from storage and broadcasts; content sets sessionMode and createCaptureRoot → showSessionOverlay true. No “reload = do not show overlay” logic. |
| 3 | After capture, newest ticket opens in edit mode | useCaptureWidget.ts, FeedbackItem.tsx | onSuccess callbacks (e.g. 622–623, 659–660); useEffect (FeedbackItem 43–48) | onSuccess sets setHighlightTicketId(ticket.id). FeedbackItem expands when highlightTicketId === ticket.id → setExpanded(true). So new ticket is always expanded (edit form visible). |
| 4 | Pause opens last ticket in edit mode | CaptureWidget.tsx, useCaptureWidget.ts, FeedbackItem.tsx | onSessionPause (CaptureWidget 187); pause effect (useCaptureWidget 1085–1092); FeedbackItem effect | Pause sends ECHLY_EXPAND_WIDGET (tray opens). highlightTicketId is not cleared on pause; if still set to last created ticket (within 1200ms) or user had expanded that card, FeedbackItem keeps it expanded. |
| 5 | End Session does not open session dashboard | content.tsx, useCaptureWidget.ts | onSessionModeEnd (content 1261); endSession finalizeEnd (useCaptureWidget 1017–1027) | End path only sends ECHLY_SESSION_MODE_END and runs local callback. No GET /api/sessions/:id, no ECHLY_OPEN_TAB(session.url). |
| 6 | Extension sometimes continues previous UI state instead of resetting | background.ts, content.tsx, useCaptureWidget.ts | Storage restore + broadcast (background 55–68); ECHLY_GLOBAL_STATE handler (content); session sync effect (useCaptureWidget 1057–1083) | Same as #2: persisted session state is restored and pushed to all tabs; widget applies it and shows session overlay / session UI. No reset on new tab or reload. |

---

## SECTION 12 — Diagrams and recommended minimal fixes

### 12.1 Capture pipeline (high level)

```
[User capture]
      |
      v
[content: handleComplete]
      |
      +-- structure-feedback (content or background)
      |
      +-- POST /api/feedback (content) OR ECHLY_PROCESS_FEEDBACK (background)
      |
      v
[onSuccess(ticket) in useCaptureWidget]
      |
      +-- setPointers(prev => [ticket, ...prev])
      +-- setHighlightTicketId(ticket.id) --> FeedbackItem expands
      +-- setTimeout(..., 1200) --> setHighlightTicketId(null)
      |
      (Background path only: ECHLY_FEEDBACK_CREATED to all tabs; no widget listener)
```

### 12.2 Session lifecycle (high level)

```
[Start/Resume]
  -> ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_START
  -> background: sessionModeActive=true, sessionPaused=false, persist, broadcast
  -> content: loadSessionWithPointers (resume), createCaptureRoot
  -> SessionOverlay shown

[Pause]
  -> ECHLY_SESSION_MODE_PAUSE + ECHLY_EXPAND_WIDGET
  -> background: sessionPaused=true, persist, broadcast
  -> setExpandedId(null) (highlightTicketId not cleared)
  -> Panel with ticket list + session bar

[Resume]
  -> ECHLY_SESSION_MODE_RESUME
  -> SessionOverlay shown again

[End]
  -> ECHLY_SESSION_MODE_END
  -> background: clear session, persist, broadcast
  -> removeCaptureRoot, setPointers([])
  -> No ECHLY_OPEN_TAB(session.url)
```

### 12.3 Widget UI state machine (simplified)

```
                    Start/Resume
  command screen ----------------> session active (overlay)
        ^                                |
        |                                | Pause
        |                                v
        |                         session paused (panel + bar)
        |                                |
        | End                            | Resume
        |                                v
        +--------------------------------+
```

### 12.4 Message timing (reset vs global state)

```
Background (visibility on):
  1. ECHLY_RESET_WIDGET -> all tabs
  2. broadcastUIState() -> ECHLY_GLOBAL_STATE -> all tabs

Content:
  - If (2) applied before (1): one frame with old session/expanded, then reset remount.
  - If (1) applied first: reset then global state is correct.
```

### 12.5 Recommended minimal fixes (conceptual)

1. **Resume cannot be clicked**  
   - Re-query **ECHLY_GET_ACTIVE_SESSION** when the widget becomes visible (e.g. when `globalState.visible` turns true) and when global state receives a sessionId, so `storedSessionId` stays in sync. Optionally disable Resume only when `pausePending` is true in the session bar, not for the footer Resume.

2. **Overlay after reload**  
   - Do not restore “session mode active” on reload: e.g. on background load, set `sessionModeActive` (and optionally `sessionPaused`) to false while keeping `activeSessionId` for the Resume button only; or have content/widget ignore restored sessionModeActive when the tab has just loaded (e.g. no loadSessionWithPointers and no recent user action).

3. **Newest ticket opens in edit mode**  
   - Do not expand the new ticket: either (a) stop setting `highlightTicketId` for the newly created ticket (only add to list), or (b) in FeedbackItem, interpret “highlight” as visual highlight only (e.g. class) and do not set `expanded` to true when `highlightTicketId === ticket.id`, or (c) add a “highlight only, do not expand” flag and use it for post-capture highlight.

4. **Pause opens last ticket in edit mode**  
   - On pause (or when opening the panel on pause), clear `highlightTicketId` (e.g. in the same effect that sets `setExpandedId(null)`). Optionally collapse all cards when entering “paused” panel (e.g. parent-controlled expandedId and set all to collapsed).

5. **End Session does not open dashboard**  
   - Before or when ending the session, read the current session id (e.g. from content’s effectiveSessionId or from the widget’s sessionId prop). Call `GET /api/sessions/:sessionId`, and if `session.url` is present, send **ECHLY_OPEN_TAB** with that URL (same as in onResumeSessionSelect). Do this in the End Session path (e.g. in content’s onSessionModeEnd callback or in the widget’s endSession callback that content provides).

6. **Previous UI state continues**  
   - Same as #2: avoid restoring session mode UI (overlay) from storage on load; keep only enough state to show “Resume” and to load session when user explicitly resumes.

---

**End of report.**
