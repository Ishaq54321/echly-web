# Insights Analytics — Data Flow & Data Audit

**Date:** March 17, 2025  
**Scope:** Why charts/data are not showing after the workspace.stats system.  
**Focus:** Data flow + analytics (not performance).

---

## STEP 1: All analytics sources

| Term | File path | Function name | What it returns | Queries it runs |
|------|-----------|---------------|------------------|------------------|
| **computeInsights** | `lib/analytics/computeInsights.ts` | `computeInsights(workspace)` | `InsightsData` (lifetime/last30 counts + **empty** chart arrays) | **None** — delegates to `computeInsightsFromWorkspaceStats` |
| **computeInsightsFromWorkspaceStats** | `lib/analytics/computeInsights.ts` | `computeInsightsFromWorkspaceStats(workspace)` | Same shape; fills only from `workspace.stats`; **all chart arrays hardcoded empty** | **None** — one workspace doc already read by caller |
| **activity trend** | `app/(app)/dashboard/insights/page.tsx` | (page passes `issuesPerDay` to chart) | Renders `ActivityTrendChart` | None (consumes API response) |
| **feedbackHeatmap** | Same page | Passes `feedbackHeatmap` to `FeedbackHeatmap` | Renders heatmap | None |
| **responseSpeed** | Same page | Displays `responseSpeed.averageFirstReply` / `averageResolutionTime` | Text + `ResponseSpeedTrendChart` | None |
| **mostActiveSessions** | Same page | Passes `mostActiveSessions` to `MostActiveSessionsBarChart` | Bar chart | None |
| **issueTypeDistribution** | Same page | Passes `issueTypeDistribution` to `IssueTypeDonutChart` | Donut chart | None |

**Data flow:** `GET /api/insights` → `resolveWorkspaceForUser` (1 workspace read) → `computeInsights(workspace)` → returns `InsightsData`. No Firestore count/getDocs in the insights path.

---

## STEP 2: Previous implementation of /api/insights

**Source:** Git history `9ab326d` ("16.5 Revival success - insights charts") — `lib/analytics/computeInsights.ts` (old version).

### What the old implementation did

- **Scope:** **User-scoped** (`userId`), not workspace-scoped.
- **Queries:**
  1. **6 count queries:**  
     `getCountFromServer` on:  
     - feedback (lifetime: `userId`), feedback (last 30d: `userId` + `createdAt >= windowStart`)  
     - comments (same two)  
     - sessions (same two)
  2. **3 getDocs:**
     - Feedback: `where("userId","==",userId)`, `createdAt >= windowStart`, `orderBy("createdAt","desc")`, `limit(2000)`
     - Comments: same user + window, `orderBy("createdAt","asc")`, `limit(3000)`
     - Sessions: `where("userId","==",userId)`, `limit(500)`

### Data structures returned (old)

- **Lifetime / last30Days:** From the 6 count results.
- **issuesPerDay:** Built from feedback + comments in memory: bucket by ISO date, sum issues and replies per day.
- **issueTypeDistribution:** From feedback docs: `type` → count, then percentage of total.
- **mostActiveSessions:** From feedback: group by `sessionId` → count; join session names from sessions getDocs; top 5.
- **responseSpeed / responseSpeedTrend:** From feedback + comments: first comment per feedback → first-reply time; bucket by week (e.g. 2026-W10); resolution from feedback.createdAt → lastCommentAt for resolved.
- **feedbackHeatmap:** From feedback + comments: bucket by `dayOfWeek` (0–6) and `hourOfDay` (0–23), count.
- **resolvedDiscussions:** Count of feedback with `status === "resolved"`.
- **mostCommentedSessions / mostReportedIssueTypes:** From feedback (commentCount, type) + session names.

### How charts were built

- **Activity trend:** `issuesPerDay` (date, issues, replies) → line/area chart.
- **Donut:** `issueTypeDistribution` (type, count, percentage).
- **Most active sessions:** `mostActiveSessions` (sessionId, sessionName, issues) → horizontal bar.
- **Response speed:** `responseSpeedTrend` (week, averageFirstReplyMs) → line; scalars from averages.
- **Heatmap:** `feedbackHeatmap` (dayOfWeek, hourOfDay, count) → scatter/cell chart.

---

## STEP 3: OLD vs NEW

| Aspect | OLD | NEW |
|--------|-----|-----|
| **Data sources** | feedback (getDocs 2000), comments (getDocs 3000), sessions (getDocs 500) + 6 count queries | **workspace.stats only** (one workspace doc read by resolver) |
| **Scope** | User (`userId`) | Workspace (`workspaceId` via workspace.stats) |
| **Computed fields** | issuesPerDay, issueTypeDistribution, mostActiveSessions, responseSpeedTrend, feedbackHeatmap, responseSpeed, resolvedDiscussions, mostCommentedSessions, mostReportedIssueTypes | From stats: lifetime/last30 totals (issuesCaptured, repliesMade, sessionsReviewed, timeSavedHours), timeSaved formatted. **All chart arrays and response-speed/resolved/most-commented/most-reported are hardcoded empty or "—".** |

