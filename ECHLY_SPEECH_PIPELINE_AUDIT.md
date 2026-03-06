# Echly Speech Pipeline Architecture Audit

**Date:** March 7, 2025  
**Scope:** Deep architecture audit — map speech recognition flow for safe transcript buffering implementation  
**No code changes made.**

---

## 1. SpeechRecognition Initialization Location

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Lines:** 428–498 (inside a `useEffect` with empty dependency array `[]`)

### Creation

```ts
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
```

- **Instance storage:** `recognitionRef.current` (line 165, 485)
- **Lifecycle:** Recognizer is created once on mount and stored in `recognitionRef`. Cleanup calls `recognition.stop()` on unmount.

### Configuration

| Property | Value | Line |
|----------|-------|------|
| `continuous` | `true` | 434 |
| `interimResults` | `true` | 435 |
| `lang` | `"en-US"` | 436 |

---

## 2. Event Handler Map

All handlers are attached in the same `useEffect` (lines 428–498).

| Handler | Attached | Function executed | Transcript processed? |
|---------|----------|--------------------|------------------------|
| `recognition.onstart` | Yes (437) | Logs timestamp, `recognitionOnstartTimeRef`, delay UI→onstart | No |
| `recognition.onspeechstart` | Yes (446) | Logs `[VOICE] speech detected` | No |
| `recognition.onaudiostart` | Yes (448) | Logs `[VOICE] audio start` | No |
| `recognition.onresult` | Yes (452) | Extracts transcript from `event.results`, updates `recordings` state | **Yes** |
| `recognition.onend` | Yes (481) | Sets `state` to `"idle"` if not already processing/success | No |
| `recognition.onspeechend` | **No** | — | — |
| `recognition.onerror` | **No** | — | — |

### `recognition.onresult` (lines 452–479)

- **Transcript source:** `event.results[i][0].transcript` for `i` from `event.resultIndex` to `event.results.length - 1`
- **Logic:** Concatenates transcripts from the **new** results only (from `resultIndex` onward)
- **State update:** `setRecordings(prev => prev.map(r => r.id === activeId ? { ...r, transcript: text } : r))`
- **Critical:** `text` is **replaced** into the recording; previous transcript is overwritten

---

## 3. Transcript Data Flow

### 3.1 Where transcript is first created

**Location:** `components/CaptureWidget/hooks/useCaptureWidget.ts`, lines 452–456

```ts
recognition.onresult = (event: SpeechRecognitionResultEvent) => {
  let text = "";
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const item: SpeechRecognitionResultItem = event.results[i];
    if (item && item[0]) text += item[0].transcript;
  }
  // ...
};
```

- **Source:** `event.results[i][0].transcript` (first alternative of each result)
- **Scope of `text`:** Only results from `event.resultIndex` to `event.results.length` (new results in this event)

### 3.2 Where transcript is stored

**Location:** Same file, lines 471–478

```ts
if (activeId) {
  setRecordings((prev) =>
    prev.map((r) =>
      r.id === activeId ? { ...r, transcript: text } : r
    )
  );
}
```

- **Storage:** `recordings` state, on the active `Recording` object
- **Behavior:** **Replacement** — `transcript` is set to `text`, overwriting any previous value

### 3.3 Where transcript is passed to other functions

| Consumer | File | Function | When |
|----------|------|----------|------|
| `liveStructureFetch` | `useCaptureWidget.ts` | `useEffect` (258–290) | Debounced (1800 ms) while `state === "voice_listening"` and transcript length ≥ 12 |
| `finishListening` | `useCaptureWidget.ts` | `finishListening` (528–650) | When user stops recording (Done button, etc.) |
| `handleSessionFeedbackSubmit` | `useCaptureWidget.ts` | `handleSessionFeedbackSubmit` (983–1009) | When user submits in session mode |
| `onComplete` | Passed from parent | Varies by context | Called by `finishListening` and `handleSessionFeedbackSubmit` |

### 3.4 Where transcript triggers the AI pipeline

- **Main pipeline:** `onComplete(transcript, screenshot, ...)` → parent’s handler (e.g. `handleTranscript` in `SessionPageClient.tsx` or `handleComplete` in extension `content.tsx`) → `authFetch("/api/structure-feedback", { body: JSON.stringify({ transcript }) })` → `runFeedbackPipeline` → `runVoiceToTicket`
- **Live preview (extension only):** `liveStructureFetch(transcript)` → `apiFetch("/api/structure-feedback", ...)` — debounced, can fire multiple times while the user is speaking

