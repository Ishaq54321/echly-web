# Extension Mic Permission & Recording Audit (read-only)

Scope: the Annote Chrome extension (`annote-extension/`) and the bundled capture engine (`lib/capture-engine/`) it ships. The dashboard / Next.js app and marketing-site demos are out of scope.

---

## 1. Summary

- **Surface.** Mic capture happens inside the **content script**. The static content script `annote-extension/bootstrap.js` lazy-loads a single React bundle (`annote-extension/widget/widget.js`, built from `annote-extension/src/content.tsx` + `lib/capture-engine/*`) which mounts into a shadow-DOM host on the host page. There is **no offscreen document, no side panel, no popup, no service-worker mic capture, no `chrome.tabCapture`, and no `chrome.desktopCapture`** anywhere in the extension. Every `MediaStream` is created in the content script and lives on the same `window` as the host page.
- **Two `getUserMedia` paths.** The codebase has **two independent `getUserMedia(...)` call sites** that fire on the same Begin click in sequence:
  1. `lib/capture-engine/core/hooks/useMicPermission.ts:97` — the **pre-flight gate** in the ModeSelectionView panel ("Begin" button). Its only job is to surface a prompt, validate a device, then immediately stop the temp stream.
  2. `lib/capture-engine/core/hooks/useCaptureWidget.ts:593` (with a deviceId-fallback retry at line 604) — the **real recording call** inside `startListening`. This is the one that produces the `MediaStream` the waveform actually reads.
- **The waveform stays blank because the second path is never re-entered.** `useCaptureWidget.startListening` is a one-shot. When it rejects with `NotAllowedError` (typical of "first click → prompt shows → user delays") it sets `voiceError` and bails. The `useMicPermission` listener does observe a `granted` Permissions API transition and fires `onAutoRecover` — but that callback is only wired up in `ModeSelectionView` (the pre-Begin gate), not in `useCaptureWidget`. So in the panel-open-then-grant scenario, `useCaptureWidget` is never told permission flipped, never re-calls `getUserMedia`, never produces a stream, and the waveform's `useAudioLevels(source = null)` keeps returning a flat zero-bars array.
- **What the canvas renders.** The Waveform is a row of HTML `<span>` bars driven by `useAudioLevels(analyser)`. With no source (`analyser === null`), it renders 30 bars at `Math.max(3, level * height)` ≈ **3px each** — a flat baseline of 30 short bars. With a source attached but silent input, RMS falls below the `NOISE_FLOOR = 0.01` gate and the same flat 3px baseline appears. **The two "blank" cases look identical to the user.**
- **Three-quarters of the recovery story already exists.** `useMicPermission` already (a) subscribes to `PermissionStatus.onchange`, (b) classifies denied→granted transitions, (c) plays a brief "granted-just-now" celebration, and (d) calls an `onAutoRecover` callback. The piece that's missing is wiring an equivalent listener into the recording lifecycle (`useCaptureWidget`) so a grant *after* `startListening` has rejected can re-enter the recording flow without panel teardown.
- **MV3 surface considerations are moot.** Because the content script lives on the page and is allowed to call `getUserMedia`, the typical MV3 offscreen-document workaround does **not** apply here. Recovery does not require any background/service-worker plumbing.

---

## 2. Architecture map

### Extension boundary (`annote-extension/`)

| File | Role |
| --- | --- |
| `annote-extension/manifest.json` | MV3 manifest. Permissions: `activeTab, storage, scripting, alarms`. No `microphone`, no `offscreen`, no `tabCapture`/`desktopCapture`. Content script `bootstrap.js` runs on `<all_urls>` at `document_start`. |
| `annote-extension/bootstrap.js` (built from `annote-extension/src/bootstrap.ts`) | Tiny content script. Hosts the shadow DOM, lazy-loads `widget/widget.js` when needed, brokers `chrome.runtime` messages, manages keepalive port. No mic code. |
| `annote-extension/widget/widget.js` (built from `annote-extension/src/content.tsx`) | The React bundle. Mounts `<CaptureWidget>` and provides the extension-side glue (auth, session create, screenshot upload, ticket POST). Imports the capture engine. |
| `annote-extension/background.js` (built from `annote-extension/src/background.ts`) | MV3 service worker. Auth, session list/create, ticket CRUD, global UI state. Does **not** touch mic or MediaStream — would fail in MV3 if it tried. |

### Capture engine (`lib/capture-engine/`)

