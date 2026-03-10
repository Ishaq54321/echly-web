# Echly Dashboard Redesign Plan

> **Document Purpose:** Strategic plan to rebuild the Echly dashboard into a modern SaaS workspace (Linear/Jam.dev/Loom quality). Preserves all existing features and backend integrations while restructuring UX and UI architecture.

---

## 1. Executive Summary

The Echly dashboard will be transformed from a **session list + ticket viewer** into a **Feedback Operating System**—a workspace where teams instantly understand what issues exist, what needs attention, and how feedback evolved. The redesign prioritizes clarity, minimalism, and workflow efficiency.

**Design principles:** Minimal, Fast, Readable, Professional, Calm (Linear/Notion/Vercel aesthetic)

**Constraints:** No backend API changes; preserve all existing features (ticket editing, comments, pins, screenshots, session management).

---

## 2. Current State Analysis

### 2.1 Page Structure (Current)

| Route | File | Current Behavior |
|-------|------|------------------|
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Session grid + NeedsAttentionSection + InsightStrip; no Command Center |
| `/dashboard/[sessionId]` | `SessionPageClient.tsx` | Ticket list sidebar + ExecutionView (single ticket) + CommentPanel; flat list, no timeline |
| `/dashboard/[sessionId]/overview` | `overview/page.tsx` | Metrics, status previews, tag distribution, recent activity; no session summary block |
| `/dashboard/insights` | `insights/page.tsx` | Static placeholder sections; no real data |

### 2.2 Component Inventory

| Component | Location | Role |
|-----------|----------|------|
| `SessionPageClient` | `[sessionId]/SessionPageClient.tsx` | **~1180 lines** — orchestrates session, feedback, comments, clarity guard, modals; needs split |
| `TicketList` | `layout/operating-system/TicketList.tsx` | Sidebar list (Open/Skipped/Resolved); no bulk select |
| `ExecutionView` | `layout/operating-system/ExecutionView.tsx` | Single ticket detail; static title, no description edit |
| `FeedbackContent` | `session/feedbackDetail/FeedbackContent.tsx` | Screenshot + action steps + tags |
| `ScreenshotWithPins` | `session/feedbackDetail/ScreenshotWithPins.tsx` | Pins, drag, popover; **no zoom/pan** |
| `ScreenshotBlock` | `session/feedbackDetail/ScreenshotBlock.tsx` | Simple image + expand |
| `NeedsAttentionSection` | `dashboard/NeedsAttentionSection.tsx` | Sessions with open > 0 |
| `WorkspaceCard` | `dashboard/WorkspaceCard.tsx` | Session card in grid |
| `useCommandCenterData` | `hooks/useCommandCenterData.ts` | **Unused** — synthesizes summary, priority groups, momentum, heatmap |

### 2.3 Data Flow (Preserved)

- **Sessions:** `useWorkspaceOverview` → `getUserSessions` + `getSessionFeedbackCounts` (Firestore)
- **Feedback:** `useSessionFeedbackPaginated` → `GET /api/feedback?sessionId=...`
- **Ticket detail:** `GET /api/tickets/:id`
- **Comments:** `useFeedbackDetailController` → Firestore realtime
- **Ticket updates:** `PATCH /api/tickets/:id`

---

## 3. Target UX Architecture

### 3.1 Page Structure (Target)

```
/dashboard
  → Command Center (replaces session list as primary view)
  Sections: Critical Issues | Needs Attention | Active Sessions | Recent Feedback | Trending Problems

/dashboard/session/[sessionId]
  → Session Workspace (main working environment)
  Sections: Session header | Ticket timeline | Screenshot inspector | Ticket detail panel | Comments

/dashboard/session/[sessionId]/overview
  → Session Summary
  Sections: Metrics | Session summary block (AI) | Top tags | Activity timeline

/dashboard/insights
  → Workspace Analytics
  Sections: Recurring patterns | Sessions with highest issue counts | Tag trends | Resolution speed
```

### 3.2 Navigation Model

