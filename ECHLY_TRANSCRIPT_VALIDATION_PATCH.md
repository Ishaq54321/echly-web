# Echly Transcript Validation Patch

## File Updated

`components/CaptureWidget/hooks/useCaptureWidget.ts`

## Original Guard Logic

```ts
if (!active || !active.transcript.trim()) {
  setState("idle")
  return
}
```

## New Defensive Guard

```ts
console.log("[VOICE] finishListening transcript:", active?.transcript);

if (!active || !active.transcript || active.transcript.trim().length < 5) {
  console.warn("[VOICE] transcript too short, skipping pipeline");
  setState("idle");
  return;
}
```

## Reason For Change

Speech recognition can occasionally yield:

- empty transcripts
- very short fragments
- timing races where transcript state has not fully propagated before `finishListening()` runs

This defensive guard prevents the AI pipeline from running on invalid transcript input while preserving normal voice feedback flow for valid transcripts.

## Architecture Confirmation

The pipeline architecture remains unchanged.

- No prompt changes
- No recognition logic changes
- No API call changes
- No state structure changes
- No branching or pipeline flow changes beyond the transcript validation guard in `finishListening()`
