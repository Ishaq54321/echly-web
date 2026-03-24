# Voice Capture UX + State Flow Audit

## Scope

This audit traces the voice capture UX from:

`Start Recording -> Speaking -> Finish Click -> Processing`

Analyzed files:
- `lib/capture-engine/core/hooks/useCaptureWidget.ts`
- `lib/capture-engine/core/CaptureWidget.tsx`
- `lib/capture-engine/core/CaptureLayer.tsx`
- `components/CaptureWidget/SessionOverlay.tsx`
- `components/CaptureWidget/VoiceCapturePanel.tsx`
- `components/ChatGPTWaveform.tsx`
- `echly-extension/src/content.tsx` (for `onComplete` pipeline behavior)

No code changes were made.

---

## 1) Entry Point: Where Voice Capture Starts

### Primary trigger path (session mode, voice)

1. User clicks an element in active session overlay.
2. `handleSessionElementClicked()` sets `sessionFeedbackPending`.
3. `SessionOverlay` effect auto-starts voice when `captureMode === "voice"`:
   - `onRecordVoice()` -> `handleSessionStartVoice()`
4. `handleSessionStartVoice()` creates a `Recording`, sets `activeRecordingId`, then calls `startListening()`.
5. `startListening()` requests mic, creates `MediaRecorder`, starts recording, and sets state to `"voice_listening"`.

### Other voice entry path (non-session capture)

- `handleAddFeedback()` or `handleRegionCaptured()` -> create recording -> `startListening()`.

---

## 2) State Model (Critical)

## A. Core capture state machine (`state: CaptureState`)

Possible values:
- `idle`
- `focus_mode`
- `region_selecting`
- `voice_listening`
- `processing`
- `success`
- `cancelled`
- `error`

### `state` set locations

- `startCapture()`, `handleAddFeedback()` -> `focus_mode`
- `handleRegionSelectStart()` -> `region_selecting`
- `startListening()` -> `voice_listening`
- `finishListening()`:
  - non-session branch -> `processing`
  - session branch -> `idle` (after transcript, before AI pipeline returns)
  - error branches -> mostly `idle`
- `discardListening()` -> `cancelled`
- permission/mic failure -> `error`

### `state` read locations / UI dependencies

- `VoiceCapturePanel` listening label:
  - `isListening={state === "voice_listening"}`
  - renders `"Listening..."` vs `"Paused"`
- `CaptureLayer` overlay behavior:
  - session overlay visibility independent of `state` (depends on session mode + session id)
  - region/focus overlays depend on `state`
- audio analyzer lifecycle:
  - effect in hook runs only while `state === "voice_listening"`
  - leaving this state stops tracks, closes `AudioContext`, clears analyser

---

## B. Session voice UI state (`sessionFeedbackPending`)

Type: screenshot/context payload or `null`.

### Set locations
- `handleSessionElementClicked()` -> set pending capture payload
- cleared in:
  - `handleSessionFeedbackSubmit()`
  - `handleSessionFeedbackCancel()`
  - session voice flow in `finishListening()` (session branch)

### Read locations / UI dependencies
- `SessionOverlay`:
  - `sessionFeedbackPending && captureMode === "voice"` -> render `VoiceCapturePanel`
  - if null -> voice panel unmounts
- click capture/highlighter enablement also depends on pending being null

---

## C. Processing flags outside `state`

- `pipelineActiveRef` (ref): true while `onComplete` pipeline is running in async callback mode
- `sessionFeedbackSaving` (state): set true in session text/voice submit paths, set false on callbacks
- `isProcessingFeedback` + `feedbackJobs` in extension (`content.tsx`):
  - `handleComplete()` sets these around `processFeedbackPipeline()`
  - used to show processing cards in sidebar/tray

Important: these are not surfaced as an explicit in-overlay voice "processing" state.

---

## 3) Finish Button Flow (Most Important)

### Click handler wiring

