# Public Share vs Dashboard Behavior Consistency Audit

Date: 2026-03-27  
Scope: Full behavior + UX consistency audit of public share page vs dashboard feedback detail page.  
Constraint: Analysis only. No code modifications.

## Executive Verdict

- The share page is **not behaviorally aligned** with the dashboard.
- Core UI shells are shared (`TicketList`, `ExecutionView`), but critical UX behavior diverges due to **different state orchestration and data-to-UI mapping** in parent containers.
- Main mismatches are caused by:
  - missing/alternate loading state wiring in share parent
  - different numbering computation strategy
  - list/detail fed by different sources at different times

---

## 1) Located Systems

### Dashboard reference

- `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`
- `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts`
- `components/layout/operating-system/TicketList.tsx`
- `components/layout/operating-system/ExecutionView.tsx`
- `components/session/FeedbackHeader.tsx`

### Share page system

- `components/share/PublicShareSessionView.tsx`
- `components/share/usePublicSessionRealtime.ts`
- `components/share/useShareCounts.ts`
- `components/layout/operating-system/TicketList.tsx` (same component reuse)
- `components/layout/operating-system/index.ts` (`FeedbackDetailView` alias to `ExecutionView`)
- `lib/share/mapPublicShareToSessionUi.ts`

---

## 2) Dashboard Behavior (Reference)

## A. Loading behavior

- **Full-page initial skeleton** appears only while auth is loading:
  - `SessionPageClient` returns `SessionPageSkeleton` when `authLoading === true`.
- **Detail panel loader** appears when feedback data is loading:
  - `renderExecutionContent()` returns `FeedbackPremiumLoader` when `feedbackLoading === true`.
- **List skeleton/loading rows** are inside `TicketList` and driven by props:
  - `countsLoading`
  - `loadingMore`
  - `isLoadingResolved`
- **Counts loading treatment** in `TicketList`:
  - header meta shows `… total · loading…`
  - open/resolved badges show `…`
  - section body shows spinner rows when list empty but counts imply pending data.

## B. Detail panel loading

- Detail panel has **dataset-level loading state** (`feedbackLoading`) in parent.
- Detail panel has **no separate per-ticket transition loader** when switching selected ticket.
- On ticket switch, selection updates immediately from already-loaded list; no intentional transition spinner.

## C. Numbering logic

- Dashboard detail header numbering is computed in `SessionPageClient` as **contextual section numbering**:
  - if selected ticket is in open subset: `openIndex + 1` of `activeCount`
  - if in resolved subset: `resolvedIndex + 1` of `resolvedCount`
  - fallback to canonical/global if not found in subsets.
- This is UI-level mapping in parent state (`contextualPosition`), then injected into detail item.

---

## 3) Share Page Behavior

## A. Loading behavior

- **Phase-based initial loader**: `phase === "initial"` renders full page with `FeedbackPremiumLoader` in both sidebar and main area.
- After one animation frame, phase flips to `ready`, regardless of realtime reconciliation completion.
- In ready phase:
  - top area (`PublicShareTopBar`) has no loading states/skeletons
  - list and detail are rendered with independent triggers.

## B. Detail panel behavior

- Detail uses shared `FeedbackDetailView` (`ExecutionView`) component.
- Parent introduces `selectedLoading`:
  - on selection change: set true
  - next animation frame: set false
  - detail content = `selectedLoading ? FeedbackPremiumLoader : detail`
- However, detail is **not tied to realtime list loading**:
  - `itemsToRender` is emptied when `realtime.loading`, but detail uses `feedbackRows`/`selectedSanitized` from `sanitizedFeedback`.
  - Result: detail can render normally while list is still in loading state.

## C. List loading behavior

- Share passes to `TicketList`:
  - `items: itemsToRender` where `itemsToRender = []` during `realtime.loading`
  - `loadingMore: realtime.loading`
  - `isLoadingResolved: realtime.loading`
  - `countsLoading` from separate `useShareCounts`
- It does not pass pagination refs (`loadMoreRef`, `scrollContainerRef`) and sets `hasMore: false`.
- Practical effect: list can look like “pending spinner/empty segments” while detail already shows content.

## D. Numbering logic

- Share detail numbering is computed in `PublicShareSessionView` via:
  - `selectedIndex = sanitizedFeedback.findIndex(...)`
  - `idx = selectedIndex + 1`
  - `total = counts?.total ?? feedbackRows.length`
- This is **global list index**, not per open/resolved section.
- Therefore, share numbering differs from dashboard’s contextual section numbering.

---

## 4) Direct Comparison

