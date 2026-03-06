# Echly Speech Capture Diagnostic Audit

**Date:** March 6, 2025  
**Goal:** Determine why the beginning of spoken feedback is sometimes missing from the transcript.  
**Scope:** Diagnostic logging only — no behavior changes.

---

## 1. Logging Locations

All diagnostic logs use the `[VOICE]` prefix. Filter console output by `[VOICE]` to isolate speech pipeline events.

### File: `components/CaptureWidget/hooks/useCaptureWidget.ts`

| Event | Log Message | When |
|-------|-------------|------|
| UI recording started | `[VOICE] UI recording started` + timestamp | When `startListening()` is called |
| recognition.start() | `[VOICE] recognition.start() called` + timestamp | Immediately before `recognition.start()` |
| recognition.onstart | `[VOICE] recognition.onstart` + timestamp | When Web Speech API reports recognition started |
| Delay UI→onstart | `[VOICE] delay UI recording start→onstart:` + ms | In onstart handler |
| speech detected | `[VOICE] speech detected` + timestamp | When `recognition.onspeechstart` fires |
| audio start | `[VOICE] audio start` + timestamp | When `recognition.onaudiostart` fires |
| transcript received | `[VOICE] transcript received` + timestamp + transcript | Every `recognition.onresult` callback |
| first transcript chunk | `[VOICE] first transcript chunk:` + transcript + length | First non-empty transcript of session |
| delay UI→first transcript | `[VOICE] delay UI→first transcript:` + ms | When first chunk received |
| delay onstart→first transcript | `[VOICE] delay onstart→first transcript:` + ms | When first chunk received |
| final transcript sent to pipeline | `[VOICE] final transcript sent to pipeline:` + transcript | Before each `onComplete()` call |

---

## 2. Metrics to Collect

When reproducing the issue, record:

### 2.1 Delay: UI recording start → recognition.onstart

- **What:** Time from `startListening()` to `recognition.onstart` firing.
- **Expected:** Typically 50–300 ms (getUserMedia + AudioContext + recognition init).
- **Concerning if:** >500 ms — user may have started speaking before recognition was ready.

### 2.2 Delay: recognition.onstart → first transcript chunk

- **What:** Time from recognition start to first non-empty transcript.
- **Expected:** 200–800 ms depending on utterance length and engine.
- **Concerning if:** >1500 ms — engine may be buffering or slow to commit first words.

### 2.3 First transcript chunk content

- **What:** The exact text of the first transcript chunk.
- **Check:** Does it begin mid-sentence? (e.g. "…button doesn't work" instead of "The button doesn't work")
- **If yes:** Words spoken before the first chunk are being dropped.

### 2.4 Final transcript vs. spoken words

- **What:** Compare `[VOICE] final transcript sent to pipeline:` with what the user actually said.
- **Check:** Are leading words missing? (e.g. user said "I think the login button is broken" but transcript starts with "login button is broken")

---

## 3. Suspected Causes of Missing Words

| Cause | Evidence in logs | Notes |
|-------|------------------|-------|
| **Late recognition start** | Large delay UI→onstart; user speaks before onstart | getUserMedia or AudioContext blocking; consider starting recognition earlier or showing "listening…" only after onstart |
| **First-chunk latency** | Large delay onstart→first transcript; first chunk begins mid-sentence | Web Speech API does not stream from t=0; engine may buffer before emitting. No direct fix in browser API. |
| **Interim vs final** | First chunk is interim, later chunks overwrite/append | Current code accumulates from `resultIndex`; verify we are not dropping early results |
| **resultIndex semantics** | `event.resultIndex` may skip early results in some engines | Check if `event.results` contains all results or only new ones; accumulation logic may miss earlier indices |
| **Browser/engine variance** | Different behavior in Chrome vs Safari vs Edge | Run same test across browsers and compare delays and first-chunk content |

---

## 4. How to Run the Diagnostic

1. Open DevTools → Console.
2. Filter by `[VOICE]` (or search for `VOICE`).
3. Start a capture (region or full screen).
4. Speak a known phrase immediately after the mic appears (e.g. "The login button on the top right is broken").
5. Stop recording.
6. Copy all `[VOICE]` logs and paste into this audit.
7. Fill in the metrics below.

---

## 5. Diagnostic Results (fill in after test runs)

### Run 1

- **Date:** ___________
- **Browser:** ___________
- **Spoken phrase:** ___________
- **Delay UI→onstart:** ___________ ms
- **Delay onstart→first transcript:** ___________ ms
- **First transcript chunk:** ___________
- **First chunk length:** ___________ chars
- **Final transcript:** ___________
- **Words missing from start?** Yes / No
- **Notes:** ___________

### Run 2

- **Date:** ___________
- **Browser:** ___________
- **Spoken phrase:** ___________
- **Delay UI→onstart:** ___________ ms
- **Delay onstart→first transcript:** ___________ ms
- **First transcript chunk:** ___________
- **First chunk length:** ___________ chars
- **Final transcript:** ___________
- **Words missing from start?** Yes / No
- **Notes:** ___________

---

## 6. Summary

After collecting data, document:

- **Delay between UI recording start and recognition.onstart:** (typical range)
- **Delay between recognition.onstart and first transcript chunk:** (typical range)
- **Cases where transcript begins mid-sentence:** (describe)
- **Suspected root cause of missing words:** (hypothesis based on evidence)