| File | Role |
| --- | --- |
| `lib/capture-engine/core/CaptureWidget.tsx` | Root widget. Switches between home screen, mode selection, session view. |
| `lib/capture-engine/core/ModeSelectionView.tsx` | "Voice / Write" picker shown after Start Session. Hosts the **pre-flight mic permission gate**. Owns the dedicated permission panel UI for granting/denied/site-blocked states. |
| `lib/capture-engine/core/hooks/useMicPermission.ts` | Permission state machine for the pre-flight gate. Owns the **only `PermissionStatus.onchange` listener** in the extension. Calls `getUserMedia({audio:true})` to prompt + enumerate devices, then stops the stream. |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | The big state machine — sessions, recording, screenshot, transcript pipeline. Owns the **second `getUserMedia` call** (`startListening`) and the live `MediaStream` / `AudioContext` / `AnalyserNode` / `MediaRecorder`. |
| `lib/capture-engine/core/hooks/useAudioLevels.ts` | Rolling 30-bar VU-meter hook. Accepts a `MediaStream \| AnalyserNode \| null`. Returns `zeroBars` when input is null. |
| `lib/capture-engine/core/CaptureLayer.tsx` | Portals `<SessionOverlay>` / region overlay into `#echly-capture-root`. Passes `audioAnalyser` (from `useCaptureWidget` state) down to the pill. |
| `lib/capture-engine/core/micSitePolicy.ts` | Two utilities: `isMicBlockedBySitePolicy()` (uses `document.permissionsPolicy`/`featurePolicy.allowsFeature("microphone")`) and `isPolicyBlockError(err)` (string-matches `getUserMedia` rejection messages for "permissions policy" / "feature policy"). |
| `lib/capture-engine/core/MicrophonePanel.tsx` | Pure UI list of mics for the hover-revealed picker; receives devices as a prop. |
| `lib/capture-engine/pill/CapturePill.tsx` | The portaled "voice/text pill" anchored next to a clicked element during an active session. Renders `<VoicePillContent>` (with waveform), `<TextPillContent>`, or `<PillErrorContent>`. |
| `lib/capture-engine/pill/VoicePillContent.tsx` | The pill body during active recording. Renders `<Waveform source={analyser}/>` plus controls. On mic-popover open, calls `navigator.mediaDevices.enumerateDevices()` (no `getUserMedia`). |
| `lib/capture-engine/pill/Waveform.tsx` | Thin wrapper around `useAudioLevels`. Renders 30 `<span>` bars; height = `Math.max(3, Math.min(h, level * h))`. |
| `lib/capture-engine/pill/PillErrorContent.tsx` | The pill error states: `mic_permission_initial`, `mic_permission_blocked`, `mic_permission_site_blocked`, `no_audio`, `transcription_failed`. Owns the inline "Click address-bar icon → allow" instructions. |
| `lib/capture-engine/pill/MicSelectorPopover.tsx` | Mic picker popover, fed from `enumerateDevices()` results. No mic-permission logic. |
| `components/CaptureWidget/SessionOverlay.tsx` | Hosts `<CapturePill>` inside the capture root. Owns a *second* Permissions API query (`navigator.permissions.query({name:"microphone"})`) used only to compute the `micPermissionBlocked` flag for the pill's error copy. No `onchange` subscription. |
| `components/CaptureWidget/RecordingMicOrb.tsx` | Legacy orb visual used in a different surface (not the pill). Not on the bug path. |
| `lib/capture-engine/pill/hooks/useRecordingTimer.ts` | Elapsed-time formatter for the pill. No mic code. |

### NOT on this path (deliberately excluded)

- `components/session/feedbackDetail/DescriptionEditor/useVoiceRecording.ts` — dashboard-only voice dictation. Has its own `getUserMedia` at line 117, but it's never bundled into the extension.
- `app/(marketing)/_components/demos/annote/*` — marketing-site mock animations. Never bundled into the extension.

---

## 3. `getUserMedia` call sites

There are **two** call sites in the extension bundle. Both run in the content-script realm.