**Conclusion:** The new system intentionally avoids all heavy queries. In doing so, it **never populates** any of the chart or breakdown fields; it only fills the scalar totals from `workspace.stats`.

---

## STEP 4: Why each UI component is empty

| UI component | Data it expects | Why it is now empty |
|--------------|------------------|----------------------|
| **Activity trend** | `issuesPerDay`: `{ date, issues, replies }[]` | `computeInsightsFromWorkspaceStats` returns `issuesPerDay: []`. No daily buckets exist in workspace.stats. |
| **Feedback type distribution** | `issueTypeDistribution`: `{ type, count, percentage }[]` | Returned as `[]`. workspace.stats has no breakdown by `type`. |
| **Most active sessions** | `mostActiveSessions`: `{ sessionId, sessionName, issues }[]` | Returned as `[]`. workspace.stats has no per-session counts. |
| **Response speed** | `responseSpeed`: `{ averageFirstReply, averageResolutionTime }` (string); `responseSpeedTrend`: `{ week, averageFirstReplyMs }[]` | responseSpeed is `"—"`; responseSpeedTrend is `[]`. No comment/feedback docs are read, so no first-reply or resolution times. |
| **Heatmap** | `feedbackHeatmap`: `{ dayOfWeek, hourOfDay, count }[]` | Returned as `[]`. No time-of-day/day-of-week data in workspace.stats. |
| **Resolved discussions** | `resolvedDiscussions`: number | Always `0`. Stats don’t track resolved count. |

All chart components already handle empty data with a “Not enough data yet…” (or similar) message, so the UI renders but shows no curves/bars/slices.

---

## STEP 5: Firestore structure (what we have)

### feedback

- **Relevant fields:** `workspaceId`, `sessionId`, `type`, `createdAt`, `status` (open/resolved/skipped), `commentCount`, `lastCommentAt`.
- **Timestamps:** Yes — `createdAt` (and `lastCommentAt`) for trends and response speed.
- **Types:** Yes — `type` for distribution.
- **Session linkage:** Yes — `sessionId` for “most active sessions” and session names (sessions have `title`).

### comments

- **Relevant fields:** `workspaceId`, `feedbackId`, `sessionId`, `createdAt`.
- **Timestamps:** Yes — for reply trends and first-reply time.
- **Session linkage:** Yes — for per-session reply counts if needed.

### sessions

- **Relevant fields:** `workspaceId`, `title`, `createdAt`, `feedbackCount`, `openCount`, `resolvedCount`, etc.
- **Timestamps:** Yes — for “last 30 days” sessions.
- **Session linkage:** N/A (doc id = sessionId); used to map sessionId → sessionName.

**Conclusion:** Firestore has everything needed to recompute the same chart data as the old implementation, but **by workspace** (workspaceId) instead of by user (userId). The blocker is that the **current API deliberately does no collection reads** for insights — it only reads the workspace doc and uses `workspace.stats`.

---

## STEP 6: Pre-aggregated / cached analytics data

- **workspace.stats:** Pre-aggregated **scalars only**: `totalFeedback`, `totalComments`, `totalSessions`, `last30DaysFeedback`, `last30DaysComments`, `last30DaysSessions`, `updatedAt`.
  - **last30Days*:** Only set in `scripts/backfillWorkspaceStats.ts` (to 0). **No write path increments them** (feedback/comment/session create/delete only update `stats.totalFeedback`, `stats.totalComments`, `stats.totalSessions`). So “last 30 days” metrics are currently always 0 unless another mechanism exists.
- **daily stats:** Not present. No collection or subcollection for daily buckets.
- **analytics / cached insights / metrics collections:** None. No dedicated analytics or metrics collection; no cached insights docs.

---

## STEP 7: Final structured report

### 1. Available analytics data (what we CAN use)

- **From one workspace doc read (current path):**
  - `workspace.stats.totalFeedback`, `totalComments`, `totalSessions` → lifetime counts and time-saved.
  - `workspace.stats.last30DaysFeedback`, `last30DaysComments`, `last30DaysSessions` → **currently 0** unless last30* is backfilled or written elsewhere.
- **From Firestore (if we add read path again, with care):**
  - **feedback:** `workspaceId`, `sessionId`, `type`, `createdAt`, `status`, `lastCommentAt`, `commentCount` → activity trend (by day), issue type distribution, most active sessions, heatmap, resolution count, first-reply/resolution times.
  - **comments:** `feedbackId`, `createdAt` → reply trend, first-reply time per feedback.
  - **sessions:** `title` (and id) → session names for “most active sessions”.

