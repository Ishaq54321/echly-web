# Recording UI Reset — Debug Report (Read-Only)

**Bug:** After clicking Comment → "Describe the feedback" → Describe, the recording UI flashes for ~0.5s and disappears. Audio recording and session stay active; only the UI is hidden.

**Conclusion:** The recording UI is hidden because `sessionFeedbackPending` is cleared by the "Extension: sync global pointers" effect when the background broadcasts `ECHLY_GLOBAL_STATE` after `START_RECORDING`. The broadcast delivers a **cloned** state (new `pointers` reference), so the effect runs and calls `setSessionFeedbackPending(null)`, which unmounts `SessionFeedbackPopup` (the panel that contains the recording UI).

---

## STEP 1 — Trace Describe Flow

| Item | Value |
|------|--------|
| **Handler** | `handleSessionStartVoice` |
| **File** | `components/CaptureWidget/hooks/useCaptureWidget.ts` |
| **Lines** | 1280–1295 |
| **Trigger** | "Describe" button in the "Describe the feedback" UI (session flow). |

**What it does:**

- Reads `sessionFeedbackPending` (screenshot + context).
- Creates a new `Recording`, appends to `recordings`, sets `activeRecordingId`.
- Calls `startListening()` (no direct `setState` in this handler).

**`startListening` (recording start):**

| Item | Value |
|------|--------|
| **Function** | `startListening` |
| **File** | `components/CaptureWidget/hooks/useCaptureWidget.ts` |
| **Lines** | 406–431 |
| **State set** | `setState("voice_listening")` at **line 419** (after `getUserMedia` and `recognitionRef.current?.start()`). |

So: Describe click → `handleSessionStartVoice` → `startListening()` → `setState("voice_listening")`. The recording UI is shown when `state === "voice_listening"` **and** `sessionFeedbackPending != null`, because the popup is only mounted when `sessionFeedbackPending` is set (see Step 5 / overlay mounting).

---

## STEP 2 — State Machine

**State storage:** `const [state, setState] = useState<CaptureState>("idle");` — **line 144**, same file.

**Possible states (from `types.ts`):**  
`idle` | `focus_mode` | `region_selecting` | `voice_listening` | `processing` | `success` | `cancelled` | `error`

**All `setState(...)` call sites:**

| Location | Line(s) | Previous state (context) | Next state | Condition |
|----------|--------|---------------------------|------------|-----------|
| `restoreWidget` | 410 | any | `idle` | Restore after capture flow |
| `recognition.onend` (unexpected) | 519–521 | `voice_listening` | `idle` | `!manualStopRef.current` and state was voice_listening |
| `recognition.onend` (manual stop) | 528–530 | any (not processing/success) | `idle` | After manual stop |
| `startListening` | 419 | (before start) | `voice_listening` | After getUserMedia + recognition.start() |
| `startListening` catch | 569 | — | `error` | Microphone permission denied |
| `finishListening` (no active id) | 585 | — | `idle` | No activeRecordingId |
| `finishListening` (transcript too short) | 593 | — | `idle` | Transcript length < 5 |
| `finishListening` (session feedback path) | 620 | — | `idle` | After setting session feedback state |
| `finishListening` (extension non-session) | 659, 696, 701 | — | `processing` then `idle` or `voice_listening` | Pipeline success / error |
| `finishListening` (web path) | 730, 740 | — | `voice_listening` (on error) or `cancelled` | Error path |
| `discardListening` | 740 | — | `cancelled` | User discard |
| `resetSession` | 772 | — | `idle` | Reset session |
| `handleRegionSelectStart` | 921 | — | `region_selecting` | Start region select |
| `handleCancelCapture` | 943 | — | `cancelled` | Cancel capture |
| `handleSessionFeedbackSubmit` | 1230 | — | `idle` | After submitting text feedback |
| `handleAddFeedback` | 1304 | — | `focus_mode` | Add feedback click (extension returns early) |
| `handleAddFeedback` catch | 1328 | — | `error` | Capture failed |

None of these are triggered by the Describe click in a way that would reset the UI **immediately** after entering `voice_listening`. The UI disappears because **`sessionFeedbackPending`** is cleared, not because `state` is set back to `idle` (see Steps 3 and 7).

---

## STEP 3 — UI Reset Triggers

**Calls that clear or hide the recording UI:**

1. **`setSessionFeedbackPending(null)`**  
   Clearing this unmounts the "Describe the feedback" / recording popup in `SessionOverlay` (`sessionFeedbackPending && <SessionFeedbackPopup ... />`). So the **recording UI is hidden** whenever this is called while the user is in the describe/recording flow.