- **Dashboard home** = Command Center (high-signal overview)
- **Session list** = Accessible via sidebar nav or "All Sessions" link from Command Center
- **Session workspace** = Primary deep-work view
- **Overview** = Summary tab within session (e.g. tab bar: Feedback | Overview)

---

## 4. New Component Hierarchy

### 4.1 Command Center (`/dashboard`)

```
CommandCenterPage
├── CommandCenterHeader (title, New Session, search)
├── useWorkspaceOverview(viewMode)
├── useCommandCenterData(sessions)  ← wire existing hook
├── CriticalIssuesSection
│   └── CriticalIssueCard[] (session + top open tickets)
├── NeedsAttentionSection (enhance existing)
│   └── NeedsAttentionCard[]
├── ActiveSessionsSection
│   └── ActiveSessionCard[]
├── RecentFeedbackSection
│   └── RecentFeedbackItem[]
├── TrendingProblemsSection
│   └── TrendingProblemCard[]
└── AllSessionsLink → /dashboard/sessions (optional sub-route or modal)
```

**Data source:** `useCommandCenterData` already provides:
- `summary` (highImpactItems, riskAlerts, emergingPattern, bottleneck, momentum)
- `priorityRadarGroups` (Critical, At Risk, Stalled, Trending)
- `momentum`
- `heatmapBuckets`

### 4.2 Session Workspace (`/dashboard/session/[sessionId]`)

```
SessionWorkspacePage (refactored SessionPageClient)
├── SessionWorkspaceHeader
│   ├── Session title (editable)
│   ├── Overview tab link
│   ├── Execution Mode button
│   └── Mobile ticket navigator toggle
├── SessionWorkspaceLayout (3-column: timeline | main | panel)
│   ├── SessionTimeline (left or top on mobile)
│   │   └── TimelineEvent[] (screenshot captured, ticket created, comment added)
│   ├── MainContentArea
│   │   ├── ScreenshotInspector (upgraded ScreenshotWithPins)
│   │   └── TicketInspector (upgraded ExecutionView)
│   └── CommentPanel (slide-in when thread selected)
└── Modals: Clarity Guard, Delete ticket, Expanded screenshot
```

### 4.3 Session Timeline

```
SessionTimeline
├── TimelineEvent (timestamp, type, payload)
│   ├── type: "screenshot" | "ticket" | "comment"
│   ├── timestamp: formatted (e.g. "10:12 AM")
│   ├── screenshot thumbnail (if ticket has screenshot)
│   ├── ticket title
│   └── ticket status badge
└── Virtualized list (optional, for 100+ items)
```

**Data derivation:** From `feedback` array + comments; sort by `createdAt`/`clientTimestamp`; optionally merge comment timestamps from Firestore.

### 4.4 Screenshot Inspector (Upgrade)

```
ScreenshotInspector (extends ScreenshotWithPins)
├── Zoom controls (+ / - / fit)
├── Pan (drag when zoomed)
├── Comment pins (existing)
├── Highlight overlays (new: optional rectangle/region)
└── Expand to fullscreen (existing)
```

**Implementation:** Wrap image in a pan-zoom container (e.g. `react-zoom-pan-pinch` or custom transform); preserve existing pin logic.

### 4.5 Ticket Inspector (Upgrade)

```
TicketInspector (extends ExecutionView)
├── Editable title
├── Editable description (new)
├── Action steps (existing)
├── Tags (existing)
├── Status (Resolve / Reopen)
└── Action bar (Resolve, Assign, Defer, Resolve & Next, Comment, Delete)
```

### 4.6 Bulk Actions

```
BulkActionBar (new)
├── Selection state: Set<feedbackId>
├── "X selected" label
├── Resolve selected
├── Tag selected
├── Clear selection
└── Rendered when selection.size > 0
```

**Integration:** Add checkbox to `TicketItem`; `TicketList` manages `selectedIds`; pass `onBulkResolve`, `onBulkTag` to parent.

### 4.7 Session Overview Enhancements

