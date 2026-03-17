# Insights System — Full Production Audit (Performance, Cost, Correctness, Architecture)

Date: 2026-03-17  
Scope: `/api/insights` + insights repositories + in-memory caching + in-memory computation (`computeInsightsFromFetchedData`)

This document is designed to be **complete and sendable** for scoring + next-phase optimization planning. It pairs a system-level architecture view with concrete, production-safe instrumentation you can run immediately.

---

## 1. SYSTEM OVERVIEW

The Insights system is a **hybrid analytics endpoint**: it resolves the authenticated user’s workspace, fetches **bounded** Firestore datasets for charts (recent feedback, recent comments, and top sessions), computes chart-ready aggregates in-memory, and returns a single `InsightsData` payload. It uses a **short-lived, per-workspace+range in-memory cache** (TTL 60s) to avoid repeated reads and compute work across rapid page refreshes.

---

## 2. PERFORMANCE

### What is measured (now instrumented)

`/api/insights` logs the following timings (ms):

- **`INSIGHTS TOTAL TIME`**: end-to-end handler duration (auth → resolve workspace → cache check → fetch → compute → JSON return)
- **`INSIGHTS FETCH TIME`**: time spent inside the `Promise.all([...])` Firestore fetch block
- **`INSIGHTS COMPUTE TIME`**: time spent inside `computeInsightsFromFetchedData(...)`

It also logs:

- **`INSIGHTS CACHE`**: `{ key, hit }` for cache hit-rate observation
- **`QUERY METRICS`** (per repo): `{ collection, count, limit }`
- **`INSIGHTS RANGE VALIDATION`**: automatic diff logging when the same workspace is requested with `range=7d` vs `range=30d` in the same server process

### How to read the logs (bottleneck identification)

- If **`INSIGHTS FETCH TIME` ≫ `INSIGHTS COMPUTE TIME`**, you’re I/O bound (Firestore reads / indexes / cold caches).
- If **`INSIGHTS COMPUTE TIME` ≫ `INSIGHTS FETCH TIME`**, you’re CPU bound (aggregation and transformations; consider data shapes, pre-aggregation, or streaming).
- If **`INSIGHTS TOTAL TIME`** is much larger than `fetch + compute`, overhead is likely in:
  - auth + workspace resolution
  - JSON serialization (large payloads)
  - excessive logging volume (especially RAW array logs)

### Expected slowest part (most likely)

Given the current design (bounded Firestore getDocs + in-memory aggregation), the likely slowest portion in production is:

- **Firestore getDocs** for the bounded arrays (feedback 300, comments 500, sessions 10), especially under cold index/cache conditions or cross-region latency.

### “Avg response time” guidance

This audit adds instrumentation; to produce a real average you should:

- Hit `GET /api/insights?range=7d` at least 20–50 times with cache disabled (`nocache=1`) and record `INSIGHTS TOTAL TIME`.
- Repeat for `range=30d`.
- Then measure again with cache enabled to compute an observed hit rate and “warm” averages.

> Note: the endpoint is cached for 60s; “avg” should be reported separately for **cold** (nocache) and **warm** (cache enabled) behavior.

### Observed measurements (local dev run)

Captured from a local dev server by hitting:

- `GET /api/insights?range=7d&nocache=1` with `x-debug-uid: debug`
- `GET /api/insights?range=30d&nocache=1` with `x-debug-uid: debug`

Results (debug workspace had **0 docs**, so compute is near-zero; fetch represents Firestore roundtrip + SDK overhead):

- `range=7d` (first call; cold-ish):
  - **INSIGHTS FETCH TIME**: ~657ms
  - **INSIGHTS COMPUTE TIME**: ~2ms
  - **INSIGHTS TOTAL TIME**: ~2800ms
- `range=30d` (second call):
  - **INSIGHTS FETCH TIME**: ~646ms
  - **INSIGHTS COMPUTE TIME**: ~0.6ms
  - **INSIGHTS TOTAL TIME**: ~650ms

Interpretation:

- The endpoint is primarily **fetch/I-O bound** in this run.
- The first request’s total time indicates additional overhead (dev server warmup, module compile, workspace resolution, logging).

### Cache hit rate notes (important)

The endpoint logs `INSIGHTS CACHE: { hit, used, disableCache }`.

- In local dev, `disableCache` is typically `true` (dev mode bypass), so you may see `hit: true` but `used: false`.
- In production, `disableCache` should be `false` (unless `INSIGHTS_AUDIT=1` or `nocache=1` is set), and cache “used” becomes meaningful for hit-rate measurement.

---

## 3. FIRESTORE COST

### Reads per request (assumptions)

Per request (bounded reads), assume:

- feedback query ≈ **300 reads**
- comments query ≈ **500 reads**
- sessions query ≈ **10 reads**

**Total per request ≈ 810 reads**

> This estimate intentionally ignores “workspace resolve” and any other incidental reads; treat it as the Insights *marginal* cost.