2. **`setState("idle")`**  
   Various places (see table above); not the direct cause of the flash, because state remains `voice_listening` and recording continues.

3. **`removeCaptureRoot()`**  
   Would remove the whole overlay; not invoked in this flow (extension mode + session active; see `removeCaptureRoot` guard).

4. **`setSessionMode(false)`**  
   Only in effects when `globalSessionModeActive === false`; not triggered by Describe.

5. **`setWidgetResetKey`**  
   Only on `ECHLY_RESET_WIDGET` (e.g. visibility toggle); not sent when user clicks Describe.

**Relevant `setSessionFeedbackPending(null)` locations:**

| File | Line(s) | Condition / context |
|------|--------|----------------------|
| useCaptureWidget.ts | 363 | Inside `createCaptureRoot()` when creating new root |
| useCaptureWidget.ts | 616 | `finishListening` session path |
| useCaptureWidget.ts | 968 | `endSession` finalize |
| useCaptureWidget.ts | 1041 | `startSession` |
| useCaptureWidget.ts | **1086** | **Effect [globalSessionModeActive, ...]: when `globalSessionModeActive === true`** |
| useCaptureWidget.ts | 1101 | Same effect when `globalSessionModeActive === false` |
| useCaptureWidget.ts | 1116 | Safety effect when `!globalSessionModeActive` |
| useCaptureWidget.ts | 1143 | Visibility effect (tab visible, recreate root) |
| useCaptureWidget.ts | **1155** | **Effect [extensionMode, pointersProp]: sync pointers from background** ← **ROOT CAUSE** |
| useCaptureWidget.ts | 1162 | loadSessionWithPointers effect |
| useCaptureWidget.ts | 1169 | handleSessionElementClicked (when pending but no root) |
| useCaptureWidget.ts | 1199 | handleSessionFeedbackSubmit |
| useCaptureWidget.ts | 1228 | handleSessionFeedbackSubmit (text submit path) |
| useCaptureWidget.ts | 1276 | handleSessionFeedbackCancel |

The one that runs **right after** the user clicks Describe and recording starts is the effect at **1152–1156** that depends on **`pointersProp`** (see Steps 4 and 7).

---

## STEP 4 — Global State Effects

**Effects that depend on `globalSessionModeActive` / `globalSessionPaused` / `extensionMode` / visibility:**

| Lines | Deps | Behavior |
|-------|------|----------|
| 1069–1074 | `[globalSessionModeActive, createCaptureRoot]` | If `globalSessionModeActive === true`: `setSessionMode(true)`, `createCaptureRoot()`. Does **not** clear `sessionFeedbackPending`. |
| 1080–1105 | `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot, removeCaptureRoot]` | Sync from global: if active, set session mode/paused, **setSessionFeedbackPending(null)**, ensure root; if inactive, clear all and `removeCaptureRoot()`. |
| 1108–1120 | `[extensionMode, globalSessionModeActive, removeCaptureRoot]` | If `!globalSessionModeActive`: clear session state and `removeCaptureRoot()`. |
| 1136–1149 | `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot]` | Visibility: when tab visible and global active and no root, recreate root and **setSessionFeedbackPending(null)**. |

**Effect that runs immediately after recording starts (Describe flow):**

- **268–278:** When `state` enters a capture flow state (e.g. `voice_listening`), `onRecordingChange(true)` is called. That triggers **content → START_RECORDING → background → broadcastUIState()**.
- **1152–1156:** Effect with deps **`[extensionMode, pointersProp]`**. When the content script receives `ECHLY_GLOBAL_STATE` after the broadcast, it calls `setGlobalState(s)`. The message payload is **structured-cloned**, so `s.pointers` is a **new array reference**. The widget’s `pointersProp` therefore changes reference, this effect runs, and it calls **`setSessionFeedbackPending(null)`**. So the effect that hides the recording UI is the **pointers sync** effect, not the global-session effects above (those don’t re-run from a broadcast that only updates `isRecording` unless their other deps change).

---

## STEP 5 — Overlay Mounting

**`createCaptureRoot()`**

- **Defined:** useCaptureWidget.ts, 349–368.
- **Called from:**
  - 1072: effect when `globalSessionModeActive === true`.
  - 1089: effect when global active and `!captureRootRef.current`.
  - 1145: visibility effect (tab visible, global active, no root).
  - 1303: `handleAddFeedback` (Comment / Add feedback).

**`removeCaptureRoot()`**

