# FINAL LOCK Audit — Counts System

**Scope:** Feedback/session count aggregation after Phase 4.1–4.8 and leak removal.  
**Method:** Repo-wide search and path tracing (not only docs).  
**Date:** 2025-03-20

---

## 1. Source of Truth

**Searched:** `totalCount`, `openCount`, `resolvedCount`, `skippedCount`

**Verdict:** ✔ **CLEAN** (no UI leak from Firestore denormalized fields as an alternate “truth”)

**Evidence:**

- **Firestore / repos:** `openCount`, `resolvedCount`, `skippedCount`, `totalCount` on session documents are maintained in `lib/repositories/feedbackRepository.ts` and read for **server-side** resolution and repair in `lib/server/resolveSessionFeedbackCounts.ts`. That is internal optimization and reconciliation, not a parallel client-visible channel.
- **API responses:** `serializeSession` explicitly **strips** counter snapshots from session payloads so HTTP clients do not receive denormalized counters on `/api/sessions`-style responses (`lib/server/serializeSession.ts`).
- **Session list parsing:** `sessionFromApiItem` in `lib/domain/session.ts` only maps `id`, `title`, `archived`, `updatedAt` — it does **not** hydrate `openCount` / `totalCount` from JSON. Denormalized fields on the `Session` interface are type-level / Firestore-side only for this pipeline.
- **Web UI numbers:** Dashboard command center and cards use `SessionWithCounts.counts.{open,resolved,total}` populated only via `fetchCountsDedup` + `sessionCountsStore` (`useWorkspaceOverview.ts`, `useCommandCenterData.ts`, `WorkspaceCard.tsx` uses `counts.open`).
- **Session page:** `TicketList` receives `counts: { total, open, resolved, skipped }` from `useSessionFeedbackPaginated`, whose `counts` state is loaded from `getCounts` → `fetchCountsDedup` → `setCounts` (`useSessionFeedbackPaginated.ts`). `ensureCountsSeeded` in `SessionPageClient.tsx` seeds from those same hook values (which originate from the counts API path), not from a session document field on the client.
- **Extension:** `globalUIState.totalCount` / `openCount` / etc. are **local labels**; they are filled from `fetchFeedbackCount` after normalizing `{ total, open, skipped, resolved }` from the counts endpoint (`echly-extension/src/background.ts`), not from session docs exposed to the picker.

**Naming collision (allowed):** `ownerLoadBalance[].openCount` in `lib/domain/signal.ts` is a **synthetic aggregate** (`totalOpen` from `counts.open`), not the Firestore field.

---

## 2. API Contract

**Route:** `GET /api/feedback/counts` → `resolveSessionFeedbackCounts` in `app/api/feedback/counts/route.ts`.

**Verdict:** ✔ **CONSISTENT** for successful aggregation responses

**Success path (200):** Handler returns `NextResponse.json(counts)` where `counts` is always produced by `resolveSessionFeedbackCounts`, whose return type is `{ total, open, resolved, skipped }` in all branches:

| Path | Shape |
|------|--------|
| **TTL cache hit** (`getCachedCounts`) | Cached object with `total`, `open`, `resolved`, `skipped` |
| **Fast path** (session row consistent) | Same four keys from session row |
| **Repair path** (inconsistent denorm) | Recomputed from `feedback` collection, written back to session, returned with same four keys |

Non-200 responses (`400`, `403`, `404`, `500`) return error/suspended payloads — not part of the “counts contract” for happy path; clients should not treat those as authoritative counts.

**Note (client parse, not a contract break):** Web `parseSessionFeedbackCountsBody` coerces missing/non-numeric fields to `0`. Combined with no `res.ok` check in `fetchCountsDedup`, failed HTTP responses can surface as zeros instead of a hard error. That is **operational transparency**, not a second source of truth for successful loads.

---

## 3. Fetch Pipeline

**Searched:** `/api/feedback/counts`

**Verdict:** ✔ **GUARDED PIPELINE** on web; extension uses the same URL only inside its dedup wrapper

**Web:** The only `authFetch` to `/api/feedback/counts` is `lib/state/fetchCountsDedup.ts`. No other `*.ts` / `*.tsx` file issues that request directly.

**Extension:** `echly-extension/src/cachedSessions.ts` and `background.ts` pass a **callback** into `echly-extension/src/countsRequestStore.ts`’s `fetchCountsDedup`; the URL appears in that callback, not as a naked dedupe bypass.

---

## 4. Cache

**Verdict:** ✔ **CORRECT** pattern where the shared client store is used

Observed flow: **`getCounts` → `fetchCountsDedup` → `setCounts`** (and `subscribeCounts` for updates) in:

