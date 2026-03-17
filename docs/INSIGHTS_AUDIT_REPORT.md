# INSIGHTS AUDIT REPORT

- **Workspace**: `BxUdPqReLsOHv0Yhg67e8u5tTy12`
- **Generated at**: `2026-03-17T16:42:53.129Z`
- **API base URL**: `http://localhost:3000`
- **API validation**: **FAILED** (fetch failed)
- **Result**: **FAIL**
- **Confidence score**: **0%**

## Raw counts (ground truth)

- **totalFeedbackRaw**: 41
- **totalCommentsRaw**: 1
- **timeSavedRaw (minutes)**: 205

## Insights doc values

- **insights.totalFeedback**: 0
- **insights.totalComments**: 0
- **insights.timeSavedMinutes**: 0
- **insights.issueTypes keys**: 0
- **insights.sessionCounts keys**: 0
- **insights.daily days**: 0

## Differences

Top mismatches (showing 12):

| Path | Expected (raw/doc) | Actual (doc/api) | Severity |
|---|---:|---:|---|
| `insights.totalComments` | `1` | `0` | **critical** |
| `insights.totalFeedback` | `41` | `0` | **critical** |
| `insights.daily.2026-03-11.feedback` | `1` | `0` | **high** |
| `insights.daily.2026-03-14.feedback` | `9` | `0` | **high** |
| `insights.daily.2026-03-15.feedback` | `13` | `0` | **high** |
| `insights.daily.2026-03-16.comments` | `1` | `0` | **high** |
| `insights.daily.2026-03-16.feedback` | `18` | `0` | **high** |
| `insights.issueTypes.general` | `41` | `0` | **high** |
| `insights.sessionCounts.cR9MT7qU9CWNdhZoR0zr` | `25` | `0` | **high** |
| `insights.sessionCounts.iQm1uBUEHyQXdp5fr9B3` | `1` | `0` | **high** |
| `insights.sessionCounts.s4U6Q4dlaOtO0WUaEb4V` | `15` | `0` | **high** |
| `insights.timeSavedMinutes` | `205` | `0` | **high** |

## Problems detected

- insights.totalFeedback is 0 but raw feedback > 0
- insights.totalComments is 0 but raw comments > 0
- insights.timeSavedMinutes is 0 but raw feedback > 0
- API validation failed: fetch failed

## UI validation (structural)

- Time saved is displayed from `data.lifetime.timeSavedMinutes` (lifetime), not range-filtered.
- Charts are derived from `analytics.daily` and then filtered by selected range via `filterDaily(daily, rangeDays)`.
- Range affects only the Activity chart + in-range totals; Issue Types and Top Sessions use lifetime `issueTypes` / `sessionCounts` (no range filtering).
- API (`GET /api/insights`) reads only `workspaces/{workspaceId}/insights/main` and maps fields 1:1 into `lifetime` and `analytics`.

## Snapshots (for debugging)

### Insights doc (normalized)

```json
{
  "totalFeedback": 0,
  "totalComments": 0,
  "timeSavedMinutes": 0,
  "issueTypes": {},
  "sessionCounts": {},
  "daily": {},
  "response": {
    "totalFirstReplyMs": 0,
    "count": 0
  },
  "updatedAt": null
}
```

### Raw ground truth (summary)

```json
{
  "totalFeedbackRaw": 41,
  "totalCommentsRaw": 1,
  "timeSavedRaw": 205,
  "issueTypesRawKeys": 1,
  "sessionCountsRawKeys": 3,
  "dailyRawDays": 4,
  "anomalies": 0
}
```

### API response (raw)

```json
null
```
