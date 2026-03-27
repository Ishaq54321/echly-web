# Loading State System Audit

Date: 2026-03-27  
Scope: Deep UX + state-management audit of loading behavior between dashboard feedback details and public share page.  
Constraint: Analysis only. No code fixes applied.

## Executive Summary

- Dashboard uses an explicit, multi-layer loading system (route shell skeleton, content skeleton, count placeholders, section-level spinners, comment loading state, realtime-driven state transitions).
- Share page skips most intermediate loading states because initial data is server-fetched before first client render, then client hooks are wired as mostly "silent updates" with little or no visual loading UX.
- The two pages share some UI components (`TicketList`, `ExecutionView`) but do not share a unified loading/state orchestration model.
- Share feels less polished mainly because loading is implicit (wait for ready payload) rather than explicitly modeled across mount/fetch/render phases.

---

## 1) Dashboard Loading System (Reference)

### Located Files

- `app/(app)/dashboard/[sessionId]/page.tsx`
- `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`
- `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts`
- `components/layout/operating-system/TicketList.tsx`
- `components/layout/operating-system/CommentPanel.tsx`
- `components/session/FeedbackPremiumLoader.tsx`

### A. Initial Loading

- **First gate (auth):** `SessionPageClient` returns `SessionPageSkeleton` while `authLoading` is true.
- **Second gate (feedback):** once auth resolves, main layout renders, but execution pane shows `FeedbackPremiumLoader` while feedback hook `loading` is true.
- **Header/count placeholders:** `TicketList` supports `countsLoading` and renders `"…"` + pulsing styles in summary/count pills.
- **Layout preservation:** even during loading, dashboard keeps sidebar/main split mounted, minimizing page jumps.

### B. Data Fetch Flow (mount → fetch → state update → render)

1. `page.tsx` passes `sessionId` into client component.
2. `SessionPageClient` waits for auth (`useAuthGuard`), then computes `feedbackSessionId`.
3. `useSessionFeedbackPaginated(feedbackSessionId, ...)` starts:
   - resets state in `useLayoutEffect` on session change (clears items/counts, sets loading flags),
   - starts Firestore `onSnapshot` for full feedback list,
   - starts counts fetch (`fetchCountsDedup`) or uses cached `sessionCountsStore`.
4. On first snapshot:
   - sets canonical list,
   - flips `initialLoading` off,
   - flips resolved-loading flags (`hasLoadedResolved`, `isLoadingResolved`),
   - list/detail render progresses from loaders to actual content.
5. Realtime changes update list in place and trigger incremental count refresh/debounce.

### C. Partial / Incremental Loading

- **Counts:** `countsLoading` independently controls metadata placeholders.
- **Section loaders:** `TicketListSectionLoading` appears for open/resolved sections based on `loadingMore`, `isLoadingResolved`, `searchLoading`, and list emptiness.
- **Search loading:** sidebar search has its own `searchLoading`.
- **Comments loading:** `useFeedbackDetailController` sets `loadingComments` true on feedback switch; `CommentPanel` renders `Loading...`.
- **Resolved-first-load semantics:** hook tracks `isLoadingResolved` and `hasLoadedResolved` for section-specific behavior.

### D. UX Behavior

- **Stable frame:** sidebar + main shell appears quickly and remains stable.
- **Progressive disclosure:** title/counts/list/detail transition independently rather than all-at-once.
- **Low flicker strategy:** immediate skeletons/placeholder rows avoid blank areas.
- **Potential micro-flicker:** there can be brief shifts between `SessionPageSkeleton` -> full shell -> `FeedbackPremiumLoader`, but layout intent stays consistent.

### E. State Sources

- **Local component state:** extensive `useState` in `SessionPageClient` (selection, search, UI toggles, modal state).
- **Hook-local async state:** `useSessionFeedbackPaginated`, `useFeedbackDetailController`.
- **External store:** `sessionCountsStore` (manual subscribe model, not `useSyncExternalStore`) for shared counts cache + updates.
- **Realtime + fetch hybrid:** Firestore snapshot for list/comments + API counts fetch + debounced count refresh.
- **`useSyncExternalStore`:** present elsewhere in repo, but **not used** in this dashboard/share loading path.

---

## 2) Share Page Loading System

### Located Files

- `app/s/[token]/page.tsx`
- `components/share/PublicShareSessionView.tsx`
- `components/share/usePublicSessionRealtime.ts`
- `components/share/useShareCounts.ts`

### A. Initial Load

- Initial data is fetched server-side in `app/s/[token]/page.tsx` via `fetchPublicShare(token)`.
- `PublicShareSessionView` is rendered only after that payload is ready.
- No route `loading.tsx` fallback exists in `app/`.
- No explicit share-page skeleton component is used for successful loads.
- Result: user waits on server response, then sees fully rendered share UI (or error state), with little intermediate feedback.

### B. Data Flow (page load → API fetch → render)

1. Page receives token param.
2. Server does `fetch('/api/public/share/:token', { cache: "no-store" })`.
3. If success, sends `initial` payload to `PublicShareSessionView`.
4. Client view initializes local state from payload (`sanitizedFeedback`, `selectedId`, permissions).
5. Client starts:
   - `usePublicSessionRealtime(sessionId)` (realtime updates),
   - `useShareCounts(sessionId, token)` (counts fetch).
6. Rendering is mostly immediate from initial payload; later hooks update silently.

### C. Realtime Behavior

