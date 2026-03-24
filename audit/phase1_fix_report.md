## What was removed (real violations only)

- Removed pointer ownership from `lib/capture-engine/core/hooks/useCaptureWidget.ts`:
  - deleted local pointer state (`useState` for pointers),
  - deleted all local pointer mutations (`setPointers(...)`),
  - removed extension-side pointer refresh hacks that re-copied local pointer arrays.
- Removed local merge-style global state mutation in `echly-extension/src/content.tsx`:
  - deleted `setGlobalState((prev) => ({ ...prev, expanded: false }))` from reset handling.

## What was intentionally kept (dashboard/backend)

- Kept backend untouched (no repository/API changes).
- Kept dashboard stores/hooks untouched.
- Kept non-pointer UI-local state in extension/content (`feedbackJobs`, recording/UI status flags), since these are render/process states and not pointer source-of-truth ownership.

## Final architecture boundary

- Background script: single source of truth for extension runtime state (including feedback pointers/list).
- Content script (`echly-extension/src/content.tsx`): mirror layer that applies incoming global state by overwrite.
- Capture hook (`lib/capture-engine/core/hooks/useCaptureWidget.ts`): dispatcher/interaction logic only for pointer data; it reads pointers from props and does not own or mutate pointer list state.

## Confirmation

- No pointer ownership outside background (extension): confirmed.
- No pointer mutation outside background (extension): confirmed for pointer list state (`setPointers` removed, no `setFeedback` pointer-list mutator present).
