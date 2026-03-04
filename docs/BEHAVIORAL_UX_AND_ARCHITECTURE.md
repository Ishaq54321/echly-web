# Feedback Intelligence Operating System — Behavioral UX & Architecture

## Core strategic shift

**From:** "Users manage tickets"  
**To:** "AI surfaces what matters and guides execution"

AI is embedded in the workflow, not in a side panel. Every screen answers: **What requires attention now?**

---

## Experience flow

**New flow:** User → Command Center → Signal Review → Decision → Execution → Momentum Tracking

- **Command Center** — Intelligence entry point. Executive summary, priority radar, momentum, heatmap. Sessions as entry to Signal Review.
- **Signal Review** — Session page: Signal Stream (list) + Execution Node (detail). Dense, sortable by impact/risk/velocity/recency.
- **Decision** — Quick decision bar: Merge, Escalate, Assign, Resolve, Defer. Inline AI suggestions under header.
- **Execution** — Execution Plan (checklist), description, attachments, related signals. Activity and metadata in right column.
- **Momentum Tracking** — Command Center shows resolution velocity, confidence trend, owner load; Insights page shows patterns and risk.

---

## Information architecture

| Concept | Replaces | Purpose |
|--------|----------|---------|
| **Command Center** | Workspace dashboard | Intelligence entry point; AI Executive Summary, Priority Radar, Execution Momentum, Signal Heatmap. |
| **Signal Stream** | Feedback list | Dense stream with Impact Score, Urgency, Confidence %, Cluster, Status, Owner, Time decay, Velocity. Sort: Impact, Risk, Velocity, Recency. |
| **Execution Node** | Ticket view | Single signal in execution context. Inline AI, quick decision bar, Execution Plan, timeline, ownership. |
| **Insights** | — | AI Intelligence Layer: recurring patterns, cross-session overlap, escalation risk, delayed clusters, owner overload, trend graph. |

---

## Navigation model

- **Rail:** Command Center (⌘K), Inbox, Priorities, Sessions, **Insights (AI)**, Archive, Settings.
- **Command Center** = `/dashboard` (entry).
- **Signal Review** = `/dashboard/[sessionId]` (Signal Stream + Execution Node + Context column).
- **Insights** = `/dashboard/insights`.

---

## Modular component map

### Layout (operating-system)

- `FourZoneLayout` — Shell: optional Rail, Command Panel, Canvas, Context Column.
- `SystemNavigationRail` — Global rail; Command Center, Insights, Sessions, etc.
- `SignalStream` — Replaces issue list; impact/urgency/confidence/cluster, sort, bulk, keyboard.
- `ExecutionCanvas` — Execution Node: breadcrumb, title, status/priority, **inline AI block**, **quick decision bar**, 70/30 body.
- `ContextIntelligenceColumn` — Collapsible; AI recommendations, risk, related, ownership, workload.
- `TicketMetadata` — Created, Updated, Assignee (right column).
- `FeedbackCommandPanel` — Legacy issue list (kept for compatibility).

### Command Center

- `AIExecutiveSummaryBlock` — High impact, risk alerts, emerging pattern, bottleneck, momentum.
- `PriorityRadarBlock` — Critical / At Risk / Stalled / Trending.
- `ExecutionMomentumBlock` — Resolution velocity trend, avg time, owner load, confidence trend.
- `SignalHeatmapBlock` — Cluster/session density bars.

### Domain

- `lib/domain/signal.ts` — Signal, UrgencyLevel, RiskLevel, AIExecutiveSummary, PriorityRadarGroup, ExecutionMomentum, SignalHeatmapBucket, feedbackToSignal().
- `lib/domain/feedback-display.ts` — Status/priority display helpers.

### Pages

- `app/(app)/dashboard/page.tsx` — **Command Center** (insight blocks + sessions grid/table).
- `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` — **Signal Review**: FourZoneLayout + SignalStream + ExecutionCanvas + ContextIntelligenceColumn.
- `app/(app)/dashboard/insights/page.tsx` — **Insights** (patterns, overlap, risk, delays, owner load, trend placeholder).

---

## Interaction logic for AI suggestions

1. **Proactive:** Inline AI block under Execution Node header (suggested action + recommendations). No need to open a panel.
2. **Command Center:** Executive summary and Priority Radar drive "what to open first."
3. **Signal Stream:** Impact score and confidence % surface priority; sort by Impact/Risk/Velocity/Recency.
4. **Quick decision bar:** One-click Merge, Escalate, Assign, Resolve, Defer to reduce friction.
5. **Context column:** Secondary AI (recommendations, risk, related); collapsible so it doesn’t compete with main content.

---

## Backend mapping (prepared)

- **Signal** — Can be populated from API: `impactScore`, `urgency`, `confidencePercent`, `clusterLabel`, `resolutionVelocity`, `timeDecayHours`, `ownerId`/`ownerName`.
- **AI Executive Summary** — Endpoint can return `highImpactItems`, `riskAlerts`, `emergingPattern`, `bottleneck`, `momentum`.
- **Priority Radar** — API can return buckets (Critical, At Risk, Stalled, Trending) with signal ids.
- **Execution Momentum** — `resolutionVelocityTrend`, `avgResolutionTimeHours`, `ownerLoadBalance`, `confidenceScoreTrend`.
- **Insights** — Recurring patterns, cross-session overlap, escalation risk, delayed clusters, owner overload, time-series for trend graph.

All current UI uses synthesized data from sessions/counts and feedback; swap in real endpoints when ready.
