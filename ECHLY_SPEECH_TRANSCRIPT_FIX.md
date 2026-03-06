# Echly Speech Transcript Fix

## Root Cause

The speech transcript bug came from rebuilding the active recording transcript using only `event.resultIndex...event.results.length` inside `recognition.onresult`.

With the Web Speech API, `event.results` is cumulative. Each callback can contain the full results history, while `resultIndex` only points at the newest changed segment. Replacing stored transcript with only the latest slice caused earlier finalized phrases to be dropped from `recordings` state.

Interim results also contributed instability because partial phrases could temporarily overwrite the stored transcript before the final phrase set was complete.

## Code Change

The fix is limited to `components/CaptureWidget/hooks/useCaptureWidget.ts` inside `recognition.onresult`.

- Changed the loop from `for (let i = event.resultIndex; i < event.results.length; ++i)` to iterate the full `event.results` array.
- Ignored interim results with `if (!result.isFinal) continue;`.
- Rebuilt the transcript by concatenating all finalized result segments, then trimming the final string.
- Kept the existing `setRecordings(prev => prev.map(...))` state update logic unchanged.

## Why Cumulative Results Fix The Bug

Because `event.results` contains the cumulative recognition history, rebuilding from index `0` on every `onresult` event guarantees that all finalized speech segments remain present in the stored transcript.

Example:

- User says: `increase spacing`
- Then says: `move button up`
- Then says: `change color`

The rebuilt finalized transcript becomes:

`increase spacing move button up change color`

instead of only the most recently changed chunk.

Ignoring interim results prevents transcript jitter and avoids storing unstable partial phrases in `recordings`.

## AI Pipeline Impact

The AI pipeline behavior remains unchanged.

- `finishListening` was not modified.
- No pipeline trigger logic was changed.
- No UI or speech lifecycle behavior was changed.
- The only behavior difference is that the transcript stored before `finishListening` now contains the full finalized utterance.

Because pipeline submission still occurs in the existing `finishListening` path, this fix preserves the single pipeline call behavior while ensuring the submitted transcript is complete.