```
SessionOverviewPage (enhance existing)
├── OverviewSessionHeader (existing)
├── MetricCard[] (existing)
├── SessionSummaryBlock (new) — AI summary from session.aiInsightSummary
├── StatusSection (existing)
├── TagDistribution (existing)
└── ActivityTimeline (rename RecentActivity, add visual timeline)
```

---

## 5. Page Layouts (Wireframes)

### 5.1 Command Center Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Command Center                    [Search] [All|Archived] [New Session] │
├─────────────────────────────────────────────────────────────────────────┤
│ Critical Issues                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                          │
│ │ Session A   │ │ Session B   │ │ Session C   │                          │
│ │ 5 open      │ │ 3 open      │ │ 2 open      │                          │
│ └─────────────┘ └─────────────┘ └─────────────┘                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Needs Attention                                                          │
│ • Session X — 4 open · 60% done · 2h ago                                 │
│ • Session Y — 2 open · 80% done · 5h ago                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ Active Sessions              │ Recent Feedback                           │
│ • Session 1 (3 open)         │ • "Login button broken" — Session A        │
│ • Session 2 (1 open)         │ • "Checkout flow" — Session B            │
├─────────────────────────────────────────────────────────────────────────┤
│ Trending Problems                                                        │
│ • Login flow — 3 sessions, 8 signals                                     │
│ • Checkout — 2 sessions, 4 signals                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Session Workspace Layout

```
┌──────────────┬─────────────────────────────────────┬──────────────────┐
│ Timeline     │ Screenshot Inspector                  │ Comment Panel    │
│              │ ┌─────────────────────────────────┐ │ (when thread     │
│ 10:12 AM     │ │                                 │ │  selected)       │
│ Screenshot   │ │     [Screenshot + pins]          │ │                  │
│              │ │     [Zoom] [Pan]                │ │                  │
│ 10:12 AM     │ └─────────────────────────────────┘ │                  │
│ Ticket       │                                      │                  │
│ "Login..."   │ Ticket Inspector                     │                  │
│              │ ┌─────────────────────────────────┐ │                  │
│ 10:13 AM     │ │ Title (editable)                 │ │                  │
│ Comment      │ │ Description (editable)           │ │                  │
│              │ │ Action steps | Tags | Status      │ │                  │
│              │ └─────────────────────────────────┘ │                  │
└──────────────┴─────────────────────────────────────┴──────────────────┘
```

### 5.3 Session Overview Layout (Enhanced)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Session Title                    [Share] [Open Feedback Board] [Settings]│
├─────────────────────────────────────────────────────────────────────────┤
│ [Total] [Open] [Done] [Completion %]                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ Session Summary (AI)                                                      │
│ "Main problems: login flow confusion, checkout button visibility..."     │
├─────────────────────────────────────────────────────────────────────────┤
│ Open / Done sections    │ Tag distribution  │ Activity timeline         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Migration Plan

### Phase 1: Command Center (Week 1)

1. **Create Command Center page**
   - New file: `app/(app)/dashboard/page.tsx` (replace) or `app/(app)/dashboard/command/page.tsx` (new route)
   - Decision: Replace `/dashboard` with Command Center; move session grid to `/dashboard/sessions` or keep as secondary section below Command Center sections.

2. **Wire `useCommandCenterData`**
   - Import in dashboard page; pass `sessions` from `useWorkspaceOverview`.
   - Build `CriticalIssuesSection`, `NeedsAttentionSection` (enhance), `ActiveSessionsSection`, `RecentFeedbackSection`, `TrendingProblemsSection`.

3. **Session list placement**
   - Option A: Command Center as primary; "All Sessions" link opens full session grid below or on separate route.
   - Option B: Command Center sections at top; session grid below (current layout, reordered).

**Recommendation:** Option B — Command Center sections first, then "All Sessions" grid. Simpler migration.

### Phase 2: Session Workspace Refactor (Week 2)

