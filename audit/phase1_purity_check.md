# Phase 1 Purity Check Report

## ✅ Valid State Usage (Background Only)

- File: `echly-extension/src/background.ts`
  - `globalUIState.pointers`, `globalUIState.nextCursor`, `globalUIState.hasMore` are defined and mutated here.
  - Valid examples:
    - `globalUIState.pointers = [...]`
    - `globalUIState.nextCursor = ...`
    - `globalUIState.hasMore = ...`
    - `if (globalUIState.isFetching || !globalUIState.hasMore || !globalUIState.nextCursor) return;`

## ❌ Violations Found

- File: `echly-extension/src/content.tsx`
- Line: 210
- Code snippet:
  `const [globalState, setGlobalState] = React.useState<GlobalUIState>({... feedback: { items: [], nextCursor: null, hasMore: false ... }})`
- Why this is a violation:
  Stores feedback list + pagination (`nextCursor`, `hasMore`) in content script React state outside `background.ts`.
- Severity: HIGH

- File: `lib/capture-engine/core/hooks/useCaptureWidget.ts`
- Line: 121
- Code snippet:
  `const [pointers, setPointers] = useState<StructuredFeedback[]>(initialPointers ?? []);`
- Why this is a violation:
  Creates local ownership for feedback/pointers outside `background.ts`; later mutates via many `setPointers(...)` calls.
- Severity: HIGH

- File: `lib/capture-engine/core/hooks/useCaptureWidget.ts`
- Line: 741
- Code snippet:
  `setPointers((prev) => [ ...prev ])`
- Why this is a violation:
  Direct mutation path for feedback list state outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- Line: 73
- Code snippet:
  `const [items, setItems] = useState<Feedback[]>([]);`
- Why this is a violation:
  Owns feedback list state in dashboard hook outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- Line: 80
- Code snippet:
  `const [cursor, setCursor] = useState<string | null>(null);`
- Why this is a violation:
  Owns pagination cursor outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- Line: 81
- Code snippet:
  `const [hasMore, setHasMore] = useState(true);`
- Why this is a violation:
  Owns pagination `hasMore` outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- Line: 294
- Code snippet:
  `setCursor(pageCursor);`
- Why this is a violation:
  Mutates pagination cursor outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- Line: 299
- Code snippet:
  `setHasMore(serverTotal > 0 ? newLen < serverTotal : data.hasMore ?? false);`
- Why this is a violation:
  Mutates pagination gate state (`hasMore`) outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`
- Line: 294
- Code snippet:
  `setFeedback((prev) => [newItem, ...prev]);`
- Why this is a violation:
  Mutates feedback list state outside `background.ts`.
- Severity: HIGH

- File: `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`
- Line: 450
- Code snippet:
  `setFeedback((prev) => prev.map(...))`
- Why this is a violation:
  Repeated mutation paths for feedback list (title/actions/status/delete flows) outside `background.ts`.
- Severity: HIGH

- File: `lib/realtime/feedbackStore.ts`
- Line: 18
- Code snippet:
  `let snapshot = { sessionId: null, items: [], ... }`
- Why this is a violation:
  Separate realtime store owns feedback items outside `background.ts`.
- Severity: HIGH

- File: `lib/realtime/feedbackStore.ts`
- Line: 121
- Code snippet:
  `setSnapshot({ items: snap.docs.map(...), ... })`
- Why this is a violation:
  Mutates feedback list source in a non-background store.
- Severity: HIGH

- File: `lib/server/cache/feedbackCache.ts`
- Line: 3
- Code snippet:
  `data: { feedback: any[]; nextCursor: string | null; hasMore: boolean; }`
- Why this is a violation:
  Stores feedback + pagination cursor/hasMore in server cache outside `background.ts`.
- Severity: HIGH

- File: `lib/repositories/feedbackRepository.ts`
- Line: 399
- Code snippet:
  `const hasMore = docs.length > pageSize;`
- Why this is a violation:
  Non-background variable stores pagination ownership signal (`hasMore`).
- Severity: MEDIUM

- File: `lib/repositories/feedbackRepository.ts`
- Line: 437
- Code snippet:
  `nextCursor: lastVisibleDoc ? lastVisibleDoc.id : null`
- Why this is a violation:
  Non-background path stores/produces `nextCursor`.
- Severity: MEDIUM

- File: `app/api/feedback/route.ts`
- Line: 243
- Code snippet:
  `const { feedback, nextCursor, hasMore } = pageResult;`
- Why this is a violation:
  API route stores pagination state fields outside `background.ts`.
- Severity: MEDIUM

## 🎯 Final Summary

- Total violations: 16
- High severity: 12
- Is Phase 1 valid? NO