---

## 4. Pipeline Trigger Location

### 4.1 Main pipeline (final transcript)

**Trigger:** `finishListening()` or `handleSessionFeedbackSubmit(transcript)`  
**Flow:**

1. `finishListening()` (line 528) → reads `active.transcript` from `recordingsRef.current` → calls `onComplete(active.transcript, ...)`
2. `handleSessionFeedbackSubmit(transcript)` (line 983) → receives transcript from UI → calls `onComplete(transcript, ...)`

**Pipeline call:** **After** user stops recording (Done / submit), **not** inside `recognition.onresult`.

### 4.2 Live structure fetch (extension)

**Trigger:** `useEffect` (lines 258–290) when `state === "voice_listening"` and transcript length ≥ 12  
**Flow:** `liveStructureFetch(transcript)` → `apiFetch("/api/structure-feedback", ...)`  
**Pipeline call:** **During** recognition, debounced by 1800 ms. Each transcript update can trigger a new API call after the debounce.

### 4.3 API chain

```
POST /api/structure-feedback (app/api/structure-feedback/route.ts)
  → runFeedbackPipeline(client, { transcript, context })
  → runVoiceToTicket(client, transcript, context, options)
```

---

## 5. `finishListening()` Responsibilities

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Lines:** 528–650

### When it runs

- User clicks Done / stop recording
- Wired via `onSessionDoneVoice` and `onDone` in `CaptureWidget.tsx` (lines 163, 179)

### What it does

1. **Haptics:** `navigator.vibrate(8)` if available
2. **Audio:** `playDoneClick()`
3. **Stops recognition:** `recognitionRef.current?.stop()`
4. **Reads transcript:** `active.transcript` from `recordingsRef.current`
5. **Early exit:** If no active recording or empty transcript → `setState("idle")`, return
6. **Extension mode:**
   - Session mode: creates marker, calls `onComplete(active.transcript, ...)` with `sessionMode: true`
   - Non-session: sets `processing`, calls `onComplete(active.transcript, ...)`
7. **Web mode:** Sets `processing`, awaits `onComplete(active.transcript, active.screenshot)`, then updates pointers and UI

### Transcript finalization

- **Does not finalize transcript:** It uses whatever is in `recordingsRef.current` at call time
- **Source of transcript:** Last value written by `recognition.onresult` via `setRecordings`
- **Conclusion:** `finishListening` is the right place to trigger buffering/finalization, but it does not currently perform any transcript aggregation; it relies on the value already stored by `onresult`

---

## 6. Transcript Session Lifecycle

```
User clicks mic / starts capture
    ↓
handleRegionCaptured / handleAddFeedback / handleSessionStartVoice
    ↓
startListening() (line 398)
    ↓
voiceStartTimeRef = now, hasReceivedFirstTranscriptRef = false
    ↓
getUserMedia({ audio: true }), AudioContext, analyser
    ↓
recognitionRef.current?.start() (line 416)
    ↓
setState("voice_listening")
    ↓
recognition.onstart fires → logs
    ↓
User speaks
    ↓
recognition.onspeechstart, recognition.onaudiostart (logs)
    ↓
recognition.onresult fires (possibly multiple times)
    ↓
  For each event: text = concatenate event.results[resultIndex..length][0].transcript
    ↓
  setRecordings(prev => ... transcript: text)  ← REPLACES, does not append
    ↓
  [Optional] liveStructureFetch(transcript) after 1800 ms debounce (extension)
    ↓
User clicks Done
    ↓
finishListening() (line 528)
    ↓
recognitionRef.current?.stop()
    ↓
Read active.transcript from recordingsRef
    ↓
onComplete(active.transcript, ...) → /api/structure-feedback → runVoiceToTicket
    ↓
recognition.onend may fire → setState("idle") if not already processing
```

**Logical finalization point:** When `finishListening()` runs, i.e. when the user explicitly stops recording.

---

## 7. Root Cause of Transcript Splitting / Loss