1. **Split `SessionPageClient.tsx`**
   - Extract: `useSessionWorkspaceState` (selectedId, detailTicket, executionMode, etc.)
   - Extract: `SessionWorkspaceHeader`
   - Extract: `SessionWorkspaceLayout`
   - Keep: Clarity Guard, Delete modal, ECHLY_FEEDBACK_CREATED handler in parent or dedicated hook.

2. **Create `SessionTimeline`**
   - New: `components/session/SessionTimeline.tsx`
   - New: `components/session/TimelineEvent.tsx`
   - Data: `feedback` + optional comment timestamps; derive events.

3. **Integrate timeline into layout**
   - Add timeline as left column (or collapsible) in Session Workspace.
   - Default: show timeline; mobile: horizontal scroll or tab.

### Phase 3: Screenshot Inspector (Week 3)

1. **Create `ScreenshotInspector`**
   - New: `components/session/feedbackDetail/ScreenshotInspector.tsx`
   - Wrap `ScreenshotWithPins` with zoom/pan (e.g. `react-zoom-pan-pinch`).
   - Add zoom controls (+ / - / fit).
   - Preserve pins, comment mode, expand.

2. **Replace usage**
   - `FeedbackContent` uses `ScreenshotInspector` when `sendPinComment` provided; else `ScreenshotBlock` (or simple inspector without pins).

### Phase 4: Ticket Inspector + Bulk Actions (Week 4)

1. **Upgrade `ExecutionView` → `TicketInspector`**
   - Add editable title (wire `onSaveTitle` — already exists in SessionPageClient).
   - Add editable description (new field, new `onSaveDescription` → PATCH).
   - Ensure all fields editable in panel.

2. **Bulk actions**
   - Add `selectedIds: Set<string>` to `TicketList` (or parent).
   - Add checkbox to `TicketItem`.
   - Create `BulkActionBar`; render when `selectedIds.size > 0`.
   - Implement `onBulkResolve`, `onBulkTag` (PATCH multiple tickets).

### Phase 5: Session Overview + Insights (Week 5)

1. **Session overview**
   - Add `SessionSummaryBlock` using `session.aiInsightSummary`.
   - Enhance `RecentActivity` → `ActivityTimeline` (visual timeline).

2. **Insights page**
   - Connect to real data: `useWorkspaceOverview` + `useCommandCenterData` + optional new `useInsightsData`.
   - Display: recurring patterns (from tag overlap), sessions with highest issue counts, tag trends, resolution speed (from counts).
   - Keep minimal; avoid heavy charts.

---

## 7. Files to Refactor

| File | Changes |
|------|---------|
| `app/(app)/dashboard/page.tsx` | Replace with Command Center layout; integrate `useCommandCenterData`; reorder sections |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Split into smaller components; add timeline, bulk select |
| `components/layout/operating-system/ExecutionView.tsx` | Rename/upgrade to TicketInspector; add description edit |
| `components/layout/operating-system/TicketList.tsx` | Add checkbox, bulk selection state |
| `components/layout/operating-system/TicketItem.tsx` | Add checkbox, selection callback |
| `components/session/feedbackDetail/FeedbackContent.tsx` | Use ScreenshotInspector instead of ScreenshotWithPins |
| `components/dashboard/NeedsAttentionSection.tsx` | Minor styling; ensure consistent with Command Center |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Add SessionSummaryBlock, ActivityTimeline |
| `app/(app)/dashboard/insights/page.tsx` | Connect to real data; simplify sections |

---

## 8. Files to Create

