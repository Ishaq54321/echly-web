# Phase 6.7 — Single source of truth (per screen)

Legend: **Single-source** = one primary stream powers the main UI body without mandatory secondary fetches for the same entity. **Multi-source** = multiple independent sources that must agree for full correctness.

---

## `/dashboard` (session list)

- **Sessions rows**: Firestore `onSnapshot` on `sessions` — **single source** for titles, archive state, ordering.
- **Per-session ticket counts on cards**: `/api/feedback/counts` + `sessionCountsStore` — **secondary source** (not derivable from sessions query alone).
- **Verdict**: **Multi-source** (sessions + counts API).

---

## `/dashboard/[sessionId]` (ticket board)

- **Ticket list content**: Firestore `onSnapshot` on `feedback` — **single source** for list membership and most fields.
- **Aggregate counts** (open/resolved/total in chrome): `/api/feedback/counts` / session doc fields — **secondary**; intentionally not derived from loaded docs.
- **Session title / access**: `getDoc(sessions/{id})` — **secondary** for session metadata (listener is on feedback, not session).
- **Detail mutations / some fields**: `PATCH /api/tickets/:id` — **write path**; reads merged optimistically into list state.
- **Comments**: Separate `onSnapshot` on `comments` — **separate entity** (expected multi-source for thread).
- **Verdict**: **Multi-source** for tickets + counts + session meta + comments.

---

## `/dashboard/[sessionId]/overview`

- **No single listener**; composed from `getSessionById`, counts API, two limited `getDocs` feedback queries, comments query, then `getFeedbackByIds`.
- **Verdict**: **Multi-source** by design (overview is a **bundle** of snapshots).

---

## `/dashboard/insights`

- **Charts / lifetime stats**: Workspace insights document `onSnapshot` — **single source** for aggregated analytics payload.
- **Session names in bars**: `getDoc` per top session id — **secondary** lookup for labels only.
- **Verdict**: **Mostly single-source** for metrics; **multi-source** for friendly session labels.

---

## `/discussion`

- **Thread list**: `GET /api/feedback?conversationsOnly` — **single source** for list.
- **Ticket header / screenshot in thread**: `GET /api/tickets/:id` + `GET /api/sessions/:id` — **secondary**.
- **Comments**: Firestore `onSnapshot` — **separate source** for live thread.
- **Verdict**: **Multi-source**.

---

## `/s/[token]` (public share)

- **Initial payload**: Single API response (session + feedback array) — **single source** for first paint.
- **Realtime**: None on client today.
- **Verdict**: **Single-source** for static share view.

---

## Global: workspace identity

- **workspaceId**: Resolved via `users` doc + `/api/users` + `getUserWorkspaceIdRepo` — **multi-step**; final id stored in React state + `workspaceBootstrap` hint.
- **Verdict**: **Multi-source** resolution path; **single** runtime value in context once resolved.

---

## Summary checklist

| Screen | Single-source? |
|--------|----------------|
| Dashboard session list | **No** (sessions + counts) |
| Session ticket board | **No** (feedback + counts + session doc + comments) |
| Session overview | **No** |
| Insights (metrics) | **Mostly yes** (doc + title lookups) |
| Discussion | **No** |
| Public share | **Yes** (initial load) |
