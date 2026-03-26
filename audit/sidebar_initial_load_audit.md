# Sidebar Initial Load Audit

## Final Answer
- Initial items rendered: **openItems.length** items (equivalently: one list row per **open** ticket while **Resolved** stays collapsed on first paint; resolved tickets add **0** rows until that section is expanded)

## Source of Truth
- Data fetch method: **useSessionFeedbackPaginated**
- Initial limit: **20** (first `GET /api/feedback` page); **30** (Firestore realtime query `limit` in **subscribeFeedbackSession**)
- Pagination method: **cursor**

## Rendering Flow
- Fetch → **Firestore onSnapshot (feedbackStore) + `/api/feedback` + `/api/feedback/counts`**
- Store → **useSessionFeedbackPaginated React state (`items` / returned `feedback`)**
- Render → **TicketList**

## Filters Applied Before Render
- Exclude soft-deleted feedback (realtime map + pagination append)
- Optional search filter on ticket title (debounced; empty on first load)
- Split into open vs resolved via **getTicketStatus**; only **expanded** sections render **TicketItem** rows (Resolved **collapsed** by default)

## Is Count Static or Dynamic?
- Dynamic
- Explanation: The sidebar maps **openItems** to rows; that length depends on how many loaded tickets are open. The loaded set is capped by the realtime window (**30** docs) or the first API page (**20** docs) when the list was still empty at bootstrap, then deduped.

## Notes
- Scope: session page left sidebar (**SessionPageClient** → **TicketList**). Discussion and other layouts differ.
- Pagination / “load more” does not change the **default first paint** row count formula above; scroll/sentinel triggers run only after **`initialLoadDone`** and (for the intersection observer) user scroll.
- **`scrollToId`** can auto-expand **Resolved** on first load, changing the row count versus the default.
