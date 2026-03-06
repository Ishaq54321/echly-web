## Echly Speech Preview Removal Report

### Summary

- Removed `liveStructureFetch` from the speech capture flow.
- Removed the preview debounce path that was triggering AI during `voice_listening`.
- Kept the final submission pipeline unchanged.
- AI is no longer called while the user is speaking.
- AI now runs only on final submission after the user clicks Done.

### What Was Removed

- Live preview `useEffect` in `components/CaptureWidget/hooks/useCaptureWidget.ts`
- Preview debounce timer and related constants
- Preview result state that was only used by the live speech-time AI path
- Unused `liveStructureFetch` prop plumbing from the widget/component boundary

### Final Pipeline Confirmation

The speech capture flow now behaves as follows:

- While speaking: no calls to `/api/structure-feedback`
- After clicking Done: one final call to `/api/structure-feedback`
- Then persistence continues through `/api/feedback`
- Then screenshot attachment/update continues through `PATCH /api/tickets`

### Files Modified

- `components/CaptureWidget/hooks/useCaptureWidget.ts`
- `components/CaptureWidget/CaptureWidget.tsx`
- `components/CaptureWidget/types.ts`
- `echly-extension/src/content.tsx`
- `ECHLY_SPEECH_PREVIEW_REMOVAL_REPORT.md`