### Estimated daily/monthly reads

Assume:

- **1,000 users/day**
- **3 visits per user/day**

Requests/day = \(1{,}000 \times 3 = 3{,}000\)

Reads/day = \(3{,}000 \times 810 = 2{,}430{,}000\)

Reads/month (30d) = \(2{,}430{,}000 \times 30 = 72{,}900{,}000\)

### Approx Firebase / Firestore cost

Firestore document reads are priced per 100,000 reads, commonly quoted as **$0.06 / 100,000 reads** (region/edition dependent; verify in your billing region using the official pricing page).

Monthly reads in 100k units: \(72{,}900{,}000 / 100{,}000 = 729\)

Approx monthly read cost: \(729 \times 0.06 = \$43.74\)

**Estimated monthly reads:** ~72.9M  
**Approx monthly cost (reads only):** **~$44**

> This does not include writes, storage, network egress, or other API calls.

---

## 4. DATA ACCURACY

### What is checked (now instrumented)

The endpoint logs:

- **`INSIGHTS FETCH TOTALS`**: fetched array sizes for feedback/comments/sessions
- **`INSIGHTS STATS COMPARISON`**:
  - `workspaceStats` totals: `totalFeedback`, `totalComments`, `totalSessions`
  - `fetchedTotals` totals: based on the bounded arrays returned to Insights
  - `mismatches`: `fetched - stats`
  - `confidencePct`: derived from mismatch magnitude vs totals

### Interpreting mismatches

Important: Insights uses **bounded** arrays for charts, while `workspace.stats` is intended to represent **lifetime** totals.

Therefore:

- **A mismatch is expected** if you compare bounded fetched arrays (300/500/10 caps) against lifetime stats.
- The confidence score here is best interpreted as a **sanity signal**:
  - High confidence only when totals are small enough that bounds don’t truncate
  - Lower confidence indicates truncation (expected) or stats drift (possible)

### Confidence level (%)

The endpoint currently logs `confidencePct` as:

- \(1 - \frac{\lvert\Delta feedback\rvert + \lvert\Delta comments\rvert + \lvert\Delta sessions\rvert}{totalFeedback + totalComments + totalSessions}\) × 100

Use this as a rough indicator; it is not a formal statistical confidence interval.

---

## 5. EDGE CASES

### Detected and logged (now instrumented)

The endpoint logs `INSIGHTS EDGE CASES` counters for:

- feedback without `sessionId`
- comments without `feedbackId`
- missing `createdAt` timestamps (feedback/comments)
- sessions missing `feedbackCount`
- negative values:
  - sessions with `feedbackCount < 0`
  - feedback with `commentCount < 0`

These are correctness + data hygiene indicators and should generally be **0**. Any non-zero values should be treated as a production data quality issue (or a migration/backfill artifact).

---

## 6. ARCHITECTURE EVALUATION

### Strengths

- **Bounded queries by design** (hard limits) reduce unbounded Firestore spend.
- **Short TTL cache** improves perceived performance and reduces repeated reads during navigation.
- **In-memory aggregation** avoids additional Firestore count/aggregation operations per chart.
- **Simple operational model**: one endpoint, predictable read volume, minimal dependencies.

### Risks / concerns

- **Memory cache is per-process**:
  - In serverless/multi-instance, hit rate may be lower than expected (cold starts, horizontal scaling).
  - Cache invalidation is time-based only (TTL), not event-based.
- **Logging volume risk**:
  - RAW array logs can be large and may increase latency/cost in production logging pipelines.
- **Stats vs bounded reads correctness framing**:
  - Comparing bounded arrays to lifetime stats can be misleading; interpretation must account for truncation.
- **Index dependency**:
  - Composite indexes are required; missing/slow indexes can turn into latency spikes or errors.

---

## 7. FINAL SCORE (0–10)

These are rubric targets; fill with real values after you gather logs.

- **Performance**: _/10  
  - Target: low p95 total time, stable fetch time, small compute time, high cache hit rate.

- **Cost efficiency**: _/10  
  - Target: predictable bounded reads; high cache hit rate; avoid additional counts/scans.

- **Data accuracy**: _/10  
  - Target: edge cases ~0; stats drift understood; charts consistent across ranges.

- **Scalability**: _/10  
  - Target: behaves under multi-instance; future path to shared cache or pre-aggregation.

---

## Appendix A — Instrumentation Map (what changed)

### `/api/insights`

Added logs for:

- Total/fetch/compute timings
- Cache hit-rate
- Firestore fetched totals
- Workspace stats comparison + mismatch summary + confidence %
- Edge case detection counters
- Range validation diffs (7d vs 30d)

### Repositories

Added query metrics logs:

- feedback (`getWorkspaceFeedbackForInsightsRepo`)
- comments (`getWorkspaceCommentsForInsightsRepo`)
- sessions (`getWorkspaceSessionsByFeedbackCountRepo`)

Each logs:

```text
QUERY METRICS: { collection, count, limit }
```

