# Phase 2.7 - Pagination Retry Upgrade

## Objective

Upgrade pagination recovery from cooldown-gated rehydrate to instant user-visible recovery with continuous retry behavior.

## Changes Implemented

### 1) Global recovery state added

In `echly-extension/src/background.ts`, feedback state now tracks:

- `feedback.recovering: boolean`
- `feedback.recoveryAttempts: number`

These values are broadcast in canonical global state so content/UI can render recovery status in real time.

### 2) Load-more failure behavior updated

On `loadMore()` failure:

- `recovering` is set to `true`
- `recoveryAttempts` is incremented
- pagination is **not** permanently disabled
- retry loop is triggered immediately

Cooldown-based blocking logic was removed.

### 3) Retry loop implemented

Added `retryRehydrateWithBackoff(sessionId)` in `echly-extension/src/background.ts`.

Behavior:

- immediate first retry
- exponential backoff sequence:
  - `0ms`
  - `500ms`
  - `1000ms`
  - `2000ms`
  - `4000ms`
- max attempts: `5`
- single in-flight loop guard (`loadMoreRecoveryPromise`) prevents duplicate concurrent loops

### 4) Success handling

When rehydrate succeeds:

- `recovering = false`
- `recoveryAttempts = 0`
- updated state is broadcast immediately

### 5) Final failure handling

After max retries:

- `recovering = false`
- attempts remain visible (for temporary-failure UX signal)
- no permanent pagination dead-end is introduced
- future triggers (e.g. next scroll/loadMore path) can re-enter recovery

### 6) UI signal wiring

Content and widget now receive and show recovery/failure signals:

- `feedbackRecovering`
- `feedbackRecoveryAttempts`
- `feedbackFetchFailed`

UX additions:

- retrying indicator with attempt count while recovery loop is active
- temporary failure banner when retries are exhausted
- loading states continue to be visible instead of silent no-op

Files updated:

- `echly-extension/src/background.ts`
- `echly-extension/src/content.tsx`
- `lib/capture-engine/core/types.ts`
- `lib/capture-engine/core/CaptureWidget.tsx`
- `echly-extension/popup.css`

## Success Criteria Check

- **NEVER silently block**: met (explicit retrying/failure UI states)
- **ALWAYS show loading/retrying state**: met (recovery state broadcast + rendered)
- **CONTINUOUS recovery attempts**: met (5-attempt backoff loop)
- **STOP only on success or max retries**: met
- **No hard cooldown blocking**: met (removed cooldown gate)
- **Pagination always recoverable**: met (no permanent disable path)