- `VoiceCapturePanel` Finish button -> `onFinish`
- `SessionOverlay` passes `onDoneVoice`
- `CaptureLayer` wires `onSessionDoneVoice={handlers.finishListening}`
- final handler: `finishListening()`

### Exact execution path (session voice mode)

1. User clicks **Finish**
2. `finishListening()` runs:
   - sets `recordingActiveRef.current = false`
   - haptic + click sound
   - gets `mediaRecorderRef.current`
   - installs `mediaRecorder.onstop = async () => { ... }`
   - calls `mediaRecorder.stop()`
3. `onstop` callback runs:
   - creates `audioFile` from chunks
   - starts transcription API call: `POST /api/transcribe-audio`
4. If transcript valid:
   - fetches active recording by `activeId`
   - updates recording transcript
5. Session branch executes:
   - creates placeholder marker (`Saving feedback...`)
   - `setPending(null)` (voice panel unmount)
   - `setSessionFeedbackSaving(true)`
   - removes active recording + sets `activeRecordingId(null)`
   - `setState("idle")`
   - sets `pipelineActiveRef.current = true`
   - calls `onComplete(...)` with callback object (not awaited)
6. `onComplete` in extension (`handleComplete()`):
   - creates feedback job (`status: "processing"`)
   - sets `isProcessingFeedback(true)`
   - runs feedback pipeline
   - on success: removes job, calls `callbacks.onSuccess`
   - on failure: marks job failed, calls `callbacks.onError`
7. Hook callbacks then:
   - success -> update marker title/id, clear saving, highlight
   - error -> remove marker, clear saving, set error message

### Timing notes

- **MediaRecorder stops before transcription starts** (correct sequencing).
- **Transcription starts inside `onstop` callback**.
- **UI capture panel is dismissed before AI structuring completes**.
- **No explicit voice overlay processing UI between Finish and completion**.

---

## 4) UX Gap Analysis

## Why "Paused" was shown earlier

`VoiceCapturePanel` status text is binary:
- `"Listening..."` when `state === "voice_listening"`
- `"Paused"` otherwise

So any state deviation (e.g., `idle`, `processing`, `error`) while panel still mounted appears as `"Paused"`, even if the user did not pause.

Root issue: label is derived from generic `state` comparison, not true pause semantics.

## Why waveform was still active

Waveform is driven by `analyser` object. It keeps animating while analyser exists.

In current code, analyser is cleared when `state !== "voice_listening"` in hook cleanup. If previous behavior had `"Paused"` while still animating, it implies state/panel/analyser timing mismatch (panel still mounted while analyser loop still running for a moment).

## Why there is now no loading/processing state

In **session voice finish path**, code sets:
- `setPending(null)`
- `setState("idle")`
before async `onComplete` finishes.

`state` never enters `"processing"` for this path, and the voice panel is unmounted immediately. Processing exists only in background marker/tray job indicators, not inline in the voice capture UI.

Missing explicit state: session voice "finishing/processing" phase in overlay flow.

---

## 5) Waveform System

### What drives animation

- `ChatGPTWaveform` renders only when `analyser` is non-null.
- It runs `requestAnimationFrame`, reads frequency bins from `AnalyserNode`, draws bars.

### What stops it

- In hook effect: when `state !== "voice_listening"`:
  - animation frame cancelled
  - media tracks stopped
  - audio context closed
  - analyser set null

### State control linkage

- Primary control is `state === "voice_listening"` in hook lifecycle.
- Panel visibility is controlled separately by `sessionFeedbackPending`.
- This split is a source of UX mismatch risk.

---

## 6) UI Render Conditions

## Audio UI (mic + waveform + Finish)

Rendered only when all are true:
- `SessionOverlay` mounted (session mode active)
- `sessionFeedbackPending` exists
- `captureMode === "voice"`

Then renders `VoiceCapturePanel`:
- waveform component gets `analyser`
- status text uses `isListening={state === "voice_listening"}`
- finish button always visible while panel mounted

## Labels ("Paused" etc.)