- `usePublicSessionRealtime` returns `{ items, changes, loading, error }`.
- Hook initializes `loading: false` and never sets it to true before subscribe; only false on success/error.
- `PublicShareSessionView` ignores realtime updates while `realtime.loading || realtime.error`, but because loading is effectively never true, updates are mostly applied directly when changes arrive.
- Realtime is modeled as silent mutation/merge, not visible loading transitions.

### D. UI Behavior

- **No successful-load skeleton:** page generally appears after full payload is ready.
- **Counts partial loading only:** `countsLoading: !counts` passes into `TicketList`, so count pills can show loading placeholders.
- **Incremental list loading disabled:** share hardcodes `loadingMore: false`, `hasMore: false`, `isLoadingResolved: false`.
- **Detail panel behavior:** either "No feedback yet" empty state or full detail; no in-between detail skeleton.
- **Perceived result:** initial wait can feel like blank wait then jump-to-complete UI, unlike dashboard’s progressive loading.

---

## 3) Direct Comparison

| Aspect | Dashboard | Share Page |
|---|---|---|
| Initial loading | Explicit (`SessionPageSkeleton` on auth + `FeedbackPremiumLoader` on feedback) | Implicit server wait; render after payload ready |
| Skeleton UI | Yes (shell skeleton + detail placeholder + section/count placeholders) | No dedicated page/detail skeleton for successful load |
| Incremental loading | Yes (counts, section spinners, search loading, comments loading) | Minimal (counts only); pagination/resolved/search loaders disabled |
| Data source | Client auth + Firestore realtime + API counts + local/store coordination | Server public API initial payload + client realtime merge + separate counts fetch |
| Loading flags | Rich (`authLoading`, `loading`, `countsLoading`, `loadingMore`, `isLoadingResolved`, `searchLoading`, `loadingComments`) | Sparse/effectively reduced (`!counts` and realtime state mostly non-visual) |
| Layout stability | Strong; shell preserved during transitions | Stable after render, but pre-render phase lacks visible progressive placeholders |

---

## 4) Root Cause Analysis

## Why share page does not show dashboard-level loading UX

1. **No explicit first-load client state machine**
   - Dashboard has layered client loading gates.
   - Share resolves most data server-side first, so no equivalent in-client first-load phases are modeled.

2. **No share-specific skeleton or fallback route loader**
   - Dashboard defines and uses dedicated skeleton components.
   - Share has error states but no successful-load skeleton state.

3. **Intermediate states are intentionally bypassed**
   - Share sets list incremental props to non-loading constants (`loadingMore`, `hasMore`, `isLoadingResolved` false).
   - This removes section-level loading affordances.

4. **Realtime hook loading is not driving UX**
   - `usePublicSessionRealtime` state includes `loading`, but current implementation is effectively silent from UX standpoint.
   - Realtime is applied as direct list replacement/merge with no user-visible transition.

5. **Architecture split**
   - Shared rendering components exist, but dashboard’s richer orchestration (auth gating + counts store + incremental loaders + comment loading controller) is not mirrored in share flow.

---

## 5) Reusability Analysis

### Reusable from dashboard into share (low coupling)

- `TicketList` loading surfaces (`countsLoading`, section loading rows, controlled sections).
- `FeedbackPremiumLoader` style patterns (generic detail skeleton).
- `ExecutionView` shell is already reused (`FeedbackDetailView` alias).
- `CommentPanel` loading presentation pattern (if share ever enables comments view).

### Tightly coupled / harder to reuse directly

- `SessionPageClient` orchestration itself (auth guard, owner checks, mutation handlers, extension messaging).
- `useFeedbackDetailController` (requires auth context + comment permissions + writable flows).
- dashboard-specific action handlers (resolve/delete/edit APIs with owner permissions).

### Generic loading components

- `SessionPageSkeleton` and `FeedbackPremiumLoader` are visually generic enough to inspire reusable public/share variants.
- `TicketListSectionLoading` is already generic and could be leveraged if share adopts incremental list loading semantics.

---

## 6) Architectural Gap

- Loading logic is **scattered and page-specific**, not centralized in a shared state model.
- Dashboard has a de facto loading system composed across multiple hooks/components.
- Share page reuses display components but bypasses the loading orchestration layer almost entirely.
- Net: share does not "inherit" dashboard polish automatically because the polish lives in dashboard-specific controller logic, not a shared loading framework.

---

## 7) Final Verdict

1. **Why share page feels less polished**
   - It lacks explicit progressive loading UX and mostly appears only when fully ready, then silently updates.

2. **What exact systems are missing**
   - Missing explicit initial loading shell/skeleton for successful state.
   - Missing incremental list/detail loading transitions used by dashboard.
   - Missing robust loading flag propagation comparable to dashboard hook/controller stack.

3. **Is this missing components or different architecture?**
   - **Both, but primarily architecture.**
   - Components are partially shared, yet the share pipeline uses a different data-flow strategy that bypasses dashboard loading-state orchestration.

---

## Direct Answers to Success Questions

- **What makes dashboard feel polished?**  
  Layered, explicit loading states with stable layout and progressive transitions at auth, list, counts, detail, and comment levels.

- **Why share page feels incomplete?**  
  It has little visible intermediate loading UX; it relies on server readiness + silent client updates.

- **Exactly what is missing?**  
  A shared loading-state architecture (or equivalent share-specific orchestration) plus first-load and incremental skeleton/loader experiences aligned with dashboard behavior.