So: **scalar totals** are available from stats; **chart and breakdown data** are available only from feedback/comments/sessions reads (or from new pre-aggregation).

### 2. Missing data (current state)

- **Chart data:** All of it — issuesPerDay, issueTypeDistribution, mostActiveSessions, responseSpeedTrend, feedbackHeatmap.
- **Scalar chart-related:** responseSpeed (average first reply / resolution), resolvedDiscussions, mostCommentedSessions, mostReportedIssueTypes.
- **Optional:** last30Days* in stats are defined but not maintained on writes, so last-30-days scalars are effectively 0.

### 3. Why the current UI is empty

- **Root cause:** Insights were refactored to use **only** `workspace.stats` (one workspace read, no count/getDocs). `computeInsightsFromWorkspaceStats` was implemented to return the same `InsightsData` shape but **leaves all chart and breakdown arrays empty** and response speed / resolved to placeholders.
- **Design comment in code:** “Chart data (donut, bar, heatmap, response speed) is left empty; can be added later via daily buckets or optional heavy query.”
- So the UI receives valid JSON with empty arrays and "—" and correctly shows “Not enough data yet…” for every chart.

### 4. Best way to restore charts WITHOUT heavy queries

**Constraint:** No full collection scans; no getDocs(1000)-style solutions.

**Options (efficient):**

1. **Pre-aggregate at write time (recommended for scale)**  
   - **Daily buckets:** On feedback/create (and optionally comment create), update a workspace-level structure, e.g. `workspace.stats.dailyBuckets[{ date }] = { issues, replies }` (or a subcollection `workspaces/{id}/dailyStats/{date}`), with bounded keys (e.g. last 90 days).  
   - **Type counts:** e.g. `workspace.stats.byType[{ type }] = count` (increment on create, decrement on delete).  
   - **Per-session counts:** Already have session-level `feedbackCount`; “most active” = sort sessions by feedbackCount and take top N (requires a separate **bounded** read of session list, e.g. by workspaceId, limit 50, orderBy feedbackCount desc — needs an index).  
   - **last30Days*:** On each feedback/comment/session write, if the doc’s `createdAt` is within last 30 days, increment the corresponding `stats.last30Days*` (and optionally decrement when aging past 30d via a scheduled job or on next read with a one-time correction).  
   - **Response speed / heatmap:** Either small bounded queries (e.g. last 100 feedback + their first comment) or optional background job that writes pre-aggregated “last 4 weeks” response-speed buckets and heatmap bins into workspace or a small analytics doc.

2. **Bounded read path (no full scans)**  
   - **Activity trend:** Query feedback with `workspaceId == X`, `createdAt >= 30d ago`, `orderBy("createdAt")`, `limit(500)` (or 1000). In-memory bucket by date; same for comments for “replies” series.  
   - **Issue type distribution:** Same feedback query; group by `type` in memory.  
   - **Most active sessions:** Query sessions with `workspaceId == X`, `orderBy("feedbackCount","desc")`, `limit(10)` — single indexed query, no feedback scan.  
   - **Response speed trend:** From the same bounded feedback query, get feedback ids; then comments where `feedbackId in [...]` with limit (or one query per feedback for first comment — keep N small). Compute first-reply per feedback, then bucket by week.  
   - **Heatmap:** Same bounded feedback (and optionally comments) by createdAt; bucket dayOfWeek + hourOfDay in memory.  
   All with strict limits and composite indexes so no full collection scans.

3. **Hybrid**  
   - Use workspace.stats for lifetime/last30 **scalars** and time-saved.  
   - Add **only** the bounded queries above for charts (or add pre-aggregation for daily/type/session so that charts can be built from workspace doc + one small sessions query for “most active”).

**Recommendation:**  
- **Short term:** Implement **bounded read path** (option 2) with explicit limits and indexes; keep workspace.stats for scalars.  
- **Medium term:** Add **write-path pre-aggregation** (daily buckets, byType, last30Days*) and optional sessions query for “most active” so that charts can be restored with minimal read cost and no large getDocs.

---

## Summary table

| Data / Chart           | In workspace.stats? | In Firestore? | Why UI empty now |
|------------------------|----------------------|---------------|-------------------|
| Lifetime totals        | Yes                  | Yes           | Shown (from stats) |
| Last 30d totals       | Yes (but not updated)| Yes           | Shown as 0 (last30* not written) |
| Activity trend         | No                   | Yes (createdAt) | stats-only path returns [] |
| Issue type distribution| No                   | Yes (type)    | stats-only path returns [] |
| Most active sessions   | No                   | Yes (sessionId + session.feedbackCount) | stats-only path returns [] |
| Response speed         | No                   | Yes (feedback + comments) | stats-only path returns "—" and [] |
| Heatmap                | No                   | Yes (createdAt) | stats-only path returns [] |
| Resolved discussions   | No                   | Yes (status)  | stats-only path returns 0 |

---

*End of audit.*