- `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` (`loadSessionsAndCounts`)
- `app/(app)/dashboard/sessions/page.tsx`
- `app/(app)/folders/[folderId]/page.tsx`
- `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts`

**Session page:** `SessionPageClient` uses `getCachedCounts` / `setCachedCounts` / `updateCachedCounts` for **optimistic transitions** aligned with the same `sessionCountsStore` keys that the hook hydrates from the counts API — not a separate cache semantics.

**Extension:** Separate in-memory caches (`cachedSessions` per-session totals, background `getCounts`/`setCounts`) are expected; both hydrate via extension `fetchCountsDedup`.

**Server:** `lib/server/cache/feedbackCountsCache.ts` TTL cache is invalidated from `feedbackRepository` on mutations (`invalidateCounts`) — aligns server fast path with writes.

---

## 5. Dedup

**Verdict:** ✔ **SOLID**

**Web:** `lib/state/countsRequestStore.ts` holds module-level `pendingRequests`; `lib/state/fetchCountsDedup.ts` clears the entry in a `finally` inside the async work so in-flight dedup always releases.

**Extension:** `echly-extension/src/countsRequestStore.ts` mirrors the same pattern (module-level map + `finally`).

Two implementations are **intentional** (different JS contexts).

---

## 6. Mutations

**Verdict:** ✔ **PURE** (no `GET /api/feedback/counts` from mutation routes)

- `app/api/feedback/post.ts` — no counts route usage; repository work + cache invalidation patterns.
- `app/api/tickets/[id]/route.ts` — PATCH/DELETE use `updateFeedbackResolveAndSessionCountersRepo` / `deleteFeedbackWithSessionCountersRepo` etc.; **no** HTTP call to the counts endpoint.
- Repository layer calls `invalidateCounts(sessionId)` on relevant writes (`lib/repositories/feedbackRepository.ts`), keeping server TTL cache coherent with mutations.

Client flows rely on **local store updates and/or refetch** via the guarded pipeline, not on firing counts GET from mutation handlers.

---

## 7. Extension

**Verdict:** ✔ **ALIGNED**

- Count fetches go through `fetchCountsDedup` (`countsRequestStore.ts`).
- Session lists use `sessionsArrayFromApiPayload` (`cachedSessions.ts`, `background.ts`) — no ad-hoc `json.sessions` parsing outside the domain helper.
- Counts are applied via explicit mapping to `{ total, open, skipped, resolved }` after fetch — not via Firestore repositories in the extension.

---

## 8. Parsing

**Searched:** `json.sessions` / `sessions` array from API

**Verdict:** ✔ **CONSISTENT**

`/api/sessions` payloads are narrowed through `sessionsArrayFromApiPayload` → `Reflect.get(data, "sessions")` only in `lib/domain/session.ts`. Call sites (`useWorkspaceOverview.ts`, `sessions/page.tsx`, extension) use that helper. No parallel “raw `sessions`” parsing path for the same concern was found.

---

## 9. Redundancy

**Verdict:** ✔ **ACCEPTABLE**

- **Pagination vs counts:** `GET /api/feedback?sessionId=…` returns `{ feedback, nextCursor, hasMore }` only (no `total` / `activeCount` in the live route). The hook still types optional page fields for legacy/defensive merges, but **list pagination does not introduce a second authoritative aggregate** for the UI; totals for `hasMore` logic are driven by counts state (`useSessionFeedbackPaginated.ts`).
- **Dual caches (server TTL + client store + extension)** are layered by design; server invalidation ties TTL to writes.

No duplicate logic was found that causes **divergent user-visible counts** or redundant counts **network** calls beyond intentional per-surface caching.

---

## 10. Final Verdict

### Architecture Score: **9 / 10**

Deduction: client-side counts fetch does not gate on `res.ok`, so rare HTTP failures can present as numeric zeros instead of a dedicated error state — not a source-of-truth split, but slightly weaker end-to-end guarantees.

### Status: **LOCKED 🔒**

All lock conditions are met:

- No UI-level inconsistency risk from exposing Firestore denormalized counters on session API payloads.
- Single **effective** user-visible source: `GET /api/feedback/counts` (plus validated local optimism on the same shape).
- No unguarded web fetch bypass for the counts URL.
- Mutations invalidate server count cache and do not depend on spurious counts GETs.

### Confidence: **HIGH**

The system is **stable and safe to treat as “done”** for architecture reviews; only minor operational hardening (HTTP status handling on the client) would be worth a future polish if you want **10/10** robustness under auth and error edge cases.

---

*This audit determines that the counts architecture is suitable for long-term maintenance without recurring “which number is real?” incidents, provided new features continue to use `fetchCountsDedup` + `sessionCountsStore` (web) or extension `fetchCountsDedup`, and session JSON continues to omit counter snapshots in API responses.*