- `"Paused"` is shown whenever panel mounted and `state !== "voice_listening"`.
- There is no dedicated `"Processing..."` label in `VoiceCapturePanel`.

---

## 7) Pipeline Connection (`onComplete`)

- `onComplete` is called from `finishListening()` after transcript success.
- In session branch it is callback-based and **not awaited**.
- UI transition happens **before** pipeline completion:
  - panel closes
  - `state` resets to `idle`
  - background marker/job shows progress elsewhere

Result: user can perceive flow as "recording ended abruptly" with no local processing phase.

---

## 8) Missing State (Key Insight)

Missing explicit UX state in session voice flow:
- `finishing` (after Finish click, before transcription response)
- `transcribing` (audio -> text step)
- `processing` / `submitting` (text -> structured feedback step)

Current model overloads:
- `voice_listening` for recording
- `idle` for "not actively recording" and also "finished but backend still running"

This conflates fundamentally different user situations.

---

## 9) Race Conditions / Continuity Risks

- UI reset before pipeline completion:
  - `setPending(null)` + `setState("idle")` occurs before `onComplete` resolves.
- State meaning collapse:
  - `idle` used while async save still active (`pipelineActiveRef` true).
- Callback/pipeline mismatch:
  - pipeline state is tracked in refs/jobs, but overlay reads only `state` + pending.
- Error continuity:
  - transcription failure sets `state("idle")` and returns; pending capture may remain, causing panel still visible with non-listening status text.
- Duplicate finish risk:
  - no explicit guard around repeated Finish clicks while stop/transcribe is in progress.

---

## 10) Final Diagnosis

## Root UX Problems

- Voice capture has no explicit in-context "processing" phase after Finish in session mode.
- Status label semantics are misleading (`"Paused"` used as fallback for all non-listening states).
- Feedback processing feedback is displaced to marker/tray, not the capture panel where action occurred.
- User-perceived continuity is broken: panel disappears before completion/failure outcome is known.

## Root State Problems

- Single `state` machine is insufficient for session voice async lifecycle.
- `idle` is overloaded to represent both true idle and async submission in progress.
- UI render conditions depend on different state domains (`state`, `sessionFeedbackPending`, refs), causing mismatch windows.
- Processing refs (`pipelineActiveRef`, saving flags) are not first-class overlay-render states.

---

## 11) Recommended Fix Strategy (No Code)

Adopt a two-layer state model:

1. **Capture phase state** (what user is doing)
   - `selecting`, `recording`, `finishing`, `transcribing`, `submitting`, `done`, `failed`, `cancelled`
2. **Session context state** (where user is)
   - `sessionActive`, `sessionPaused`, `pendingTarget`, `none`

### Recommended transition sequence (voice session)

1. `pendingTarget` selected
2. `recording`
3. Finish click -> `finishing` (disable Finish, keep panel visible)
4. MediaRecorder stop -> `transcribing` (show "Transcribing...")
5. Transcript success -> `submitting` (show "Processing feedback...")
6. onComplete success -> `done` -> close panel + marker update
7. onComplete failure -> `failed` with retry/cancel affordance

### UX principles for this flow

- Never show `"Paused"` unless actual pause action/state is true.
- Keep user in one visual context until async action reaches a clear terminal result.
- Use explicit, user-readable statuses for each async step.
- Prevent duplicate finish/submit while an async step is active.

---

## Text Diagram: Current vs Recommended

### Current (session voice)

`element click -> pending -> recording (voice_listening) -> Finish -> stop -> transcribe -> setPending(null)+idle -> async onComplete in background -> marker/tray updates`

### Recommended

`element click -> pending -> recording -> Finish -> finishing -> transcribing -> submitting -> success/failure -> close/retain panel with clear outcome`

---

## Bottom Line

The system performs the backend work, but state ownership is fragmented across capture state, pending payload, refs, and extension jobs. The missing explicit post-finish processing states in the session voice overlay is the primary reason UX feels inconsistent and why users do not see a coherent "I clicked Finish, now it is processing" experience.