| Behavior | Dashboard | Share Page | Match? |
|--------|----------|-----------|--------|
| Initial skeleton | Auth-gated full page skeleton (`authLoading`) | Phase-gated full page loaders (`phase === initial`) | Partial |
| Detail loader | Loader for dataset loading (`feedbackLoading`); no per-ticket transition loader | Per-ticket transition loader (`selectedLoading`), but not tied to realtime list loading | No |
| List progressive loading | `TicketList` supports it, but hook currently returns `loadingMore: false`, `hasMore: false` (mostly snapshot/full-list behavior) | Emulates loading via `realtime.loading` mapped to `loadingMore` + empty `items` | No |
| Counts loading | `countsLoading` from session counts store + dedup fetch | `countsLoading` from `useShareCounts` API fetch | Partial |
| Ticket numbering | Contextual (open/resolved section based) with fallback | Global selected index over full sanitized array | No |
| Section separation | Open/Resolved sections with controlled expand/collapse | Same section UI component, same expand model | Yes (UI), No (number semantics) |

---

## 5) Component Reuse Audit

## A. Shared components

- `TicketList` is the **same component** in both surfaces.
- Detail view is the **same component**:
  - `FeedbackDetailView` is an alias of `ExecutionView`.
- Loader component reuse exists:
  - both use `FeedbackPremiumLoader`.

## B. Duplicated / diverged logic

- Numbering logic is duplicated at parent layer and diverges:
  - dashboard computes contextual open/resolved numbering
  - share computes global index numbering.
- Loading orchestration differs in parent:
  - dashboard uses `feedbackLoading` from `useSessionFeedbackPaginated`
  - share uses phase gate + realtime gate + one-frame selected transition gate.
- Share has explicit conditional forks (`phase`, `selectedLoading`, `itemsToRender`) that bypass dashboard timing model.

## C. Props consistency for `TicketList`

Dashboard vs Share:

- `items`:
  - dashboard: full canonical feedback from hook
  - share: emptied to `[]` while realtime loading
- `counts`:
  - dashboard: `feedbackTotal/open/resolved` from counts store
  - share: API counts fallback to derived counts
- `countsLoading`:
  - dashboard: `feedbackCountsLoading`
  - share: `useShareCounts.loading`
- `loadingMore`:
  - dashboard: `feedbackLoadingMore` (currently false in hook)
  - share: `realtime.loading`
- `isLoadingResolved`:
  - dashboard: `feedbackLoadingResolved`
  - share: `realtime.loading`

Conclusion: same component surface, materially different prop semantics.

---

## 6) Root Cause Analysis

1. **Why skeleton is not appearing in detail panel (in the expected moments)?**  
   Because share detail rendering is not coupled to realtime list loading. Detail uses `selectedSanitized` from `sanitizedFeedback`, while list is gated by `itemsToRender` that is emptied during `realtime.loading`. So list can “load” while detail stays rendered.

2. **Why list loading feels different?**  
   Share maps a realtime subscription loading boolean into `TicketList` loading props (`loadingMore`, `isLoadingResolved`) and simultaneously empties list items. Dashboard uses a different hook lifecycle (`initialLoading`, counts store, canonical list) and currently does not run true incremental pagination states.

3. **Why numbering logic is incorrect/missing?**  
   Numbering strategies differ by design in parents:
   - dashboard: section-contextual numbering (open/resolved)
   - share: global selected index of full array.
   This causes mismatch in “x of y” semantics.

4. **Are components truly shared or only visually similar?**  
   Core visual components are truly shared (`TicketList`, `ExecutionView`). Behavior mismatch is mainly from parent-level state/props/data mapping, not component duplication.

5. **Mismatch source type (state vs props vs data vs timing)?**  
   All four contribute:
   - **State**: different loading states (`phase`, `selectedLoading`, realtime vs dashboard loading)
   - **Props**: same components receive different semantics for identical prop names
   - **Data shape/mapping**: share uses sanitized model and global index mapping
   - **Rendering timing**: requestAnimationFrame transitions and decoupled list/detail readiness.

---

## 7) Architectural Gap

- Share page does partially bypass dashboard UX orchestration.
- Shared presentation components exist, but **no unified abstraction** for:
  - loading lifecycle contract
  - ticket numbering strategy
  - canonical readiness state between list + detail + counts.
- Net result: behavior parity is not guaranteed even with shared leaf components.

---

## 8) Final Verdict

1. **Behavioral alignment status:** No, not fully aligned.
2. **Exact mismatches:**
   - detail loading trigger differences (dataset vs per-selection frame gate)
   - list loading trigger/source differences
   - detail/list readiness can drift out of sync on share page
   - numbering semantics differ (contextual vs global).
3. **Primary cause categories:**
   - missing/unified state contract: yes
   - missing/semantic prop consistency: yes
   - differing data transformation: yes
   - wrong component usage: mostly no (components are shared; orchestration differs).

---

## Short answer to product questions

- **Why does share page feel different?**  
  Because it reuses UI components but drives them with a different loading and numbering orchestration pipeline.

- **What exactly is broken or missing?**  
  Consistent list/detail loading synchronization and contextual numbering parity with dashboard.

- **Component reuse issue or logic issue?**  
  Primarily a **logic/orchestration issue** (state + props + mapping), not a lack of component reuse.