### Primary bug: Replace instead of accumulate in `onresult`

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`, lines 452–478

**Current behavior:**

1. `event.resultIndex` is the index of the first **new** result in this event
2. The loop builds `text` from `event.results[resultIndex]` through `event.results[length-1]` — i.e. only the new results
3. `setRecordings` **replaces** the recording’s `transcript` with `text`

**Web Speech API (continuous mode):** `event.results` is cumulative. With `continuous: true`, each result is a phrase. After a pause, a new phrase is added and `onresult` fires with `resultIndex` pointing to that new phrase. The loop therefore only includes the latest phrase(s), not the full session transcript.

**Effect:** Each pause causes the previous phrase(s) to be overwritten. Only the last phrase before `finishListening` is kept. Earlier phrases are lost.

**Example:** User says “Fix the bug” [pause] “in the login form”  
- First `onresult`: `text = "Fix the bug"`, transcript = "Fix the bug"  
- Second `onresult`: `text = "in the login form"`, transcript = "in the login form" (replaces "Fix the bug")

### Secondary: Live structure fetch

`liveStructureFetch` calls `/api/structure-feedback` while the user is still speaking (debounced). This can cause multiple pipeline calls per utterance, but it does not cause transcript splitting; it uses whatever transcript is currently in state (which may already be truncated by the replace bug).

---

## 8. Recommended Location for Transcript Buffering

### Option A: Fix accumulation in `recognition.onresult` (recommended)

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Function:** `recognition.onresult` handler (lines 452–479)

**Change:** Build the full cumulative transcript from `event.results` instead of only new results:

```ts
// Current (buggy): only new results
for (let i = event.resultIndex; i < event.results.length; ++i) {
  const item = event.results[i];
  if (item && item[0]) text += item[0].transcript;
}

// Recommended: full cumulative transcript
for (let i = 0; i < event.results.length; ++i) {
  const item = event.results[i];
  if (item && item[0]) text += item[0].transcript;
}
```

With `continuous: true`, `event.results` holds all phrases so far. Iterating from `0` to `length` yields the full transcript and avoids overwriting earlier content.

### Option B: Buffer in `finishListening` before pipeline

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Function:** `finishListening` (lines 528–650)

**Idea:** Keep a ref that accumulates transcript in `onresult`, and in `finishListening` use that ref as the final transcript before calling `onComplete`. This adds a second source of truth and must stay in sync with `recordings`; Option A is simpler.

### Option C: Use `recognition.onend` for finalization

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Function:** `recognition.onend` (lines 481–485)

**Current:** Only sets `state` to `"idle"`.  
**Issue:** `onend` can fire when recognition stops for other reasons (e.g. timeout, error), not only when the user clicks Done. `finishListening` is the explicit user action and is a more reliable place for finalization.

---

## 9. Summary Table

| Item | Location |
|------|----------|
| SpeechRecognition creation | `useCaptureWidget.ts` lines 430–433 |
| `continuous` | `true` (line 434) |
| `interimResults` | `true` (line 435) |
| Transcript extraction | `onresult` lines 452–456 |
| Transcript storage | `setRecordings` lines 474–478 |
| Pipeline trigger | `finishListening` → `onComplete` (lines 574, 593, 622) |
| Live pipeline calls | `liveStructureFetch` via useEffect (lines 258–290) |
| Root cause | Replace with `resultIndex..length` instead of full `0..length` |
| Recommended fix | Use `for (let i = 0; i < event.results.length; ++i)` in `onresult` |

---

## 10. Files Referenced

| File | Role |
|------|------|
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | Speech recognition, transcript handling, `finishListening` |
| `components/CaptureWidget/CaptureWidget.tsx` | Wires `finishListening` to UI |
| `components/CaptureWidget/types.ts` | `Recording`, `CaptureWidgetProps`, `onComplete` signature |
| `app/api/structure-feedback/route.ts` | POST handler, calls `runFeedbackPipeline` |
| `lib/ai/runFeedbackPipeline.ts` | Calls `runVoiceToTicket` |
| `lib/ai/voiceToTicketPipeline.ts` | `runVoiceToTicket` implementation |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `handleTranscript` → `authFetch("/api/structure-feedback")` |
| `echly-extension/src/content.tsx` | `handleComplete`, `liveStructureFetch` → `apiFetch("/api/structure-feedback")` |