| File | Purpose |
|------|---------|
| `components/dashboard/CommandCenter.tsx` | Command Center container; sections layout |
| `components/dashboard/CriticalIssuesSection.tsx` | Critical issues cards |
| `components/dashboard/ActiveSessionsSection.tsx` | Active sessions list |
| `components/dashboard/RecentFeedbackSection.tsx` | Recent feedback across sessions |
| `components/dashboard/TrendingProblemsSection.tsx` | Trending problems (tag patterns) |
| `components/session/SessionTimeline.tsx` | Timeline of feedback events |
| `components/session/TimelineEvent.tsx` | Single timeline event row |
| `components/session/feedbackDetail/ScreenshotInspector.tsx` | Zoom/pan wrapper around ScreenshotWithPins |
| `components/layout/operating-system/TicketInspector.tsx` | Upgraded ExecutionView (or rename in place) |
| `components/layout/operating-system/BulkActionBar.tsx` | Bulk resolve, tag, clear selection |
| `components/session/overview/SessionSummaryBlock.tsx` | AI summary block |
| `components/session/overview/ActivityTimeline.tsx` | Visual activity timeline |
| `app/(app)/dashboard/[sessionId]/hooks/useSessionWorkspaceState.ts` | Extracted state from SessionPageClient |

---

## 9. API & Backend Preservation

**No changes to:**
- `GET /api/feedback`
- `GET /api/feedback/counts`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id`
- `DELETE /api/tickets/:id`
- `GET /api/sessions`, `POST /api/sessions`, `PATCH /api/sessions/[id]`, `DELETE /api/sessions/[id]`
- Firestore: sessions, feedback, comments

**Optional future:**
- `GET /api/insights` for aggregated analytics (not required for Phase 5; can use client-side aggregation from existing APIs).

---

## 10. UI Design System Notes

- **Typography:** Match Linear — clean sans, clear hierarchy (e.g. 20px semibold for headings, 13–14px for body).
- **Spacing:** Generous padding; avoid cramped layouts.
- **Borders:** Subtle; prefer `border-[var(--layer-1-border)]`.
- **Elevation:** Use `shadow-[var(--shadow-level-1)]` for cards.
- **Colors:** Existing CSS variables (`--text-primary-strong`, `--color-primary`, etc.); no new palette.
- **Motion:** `duration-[var(--motion-duration)]`; avoid heavy animations.

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| SessionPageClient split breaks state | Extract state into `useSessionWorkspaceState` first; then split UI. |
| Timeline performance with 200+ items | Virtualize with `@tanstack/react-virtual` or defer to Phase 2b. |
| Zoom/pan conflicts with pin drag | Ensure pin drag takes precedence when dragging pin; pan only when dragging background. |
| Bulk PATCH rate limits | Batch requests or add server-side bulk endpoint later; for now, sequential PATCH is acceptable. |

---

## 12. Success Criteria

1. **Command Center:** User opens `/dashboard` and immediately sees Critical Issues, Needs Attention, Active Sessions, Recent Feedback.
2. **Session Workspace:** Feedback appears as timeline events; screenshot has zoom/pan; ticket panel has editable title + description.
3. **Bulk Actions:** User can select multiple tickets and resolve or tag them.
4. **Session Overview:** Session summary block displays AI-generated summary.
5. **Insights:** At least 2 sections show real data (e.g. sessions with highest counts, tag distribution).
6. **No regressions:** All existing features (comments, pins, Execution Mode, Clarity Guard, session CRUD) work as before.

---

## Appendix A: Component Dependency Graph

```
CommandCenterPage
  └── useWorkspaceOverview, useCommandCenterData
  └── CriticalIssuesSection, NeedsAttentionSection, ActiveSessionsSection, ...

SessionWorkspacePage
  └── useSessionFeedbackPaginated, useFeedbackDetailController, useSessionWorkspaceState
  └── SessionTimeline, ScreenshotInspector, TicketInspector, CommentPanel
  └── TicketList (with BulkActionBar when selectedIds.size > 0)
```

---

## Appendix B: Route Summary

| Route | Primary Content |
|-------|-----------------|
| `/dashboard` | Command Center |
| `/dashboard/session/[sessionId]` | Session Workspace (timeline + inspector + panel) |
| `/dashboard/session/[sessionId]/overview` | Session Summary |
| `/dashboard/insights` | Workspace Analytics |

**Note:** Current route is `/dashboard/[sessionId]`. Consider migrating to `/dashboard/session/[sessionId]` for consistency with "session" namespace, or keep existing route to avoid redirects. **Recommendation:** Keep `/dashboard/[sessionId]` for backward compatibility.