- **Defined:** useCaptureWidget.ts, 390–407. Early-return when `extensionMode && globalSessionModeActive !== false`.
- **Called from:** 570 (startListening catch), 683, 702, 723, 741, 944, 1104, 1119.

**Recording UI visibility:**

- The recording UI lives inside **SessionFeedbackPopup**, which is rendered in **SessionOverlay** (SessionOverlay.tsx, 173–181) as:
  - `{ sessionFeedbackPending && ( <SessionFeedbackPopup ... isVoiceListening={state === "voice_listening"} /> ) }`
- So the **popup (and thus the recording UI) is mounted only while `sessionFeedbackPending` is non-null**. The overlay root is **not** removed in this bug; the popup unmounts because `sessionFeedbackPending` is set to `null` by the effect at 1152–1156.

---

## STEP 6 — Widget Remount

- **`setWidgetResetKey`** is used in **echly-extension/src/content.tsx** (lines 82, 131). It is only updated in the **ECHLY_RESET_WIDGET** listener (131), not when starting recording or when receiving `ECHLY_GLOBAL_STATE` after `START_RECORDING`.
- **CaptureWidget** is rendered with `key={widgetResetKey}` (content.tsx, 1217), so the widget remounts only when the reset key changes (e.g. visibility toggle). Not the cause of the recording UI disappearing in the Describe flow.

---

## STEP 7 — Event Timeline

Approximate sequence for: **Click Comment → "Describe the feedback" appears → Click Describe.**

| T+ | Event |
|----|--------|
| T+0 ms | User clicks Describe. |
| T+0 ms | `handleSessionStartVoice` runs: creates recording, `setActiveRecordingId`, `startListening()`. |
| T+0 ms | `startListening()` starts: `getUserMedia`, AudioContext, then `recognitionRef.current?.start()`, then **setState("voice_listening")** (419). |
| T+~10–50 ms | React commits; widget re-renders; recording UI is visible (`sessionFeedbackPending` set, `state === "voice_listening"`). |
| T+~10–50 ms | Effect 268–278 runs (state in CAPTURE_FLOW_STATES): **onRecordingChange(true)**. |
| T+~20–60 ms | Content sends **START_RECORDING** to background. |
| T+~30–80 ms | Background sets `globalUIState.isRecording = true`, calls **broadcastUIState()** (background.ts 459–466). |
| T+~40–100 ms | Content receives **ECHLY_GLOBAL_STATE**; handler calls **setGlobalState(s)**. Message is **structured-cloned**, so `s` and `s.pointers` are new references. |
| T+~50–120 ms | Content re-renders; CaptureWidget gets **pointersProp = globalState.pointers** (new array reference). |
| T+~50–120 ms | useCaptureWidget effect **1152–1156** runs (dependency **pointersProp** changed by reference). It runs **setSessionFeedbackPending(null)**. |
| T+~60–130 ms | Widget re-renders; SessionOverlay’s `sessionFeedbackPending` is null → **SessionFeedbackPopup unmounts** → recording UI disappears. Audio/session continue (state still `voice_listening`, recognition still running). |

**Exact line that hides the recording UI:** **useCaptureWidget.ts line 1155**: `setSessionFeedbackPending(null)` inside the effect at 1151–1156, which runs when `pointersProp` changes (new reference from the cloned `ECHLY_GLOBAL_STATE` after `START_RECORDING`).

---

## STEP 8 — Root Cause

| Field | Value |
|--------|--------|
| **File** | `components/CaptureWidget/hooks/useCaptureWidget.ts` |
| **Function** | Effect (anonymous) in `useCaptureWidget` |
| **Line** | **1155** (`setSessionFeedbackPending(null)`) |
| **Condition that hides the recording UI** | Effect dependency **`pointersProp`** gets a **new reference** when the content script applies `ECHLY_GLOBAL_STATE` from the broadcast that follows **START_RECORDING**. Chrome message passing uses structured cloning, so every broadcast delivers a new `state` and a new `pointers` array. The effect is intended to sync pointers from the background and clear any pending session feedback so the tray is consistent across tabs; but in this flow it runs right after the user has clicked Describe and entered voice recording, so clearing `sessionFeedbackPending` unmounts the only component that shows the recording UI (`SessionFeedbackPopup`), while `state` remains `voice_listening` and recording continues in the background. |

**Summary:** The recording UI is hidden because the "Extension: sync global pointers" effect (1151–1156) runs when `pointersProp` changes by reference (due to the post–START_RECORDING broadcast) and unconditionally clears `sessionFeedbackPending`, which unmounts the describe/recording popup. No code change was made in this report; this is a read-only debug document.