| # | File:line | Constraints | Trigger | On success | On rejection | Retry? |
| - | --- | --- | --- | --- | --- | --- |
| 1 | [useMicPermission.ts:97](lib/capture-engine/core/hooks/useMicPermission.ts#L97) | `{ audio: true }` (no device pinning, no sampleRate) | `requestPermission()` called synchronously inside the **Begin click** in `ModeSelectionView` (handler at [ModeSelectionView.tsx:149-170](lib/capture-engine/core/ModeSelectionView.tsx#L149-L170)) | Calls `enumerateDevices()`, picks a deviceId (stored → "default" → first), persists to localStorage via callback, **stops every track on the temp stream** ([useMicPermission.ts:117](lib/capture-engine/core/hooks/useMicPermission.ts#L117)), sets state to `granted`. Returns `"granted"` so the caller can branch. | Classifies via `isPolicyBlockError(err)` → `site-blocked`, else queries Permissions API: `denied` → `denied-permanent`, anything else → `denied`. Sets state, logs warn, returns the new state. No exception is thrown to the caller. | Guarded by `inFlightRef` so concurrent callers don't race; otherwise no auto-retry from this call site. Recovery comes from the `PermissionStatus.onchange` listener (see §3 below). |
| 2 | [useCaptureWidget.ts:593](lib/capture-engine/core/hooks/useCaptureWidget.ts#L593) (plus fallback at [:604](lib/capture-engine/core/hooks/useCaptureWidget.ts#L604)) | `effectiveMicId` → `{ audio: { deviceId: { exact: effectiveMicId } } }`; otherwise `{ audio: true }`. Fallback retry uses `{ audio: true }` if the pinned device fails. | `startListening()`. Called from: (a) `handleRegionCaptured` in the legacy region path, (b) the SessionOverlay auto-start effect when `sessionFeedbackPending && captureMode === "voice"` ([SessionOverlay.tsx:305-309](components/CaptureWidget/SessionOverlay.tsx#L305-L309)), (c) `handleSwitchToVoice` for text→voice mid-pill, (d) `retryVoiceCapture` from the pill's "Try again". | Stores stream in `mediaStreamRef`, creates `AudioContext` + `AnalyserNode` (fftSize 256, smoothing 0.85), sets `audioAnalyser` state (this is what flows down to the pill's `<Waveform source={analyser}/>`), creates a `MediaRecorder(stream)`, starts it, sets `state = "voice_listening"`. | `isPolicyBlockError(err)` or `isMicBlockedBySitePolicy()` → site-blocked branch; if `sessionFeedbackPendingRef.current` (in-session capture) sets `voiceError = "site_blocked"` or `"mic_permission"` and `state = "idle"` (keeps the pending pill visible so error UI shows). Otherwise sets a top-level `errorMessage`, tears down the capture root, and restores the widget. **Does not query Permissions API. Does not subscribe to permission changes. Does not retry on its own.** | None. The pill's "Try again" button (`PillErrorContent`) calls `retryVoiceCapture`, which re-invokes `startListening` — but only on user click, not on permission change. |

No code anywhere calls `getUserMedia` with `video`, with `tabCapture`-style constraints, or via `RTCPeerConnection`. There are no `chrome.permissions.contains(...)` / `chrome.permissions.request(...)` calls — the manifest never declares "microphone" as an optional permission because it's a web-platform permission, not a Chrome extension permission.

---

## 4. Permission state detection

### Permissions API call sites

| Where | Call | Purpose | Listens for changes? |
| --- | --- | --- | --- |
| [useMicPermission.ts:50](lib/capture-engine/core/hooks/useMicPermission.ts#L50) (`queryMicPermission()` helper) | `navigator.permissions.query({name:"microphone"})` | Used inside the `catch` of the pre-flight `getUserMedia` to classify denial: `denied` → `denied-permanent`, anything else → `denied` (retryable). Read-once. | No |
| [useMicPermission.ts:228](lib/capture-engine/core/hooks/useMicPermission.ts#L228) (mount effect) | `navigator.permissions.query({name:"microphone"})` then `status.addEventListener("change", handleChange)` | **The only `PermissionStatus.onchange` subscription in the extension.** Mounted with `ModeSelectionView`. Debounces 120ms, then reflects new state. On `denied → granted`, sets `granted-just-now`, waits 600ms, sets `granted`, and **calls `onAutoRecover()`** ([useMicPermission.ts:200-204](lib/capture-engine/core/hooks/useMicPermission.ts#L200-L204)). | **Yes — but only from ModeSelectionView.** |
| [components/CaptureWidget/SessionOverlay.tsx:230-238](components/CaptureWidget/SessionOverlay.tsx#L230-L238) | `navigator.permissions.query({name:"microphone"})` | Set `micPermissionBlocked = true` when `status.state === "denied"`. Read-once, in a `useEffect` keyed on `voiceError === "mic_permission"`. Used only to pick which copy `PillErrorContent` shows. | **No** — no `addEventListener("change", …)` here. |
| Inferred-from-error classification | `(err as Error)?.name` is **not** checked anywhere. Both `useMicPermission` and `useCaptureWidget` only check `isPolicyBlockError(err)` (message string match for "permissions policy"/"feature policy"). `NotAllowedError`, `NotFoundError`, `NotReadableError`, `OverconstrainedError`, `AbortError` are never distinguished by name. | n/a | n/a |

### Critical statement re: onchange

**Only one code path** in the extension listens for `PermissionStatus.onchange` — the `useMicPermission` mount effect at [useMicPermission.ts:168-246](lib/capture-engine/core/hooks/useMicPermission.ts#L168-L246). That listener is mounted **only while `<ModeSelectionView>` is rendered** (the "Voice/Write" picker shown between Start Session and the first recording). Once the user clicks Begin and the capture widget transitions out of ModeSelectionView, **the listener is torn down** in `useMicPermission`'s effect cleanup. From that point on, `PermissionStatus.state` changes are observed by nothing.

No other surface — not `useCaptureWidget`, not `SessionOverlay`, not `CapturePill`, not `PillErrorContent` — subscribes to `PermissionStatus.onchange`.

---

## 5. MediaStream lifecycle

The MediaStream returned from the recording-path `getUserMedia` ([useCaptureWidget.ts:593](lib/capture-engine/core/hooks/useCaptureWidget.ts#L593)) is owned by `useCaptureWidget` via three refs:

- `mediaStreamRef.current` — the stream
- `audioContextRef.current` — the `AudioContext` created from it
- `analyserRef.current` — the `AnalyserNode` connected via `createMediaStreamSource(stream)`

Plus React state:
- `audioAnalyser` — the same AnalyserNode, exposed to the JSX tree so `<CaptureLayer audioAnalyser={...}>` can hand it to `<CapturePill analyser={...}>` → `<Waveform source={analyser}/>`.

Created at: **only inside `startListening`**, after `getUserMedia` resolves. Never lazily, never preemptively.

Disposed by `stopListeningAudio` ([useCaptureWidget.ts:280-294](lib/capture-engine/core/hooks/useCaptureWidget.ts#L280-L294)):
- Cancels the audio-level RAF loop
- `mediaStreamRef.current?.getTracks().forEach(t => t.stop())` then nulls the ref
- `audioContextRef.current?.close()` then nulls
- Nulls `analyserRef`, clears `audioAnalyser` React state, resets `listeningAudioLevel`

`stopListeningAudio` is called from:
- `finishListening` (after MediaRecorder stop, when sending the transcript)
- `discardListening` (trash-can / ESC)
- `resetVoiceRecording` (the pill's reset button)
- `selectVoiceMicrophone` (switching mics mid-recording)
- The "audio level loop" `useEffect` cleanup when leaving `voice_listening`
- A belt-and-braces unmount effect ([useCaptureWidget.ts:546-561](lib/capture-engine/core/hooks/useCaptureWidget.ts#L546-L561)) that also runs `getTracks().forEach(t.stop())` directly

The pre-flight stream from `useMicPermission` is **immediately torn down** at [useMicPermission.ts:117](lib/capture-engine/core/hooks/useMicPermission.ts#L117) — `tempStream.getTracks().forEach((t) => t.stop())` — before the success path returns. That stream is never reused.

Reuse across panel-open / close cycles: **none**. Every `startListening` call creates a fresh stream + AudioContext + AnalyserNode + MediaRecorder. The previous one is always disposed by `stopListeningAudio`.

The same `AnalyserNode` (from `analyserRef.current`) drives **two** consumers in parallel:
1. The internal audio-level RAF loop in `useCaptureWidget` ([useCaptureWidget.ts:306-313](lib/capture-engine/core/hooks/useCaptureWidget.ts#L306-L313)) — used only to update `listeningAudioLevel` for the legacy `RecordingMicOrb` scale animation.
2. `useAudioLevels(analyser, …)` inside `<Waveform>`. Because the input is already an `AnalyserNode`, `useAudioLevels` takes the "isAnalyserNode" branch ([useAudioLevels.ts:63](lib/capture-engine/core/hooks/useAudioLevels.ts#L63)) and **does not** create a second AudioContext.

---

## 6. MediaRecorder / encoder

- Instantiated at: [useCaptureWidget.ts:619](lib/capture-engine/core/hooks/useCaptureWidget.ts#L619), once per `startListening` call. No `MediaRecorderOptions` passed (browser default — typically `audio/webm;codecs=opus` in Chrome).
- Consumes the same `MediaStream` that was returned by `getUserMedia` (no `.clone()`, no `MediaStreamAudioDestinationNode` round-trip).
- `ondataavailable` ([useCaptureWidget.ts:622-624](lib/capture-engine/core/hooks/useCaptureWidget.ts#L622-L624)) appends every non-empty `event.data` to `audioChunksRef.current` (a `BlobPart[]`).
- `onerror` logs to the structured logger.
- `mediaRecorder.start()` with no timeslice — one final blob on stop.
- Stopped in: `finishListening`, `discardListening`, `resetVoiceRecording`, `selectVoiceMicrophone`. Each stop site calls `stopListeningAudio` after stopping the recorder (or both sequentially).
- On `mediaRecorder.onstop` ([useCaptureWidget.ts:747](lib/capture-engine/core/hooks/useCaptureWidget.ts#L747)), the chunks are wrapped in `new File(chunks, "recording.webm", { type: "audio/webm" })` and POSTed as `multipart/form-data` to `/api/transcribe-audio` via `environment.authenticatedFetch`. The response shape is `{ data: { transcript } } | { error: { code, message } }`. `NO_SPEECH_DETECTED` is mapped to `voiceError = "no_audio"`.
- **Never re-created if the stream changes** during a session, except indirectly via `resetVoiceRecording` and `selectVoiceMicrophone`, which both run a full teardown + fresh `startListening`. The recorder cannot be reattached to a new stream in place.

---

## 7. Waveform visualization

### Data path

`useCaptureWidget` creates `analyserRef` → exposes as `audioAnalyser` state → `CaptureWidget` passes `state.audioAnalyser` to `<CaptureLayer audioAnalyser={…}/>` → `CaptureLayer` passes it to `<SessionOverlay audioAnalyser={…}/>` → `SessionOverlay` renders `<CapturePill analyser={audioAnalyser}/>` → `CapturePill` renders `<VoicePillContent analyser={analyser}/>` → `VoicePillContent` renders `<Waveform source={analyser}/>` → `Waveform` calls `useAudioLevels(source, { barCount: 30 })`.

### Render mechanism

`useAudioLevels` ([useAudioLevels.ts](lib/capture-engine/core/hooks/useAudioLevels.ts)):
- When `source` is an `AnalyserNode` (the common case here), reuses it directly — no second `AudioContext`.
- When `source` is a `MediaStream`, creates `new AudioContext()` + `createMediaStreamSource()` + `createAnalyser()` (fftSize 1024, smoothing 0.7).
- Drives a `requestAnimationFrame` loop that samples every `SAMPLE_RATE_MS = 60ms`. Each tick: reads `getByteTimeDomainData`, computes RMS, applies `SMOOTHING = 0.5` EMA, gates below `NOISE_FLOOR = 0.01`, maps to `0..1` via `DISPLAY_CEILING = 0.3`, pushes onto a 30-slot rolling history.
- Returns `{ bars, isActive: !!input }`. When `input` is null, returns `zeroBars` (30 zeros) immediately and never starts the RAF loop.

`Waveform` renders one `<span class="echly-pill-wave-bar">` per bar with inline `height: Math.max(3, Math.min(h, level * h))px`. With `effectiveHeight = 28`, a zero-level bar is **3px tall**, a full-amplitude bar is 28px tall.

### What the canvas shows — exhaustive

| Scenario | `analyser` prop | `bars` returned | Visual result |
| --- | --- | --- | --- |
| Pill mounts before `startListening` resolves; or `startListening` rejected and `audioAnalyser` is still `null` | `null` | `zeroBars` (30 × 0) | 30 bars at 3px = **flat baseline of short dashes**. "Blank-looking." |
| `startListening` succeeded; user is silent | `AnalyserNode` (real samples, but RMS below 0.01) | history pushes `0` each tick → rolls to all zeros within ~1.8s | Same **flat baseline of 3px bars**. Indistinguishable from null-source case. |
| `startListening` succeeded; user is speaking | `AnalyserNode` (real samples, RMS above floor) | mix of 0..1 values rolling right-to-left | Animated rolling waveform. |

There is **no separate "waiting for permission" UI state inside `<Waveform>`**. The component does not know why its source is null. Distinguishing "no stream" from "stream attached but silent" has to happen *upstream* (e.g. `voiceError === "mic_permission"` flips the whole pill into `<PillErrorContent>` instead of `<VoicePillContent>` — but only if `setVoiceError` was actually called).

---

## 8. Current permission-denied UX

The behavior depends on **which surface** opens recording — there are two distinct flows because the in-pill recording path in a session doesn't go through `ModeSelectionView` first.

### Flow A — Start Session → ModeSelectionView → Begin

1. User clicks Start Session, then "Voice" mode, then "Begin".
2. `handleBegin` ([ModeSelectionView.tsx:149-170](lib/capture-engine/core/ModeSelectionView.tsx#L149-L170)) sets `pendingBeginRef = true` and calls `requestPermission()`. This triggers `getUserMedia` at [useMicPermission.ts:97](lib/capture-engine/core/hooks/useMicPermission.ts#L97).
3. While waiting on the browser prompt, `micPermissionState === "granting"` and the panel swaps in `<echly-mic-permission-panel>` showing a spinner with "Requesting microphone… / Allow access in the browser prompt to continue."
4. **If the user clicks Allow synchronously, all is well.** `requestPermission` resolves `"granted"`, `pendingBeginRef.current` is cleared, `onBegin()` runs → `useCaptureWidget.startListening` fires `getUserMedia` again (instantly granted), stream attaches, waveform animates.
5. **If the user dismisses / delays / denies:** `getUserMedia` rejects. The hook classifies via `navigator.permissions.query`: `denied` → `denied-permanent` (the "Microphone is blocked" panel with browser-icon instructions and a "Try again" button); anything else → `denied` (the "Annote needs your microphone" retryable panel).
6. **Crucially:** the `PermissionStatus.onchange` listener is mounted. If the user *then* clicks "Allow this time" in the browser popup, or flips it in chrome://settings, the listener fires, detects `denied → granted`, plays the 600ms "granted-just-now" celebration, sets `granted`, and calls `onAutoRecover` ([useMicPermission.ts:200-204](lib/capture-engine/core/hooks/useMicPermission.ts#L200-L204)). `ModeSelectionView`'s `handleAutoRecover` ([ModeSelectionView.tsx:96-101](lib/capture-engine/core/ModeSelectionView.tsx#L96-L101)) sees `pendingBeginRef.current === true` and calls `onBegin()` — which transitions out of mode-selection into the recording flow. The user never has to click anything in the panel.

### Flow B — Active session, voice mode, user clicks a page element

1. User has already started a session (the pre-flight gate is long gone). User clicks an element on the page.
2. `useCaptureWidget.handleSessionElementClicked` captures a screenshot, sets `sessionFeedbackPending`. `SessionOverlay` mounts `<CapturePill mode="voice"/>`.
3. The auto-start effect at [SessionOverlay.tsx:305-309](components/CaptureWidget/SessionOverlay.tsx#L305-L309) fires `onRecordVoice` → `useCaptureWidget.startListening`.
4. `startListening` calls `getUserMedia`.
5. **If the user takes time on the prompt:** the call is pending. The pill is already rendered. `audioAnalyser` is still `null` because no stream has arrived. `<Waveform source={null}/>` → `useAudioLevels(null, …)` → `zeroBars` → **30 × 3px bars (the "blank" the user described).** No spinner. No "waiting for permission" copy. The pill looks like it's actively recording silence.
6. **If the user clicks Allow:** `getUserMedia` resolves, the rest of `startListening` runs, `audioAnalyser` flips from `null` to the new AnalyserNode, `<Waveform>` re-renders with a live source, animation starts. (This path works correctly when grant is fast enough that the user doesn't notice the gap — but the pill never shows any indication that it was waiting.)
7. **If `getUserMedia` rejects** (user dismissed, or chose Block): the `catch` at [useCaptureWidget.ts:634-661](lib/capture-engine/core/hooks/useCaptureWidget.ts#L634-L661) classifies site-block vs not, then because `sessionFeedbackPendingRef.current === true` it sets `voiceError = "mic_permission"` (or `"site_blocked"`) and `state = "idle"`. The pill rerenders as `<PillErrorContent type="mic_permission_initial">` ("Annote needs your microphone … Try again") or `mic_permission_blocked` (if `SessionOverlay`'s read-once Permissions API check resolves `denied`).
8. **The bug case (panel-open-then-grant):** The user is in PillErrorContent. They click "Allow this time" in the still-visible Chrome popup. **Nothing in `useCaptureWidget` is listening for that event.** `SessionOverlay`'s effect only queries permissions when `voiceError === "mic_permission"` triggers it; it does not subscribe to changes. So:
   - `voiceError` stays `"mic_permission"`.
   - The pill stays on the error panel showing "Try again".
   - `audioAnalyser` is still `null`.
   - If the user instead doesn't even see PillErrorContent (because `getUserMedia` is still pending, not yet rejected — which can happen if the user clicks Allow before the prompt-dismissal heuristic times out), they're staring at a blank 30-bar baseline with no signal that recording hasn't started.
   - Closing and reopening the pill calls `discardListening` → `stopListeningAudio` (cleans up nothing because no stream was created), then a new click recreates the pending state → auto-`startListening` → `getUserMedia` now succeeds because permission is granted. Hence "close and reopen makes it work."

In summary, when the bug occurs, the user sees:
- Either a **flat 30-bar dash row inside an otherwise-normal-looking voice pill** (waveform with no input), with a running timer, with no copy indicating that we're waiting for permission, OR
- A **`PillErrorContent` "Annote needs your microphone" panel with a Try again button** — which the user is unlikely to click because they just *did* click Allow.

There is no spinner / loading / "waiting for permission" intermediate state distinct from "ready and silent".

---

## 9. Manifest V3 / offscreen details

No offscreen document anywhere. `chrome.offscreen.createDocument` is never called in `annote-extension/`. There is no `"offscreen"` permission in the manifest. The MediaStream is created in the content script and lives on the host page's window.

This is workable because content scripts in MV3 still have full DOM/Web-API access including `navigator.mediaDevices.getUserMedia`. The MV3 offscreen-document workaround is needed when audio has to live independently of any visible page — that is not this app's model. Annote's recording is always tied to a tab the user is actively looking at.

Consequence for the bug: there is no IPC layer to coordinate around. Whatever fix is proposed can live entirely in the content-script React tree.

---

## 10. Race conditions and edge cases

1. **The "instant-on" pill assumption.** `SessionOverlay`'s auto-start effect ([SessionOverlay.tsx:305-309](components/CaptureWidget/SessionOverlay.tsx#L305-L309)) fires `onRecordVoice` the moment `sessionFeedbackPending` is set. There is no "did getUserMedia even resolve yet" state. The pill UI assumes the stream arrives near-instantly. This is the proximate UX cause of the "blank waveform" the user reported.
2. **Stale stream after the user revokes permission via chrome://settings mid-recording.** `useCaptureWidget` has no `PermissionStatus.onchange` listener at all. If the user revokes mid-session, the browser will keep the existing MediaStream tracks alive (Chrome's behavior), but a *next* `startListening` call will reject. The current code only finds out at next user action.
3. **No `getUserMedia` from a service worker** — confirmed safe. `background.ts` / `background.js` only handle messaging, auth, ticket CRUD, etc.
4. **Two concurrent `getUserMedia` callers on the same Begin click.** Flow A always fires `getUserMedia` twice in close succession (pre-flight in `useMicPermission`, then real recording in `useCaptureWidget.startListening`). The first one is stopped immediately, so the second one inherits the just-granted permission and doesn't reprompt. This is intentional: the pre-flight is what surfaces the prompt under a user gesture, the real call is what produces the recording stream.
5. **AudioContext / AnalyserNode destroy timing.** `stopListeningAudio` calls `audioContextRef.current?.close()`, which returns a Promise; the code does not await it. The same `useEffect` that drives the audio-level loop ([useCaptureWidget.ts:297-320](lib/capture-engine/core/hooks/useCaptureWidget.ts#L297-L320)) reads `analyserRef.current` synchronously and starts a RAF — if the state transitions twice in quick succession, the older RAF cancels via its own cleanup but cannot prevent the briefly-orphaned analyser from being read once. In practice harmless because we still hold a reference.
6. **Pinned-device fallback.** The `startListening` try/catch at [useCaptureWidget.ts:592-608](lib/capture-engine/core/hooks/useCaptureWidget.ts#L592-L608) re-attempts with `{ audio: true }` if a pinned `deviceId` fails. This swallows `OverconstrainedError` from a disappeared mic; but if the *fallback* also fails (e.g. permission denied), the outer catch fires and we end up in the "blank waveform" scenario.
7. **`SessionOverlay`'s `micPermissionBlocked` flag is a one-shot read.** [SessionOverlay.tsx:213-243](components/CaptureWidget/SessionOverlay.tsx#L213-L243) runs only when `voiceError === "mic_permission"`. If the user grants permission while `voiceError` is unchanged (still `"mic_permission"`), this effect doesn't re-run and the flag stays stale. The flag only controls which error copy renders, so it's not load-bearing, but it's an example of the same root pattern: permission state read once, never observed.
8. **`navigator.mediaDevices.enumerateDevices()` returns labels only when permission has been granted at least once.** The mic-picker popovers ([VoicePillContent.tsx:59-73](lib/capture-engine/pill/VoicePillContent.tsx#L59-L73), [PillErrorContent.tsx:59-80](lib/capture-engine/pill/PillErrorContent.tsx#L59-L80)) handle the empty-label case via `label?.trim() || \`Microphone ${i+1}\``, but if the picker is opened before any successful `getUserMedia`, the labels will be generic.
9. **Multiple `getUserMedia` callers on the same page** — not actually possible at runtime because both call sites are in the same React tree and there's only one `<ModeSelectionView>` instance and one `useCaptureWidget` instance. But the Permissions API listener in `useMicPermission` is registered once per ModeSelectionView mount, so closing and re-opening the picker rapidly registers a fresh listener after the prior one is cleaned up. Not a leak; not a bug.

---

## 11. Trace: full lifecycle of the bug scenario

Scenario: user has an active session, has not granted mic permission to this origin before, clicks an element to capture, and clicks "Allow this time" *after* the recording panel has appeared.

| Step | Code path | State |
| --- | --- | --- |
| 1. User clicks a page element in capture mode | `attachClickCapture` (set up by `SessionOverlay.tsx:257-261`) fires `onElementClicked` → `useCaptureWidget.handleSessionElementClicked` → screenshot capture → `setPending({...})` (via `useCaptureWidget`'s pending setter) | `sessionFeedbackPending` becomes truthy; React re-renders `SessionOverlay` |
| 2. SessionOverlay's auto-start effect fires | [SessionOverlay.tsx:305-309](components/CaptureWidget/SessionOverlay.tsx#L305-L309): `voiceStartedForPendingRef.current = true; onRecordVoice()` | `onRecordVoice` is wired up to `useCaptureWidget.startListening` via `CaptureWidget.tsx:670` (`onSessionRecordVoice={handlers.handleSessionStartVoice}`); the pill mounts in parallel via `CapturePill` rendering inside `SessionOverlay` |
| 3. `startListening` runs | [useCaptureWidget.ts:570-633](lib/capture-engine/core/hooks/useCaptureWidget.ts#L570-L633): calls `enumerateDevices()`, computes `effectiveMicId`, then `navigator.mediaDevices.getUserMedia({audio: …})` at line 593 | `audioAnalyser` is still `null` (set only after stream resolves); Chrome shows the native "Annote wants to use your microphone" popup |
| 4. CapturePill renders while `getUserMedia` is pending | `<VoicePillContent analyser={null}/>` → `<Waveform source={null}/>` → `useAudioLevels(null, {barCount:30})` returns `zeroBars` | The pill shows a running 00:00 timer and **30 3px-tall bars** ("blank") |
| 5. Promise pending — user reads the Chrome popup, clicks "Allow this time" | Chrome flips the permission and resolves the in-flight `getUserMedia` | `mediaStreamRef`, `audioContextRef`, `analyserRef` all populate; `setAudioAnalyser(analyser)` runs; `state = "voice_listening"` |
| 5a. *(alternate: user pauses, dismisses the popup, or browser auto-rejects after timeout)* | `getUserMedia` rejects with `NotAllowedError` | Caught at [useCaptureWidget.ts:634-661](lib/capture-engine/core/hooks/useCaptureWidget.ts#L634-L661); because `sessionFeedbackPendingRef.current` is true, sets `voiceError = "mic_permission"` and `state = "idle"`. The pill flips to `<PillErrorContent type="mic_permission_initial">` |
| 6. *(in case 5a, the bug:)* user **then** clicks "Allow this time" in the still-visible popup | The browser silently flips `PermissionStatus.state` from `prompt`/`denied` → `granted` | **No code is listening.** The `useMicPermission` `onchange` subscriber is not mounted here (ModeSelectionView was unmounted when the session started). `SessionOverlay`'s Permissions query at [SessionOverlay.tsx:230-238](components/CaptureWidget/SessionOverlay.tsx#L230-L238) only re-runs when `voiceError` changes, which it didn't. `useCaptureWidget` has no listener at all. |
| 7. User waits, expecting the waveform to start | Nothing happens. The pill stays in `mic_permission` error state (or, in scenario 5 where grant beat the rejection, the recording is working and the user is happy — this branch isn't the bug). | No code path is going to re-call `startListening` until the user clicks "Try again" in the error panel or closes & reopens the pill. |
| 8. User closes and reopens the pill | Close: `onSessionFeedbackCancel`/`discardListening` → `setPending(null)`, `stopListeningAudio` (cleans up nothing because no stream was ever created), `state = "cancelled"`. Re-click: a new `handleSessionElementClicked` runs from step 1. | This time, `startListening` calls `getUserMedia` with permission already `granted` → resolves immediately → the AnalyserNode flows down and the waveform animates correctly. |

### Specifically: does any code know permission was just granted? (Step 6)

**No.** This is the single concrete code-level reason for the bug. The only `PermissionStatus.onchange` listener in the extension belongs to `useMicPermission`, which is mounted only inside `<ModeSelectionView>` — a screen the user has already left by the time they're capturing in-session. Neither `useCaptureWidget`, `SessionOverlay`, `CapturePill`, nor `PillErrorContent` subscribes. The `SessionOverlay` `navigator.permissions.query` call at [SessionOverlay.tsx:230](components/CaptureWidget/SessionOverlay.tsx#L230) is a read-once snapshot, not a subscription.

Ambiguities flagged (`needs runtime verification`):

- **Timing of the Chrome popup vs. the pill mount.** The trace above assumes the pill renders *before* `getUserMedia` resolves/rejects. In practice the pill mounts synchronously the moment `sessionFeedbackPending` is set, and `getUserMedia` is async — so the pill should always render first, but the actual gap depends on whether Chrome shows the popup synchronously inside the user gesture. *Needs runtime verification* to confirm the user sees a non-trivial "blank waveform" window before any resolution.
- **Whether Chrome resolves the pending promise on Allow-this-time after a long delay.** The hypothesis in the prompt is that the promise "rejects with `NotAllowedError` before the user clicked Allow". Chrome's behavior may vary: in recent versions, leaving the popup undismissed keeps the promise pending indefinitely; in some cases the promise rejects if the user navigates away from the popup or if there's a timeout. *Needs runtime verification* of exactly which sub-path (5 vs. 5a) the user hits — the symptom ("blank waveform that doesn't start") could come from either: from 5 (promise pending, blank waveform, then resolves and starts working — user might not even notice in fast cases) or from 5a-then-6 (rejected, error panel shown, then later granted with no recovery).
- **Whether `SessionOverlay`'s `voiceStartedForPendingRef.current = true` guard at [SessionOverlay.tsx:307](components/CaptureWidget/SessionOverlay.tsx#L307) blocks an auto-retry once the permission listener fires (in a future fix).** It will — and the existing pattern of resetting this ref when `sessionFeedbackPending` clears means any recovery handler would have to deliberately reset it (or call `onRecordVoice` via a path that bypasses this guard). Noted because it directly constrains the shape of any fix.
- **What `SessionOverlay`'s permission-blocked snapshot does when permission was `prompt` at query time.** `status.state === "denied"` is the only check; `prompt` and `granted` flow through without setting `micPermissionBlocked`. If the rejection happened because the user dismissed the popup (so the actual state stayed `prompt`), the pill will show `mic_permission_initial` ("Annote needs your microphone") rather than `mic_permission_blocked`. This is correct copy, but neither variant will recover without a click.

---

## 12. Resolution

The recovery gap and the dishonest loading UI are fixed in the same change.

### What changed

- **New hook: `lib/capture-engine/core/hooks/useMicPermissionListener.ts`.** A side-effect-only subscription to `navigator.permissions.query({name:"microphone"})` with a 120ms debounce and a graceful no-op on browsers without the Permissions API. Consumers pass `{enabled, onChange}` and own their own state machine.
- **Refactor: `useMicPermission` now consumes `useMicPermissionListener`.** The inline subscription block was replaced with a `useMicPermissionListener` call plus a one-time `query()` on mount to reflect the initial state. The `granted-just-now` celebration, `onAutoRecover` wire-up, and `site-blocked` short-circuit are unchanged from the consumer's perspective. The pre-Begin flow in `ModeSelectionView` behaves identically.
- **New listener in `useCaptureWidget`.** A second `useMicPermissionListener` is mounted, gated by `isAwaitingMicrophone || voiceError === "mic_permission"` so it only runs while the pill is stalled. When the listener fires with `granted` AND `stateRef.current !== "voice_listening"`, it auto-calls `retryVoiceCapture()`. A `retryInProgressRef` prevents stacking retries from back-to-back change events. All listener fires + retries are logged via `logger.debug("capture-widget-permission-listener", …)` for production observability.
- **New state: `isAwaitingMicrophone`.** Set to `true` at the top of `startListening` (immediately before `getUserMedia`), cleared either when the stream attaches (success branch) or when an error sets `voiceError`/`errorMessage`. Also cleared by `discardListening`, `handleSessionFeedbackCancel`, and `stopVoiceForModeSwitch`. Propagated through `CaptureLayer` → `SessionOverlay` → `CapturePill` → `VoicePillContent`.
- **Honest loading UI in `VoicePillContent`.** When `isAwaitingMicrophone && analyser == null`, the `<Waveform>` is replaced by a same-width "Waiting for microphone…" message inside the existing `.echly-pill-waveform` container, so the pill doesn't reflow when the stream attaches.
- **Timer gated on stream-attached state.** `CapturePill` now passes `isListening && analyser != null` to `useRecordingTimer`, so the timer can't tick during the waiting window — the user no longer sees 00:0X before recording has actually begun.

### Why the `voiceStartedForPendingRef` guard at `SessionOverlay.tsx:307` did not need touching

The recovery path goes `useCaptureWidget`'s listener → `retryVoiceCapture` → `startListening` directly. It never re-enters `SessionOverlay.onRecordVoice`, so the guard ref is irrelevant for this auto-retry. The guard still does its original job of ensuring `SessionOverlay`'s auto-start fires exactly once per pending click. The pill's "Try again" button (which also calls `retryVoiceCapture` directly) was already on the same bypass path before this change.

### Out of scope (known limitations)

- **Granted → denied mid-recording (revocation).** If the user revokes permission via chrome://settings while a stream is live, the existing tracks keep playing until they end naturally. There is no listener for this transition and no teardown path. Fixing requires a separate revocation handler that calls `stopListeningAudio` + surfaces an error state. Not in this PR.
- **Multi-tab permission coordination.** A grant or denial in another tab will fire `PermissionStatus.onchange` here, but only the tab with the visible pill will react. Cross-tab coordination (e.g. via `chrome.storage` events or `BroadcastChannel`) is not implemented.
- **The read-once Permissions API snapshot in `SessionOverlay.tsx:213-243`.** Still a one-shot read. Left intact because it only controls which error copy renders (`mic_permission_blocked` vs `mic_permission_initial`) and is not load-bearing for the recovery flow.
