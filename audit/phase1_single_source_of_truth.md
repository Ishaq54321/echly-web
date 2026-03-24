# Phase 1 - Single Source of Truth

## What was removed

- Removed `mergeWithPointerProtection` from `echly-extension/src/content.tsx`.
- Removed all pointer-preserving merge behavior in content state application paths.
- Neutered extension-mode local pointer mutations in `lib/capture-engine/core/hooks/useCaptureWidget.ts`:
  - delete flow local pointer mutation
  - edit/save local pointer mutation
  - update local pointer mutation
  - reset-session local pointer clearing
  - load-session pointer injection

## Deleted / Neutered Duplicate State Owners

- `echly-extension/src/content.tsx`
  - No conditional merge of incoming global state.
  - Switched to full replacement model (`setGlobalState(incomingState)`).
- `lib/capture-engine/core/hooks/useCaptureWidget.ts`
  - Extension mode no longer mutates local pointer list as source-of-truth.
  - Extension mode pointer rendering is treated as background-fed render state.

## What was kept

- Background remains the sole state authority.
- UI-only ephemeral state remains in UI layers (capture overlays, local editing controls, interaction state).

## Background State Ownership

- `echly-extension/src/background.ts` now exports a canonical outbound state snapshot on every broadcast and state request.
- Canonical shape sent to content:

```ts
{
  session: {
    id: string | null,
    status: "idle" | "active" | "paused"
  },
  feedback: {
    items: StructuredFeedback[],
    nextCursor: string | null,
    hasMore: boolean,
    isFetching: boolean
  },
  counts: {
    total: number
  }
}
```

## Message Flow Changes

- Background always emits full canonical state (not partial payloads):
  - broadcast path
  - tab activation sync
  - tab update sync
  - tab creation sync
  - `ECHLY_GET_GLOBAL_STATE` response
- Content script always replaces local render state with the latest background payload.
- Pointer protection / merge fallback behavior was removed completely.

## Files Modified

- `echly-extension/src/content.tsx`
- `echly-extension/src/background.ts`
- `lib/capture-engine/core/hooks/useCaptureWidget.ts`
- `audit/phase1_single_source_of_truth.md`

## Risks Introduced (Temporary)

- Any code path still expecting legacy flat state keys from background messages may break until Phase 2 cleanup is complete.
- Existing non-extension widget behavior still uses local pointer state for dashboard-only flows.
- Counts detail fields (`open`, `skipped`, `resolved`) are no longer part of canonical state payload and are currently treated as non-canonical in content rendering.
