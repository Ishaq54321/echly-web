# Phase 6.7 — System Certification Audit

**Scope:** Read-only review of the repository as of the audit date. No code was modified.

**Method:** Static search (`openCount` / `resolvedCount` / `totalCount` / `feedbackCount`), legacy symbol search, targeted reads of write paths, hooks (`useSessionFeedbackPaginated`, `useWorkspaceOverview`, `useSessionOverview`), extension `src/`, share surface, and API routes.

---

## Step 1 — Source of Truth (Global)

### Verdict: **PASS** (runtime product surfaces)

**Rule checked:** Display and hook-level ticket totals for sessions must come from session document fields (`openCount`, `resolvedCount`, `totalCount`, and/or `feedbackCount` on the same session row), not from aggregating the feedback collection in the client UI or in a parallel counts HTTP API.

**Findings:**

- **Dashboard:** `useWorkspaceOverview.ts` maps `countsFromSessionFields(session)` from the Firestore `sessions` query snapshot (`mapSessionDoc` reads the four counter fields). No `hydrateCountsForSessionIds` / per-session counts HTTP fan-out remains in TypeScript.
- **Session page:** `useSessionFeedbackPaginated.ts` sets `total` / `open` / `resolved` from `onSnapshot(doc(db, "sessions", sessionId))` only. The feedback `onSnapshot` builds the ticket list only.
- **Overview:** `useSessionOverview.ts` sets `countsByStatus` via `countsFromSession(session)` after `getSessionById` (session document), not from preview fetches.
- **Share:** `PublicShareSessionView.tsx` derives `listCounts` from `session.totalCount` / `session.openCount` / `session.resolvedCount` in the server-provided payload.
- **Extension (source):** `echly-extension/src/background.ts` loads counts via `GET /api/sessions/:sessionId` and parses `openCount`, `resolvedCount`, `totalCount` / `feedbackCount` from `json.session`. Session list uses `GET /api/sessions`, which maps counters from each session document in `app/api/sessions/route.ts`.
- **API serialization:** `lib/server/serializeSession.ts` documents and passes through session counter fields for clients.

**`totalCount` vs `feedbackCount`:** Several call sites use the pattern “prefer `totalCount`, else `feedbackCount`” on the **same** session object. That is field aliasing on one document, not a second source of truth.

**Files that reference session-level ticket counts (non-exhaustive but complete for this audit’s grep pass):**

| Area | Files |
|------|--------|
| Domain / serialization | `lib/domain/session.ts`, `lib/server/serializeSession.ts`, `lib/server/publicShareSanitize.ts` |
| Repositories / server writes | `lib/repositories/feedbackRepository.server.ts`, `lib/repositories/sessionsRepository.server.ts`, `lib/repositories/sessionsRepository.ts`, `lib/server/resolveAllOpenFeedbackInSession.ts` |
| Hooks / pages | `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`, `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`, `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts`, `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`, `app/(app)/dashboard/[sessionId]/overview/page.tsx` |
| API | `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts` (via `serializeSession`) |
| UI | `components/share/PublicShareSessionView.tsx`, `components/session/FeedbackSidebar.tsx`, `components/session/SessionHeader.tsx`, `components/command-center/ExecutionMomentumBlock.tsx`, `lib/capture-engine/core/CaptureWidget.tsx`, `lib/capture-engine/core/ResumeSessionModal.tsx`, `lib/capture-engine/core/types.ts` |
| Extension | `echly-extension/src/background.ts`, `echly-extension/src/content.tsx`, `echly-extension/src/cachedSessions.ts` |
| Scripts (maintenance) | `scripts/rebuildSessionCounts.ts`, `scripts/verifySessionCounts.ts`, `scripts/deleteSkippedFeedback.ts` |

**Out of scope for “card totals” but related:** Workspace/session **inventory** counts (e.g. number of sessions) may use Firestore `count()` in `sessionsRepository.server.ts` — that is not per-session ticket `openCount` / `resolvedCount` / `totalCount`.

---

## Step 2 — Zero Fallback System

### Verdict: **PASS** (for session ticket counts)

**Searches:** `fallback`, `recompute`, `derive`, `recalculate`, “counts missing” (case-insensitive) across `*.{ts,tsx,js}`.

**Counts-specific:** No runtime path was found that, when session counters are missing or stale, recomputes totals from a feedback query or calls a removed counts API. Reads default numeric fields to `0` or choose between `totalCount` and `feedbackCount` on the session row only.

**Unrelated matches (not ticket-count fallbacks):** React `Suspense fallback`, billing/plan “fallback”, auth “fallback”, AI `fallbackStructuredFeedback`, `ErrorBoundary` fallback UI, `SessionPageClient` comment “Fallback: selected ticket…” (navigation), `num(value, fallback)` helper parameters, etc.

**Operator / offline tooling:** `scripts/rebuildSessionCounts.ts` explicitly recomputes counters from the feedback collection and writes the session document — intentional maintenance, not a UI/API shadow path.

---

## Step 3 — Recalculation Check

### Verdict: **PASS** for **displayed session totals**; **documented non-goals**

- **`useSessionFeedbackPaginated.ts`:** Uses `.filter()` to build `openFeedback` / `resolvedFeedback` **lists** from the loaded snapshot. Exposed totals (`total`, `activeCount`, `resolvedCount`) come from the **session** `onSnapshot`, not from `.length` on those arrays.
- **`.reduce()` / `.filter().length`:** No instance was found that derives `openCount` / `resolvedCount` / `totalCount` for UI from feedback rows. Repository-wide `reduce` usages found (insights charts, admin usage, list flattening) are unrelated to session ticket totals.
- **Firestore aggregation:** No `getCount()`/aggregate usage was found on the **feedback** collection for session ticket totals. `sessionsRepository.server.ts` uses `.count()` for **workspace session list size** (different metric).
- **Maintenance scripts:** `scripts/rebuildSessionCounts.ts` scans feedback to set session fields; `scripts/verifySessionCounts.ts` compares session doc vs scanned feedback — by design, not runtime display.

---

## Step 4 — Write Layer (`lib/repositories/feedbackRepository.server.ts`)

### Verdict: **PASS** (primary paths); **notes** below

| Operation | Implementation | Notes |
|-----------|----------------|--------|
| **Create** | `addFeedbackWithSessionCountersRepo` — single `runTransaction`: creates feedback, sets `openCount`, `resolvedCount`, `totalCount`, `feedbackCount` (`totalCount`), `Math.max(0, …)` on inputs | Also updates workspace stats and insights; in scope for counters: consistent. |
| **Resolve / reopen** | `updateFeedbackResolveAndSessionCountersRepo` — transaction: read feedback + session, optional `tx.update(feedbackRef)`, then session counters with swap logic when `wasStatus !== toStatus`, `totalCount = open + resolved`, `feedbackCount = totalCount` | `updateFeedbackRepo` updates feedback only **without** session counters — used when **no** resolve/reopen is applied (`app/api/tickets/[id]/route.ts` branches on `statusChange`). |
| **Delete** | `deleteFeedbackWithSessionCountersRepo` — transaction: soft-delete feedback, decrement open or resolved, recompute `totalCount` / `feedbackCount`, floor at 0 | API `DELETE /api/tickets/[id]` calls this repo. |

**Transactional coverage:** Create, resolve/reopen (counter path), and delete use Firestore transactions for feedback + session counter updates. **Non-transactional** `updateFeedbackRepo` is intentional for non-status patches.

**Negative counts:** Counter math uses `Math.max(0, …)` in the transactional paths reviewed.

**Other server writer:** `lib/server/resolveAllOpenFeedbackInSession.ts` batches `status: "resolved"` on open feedback and adjusts `openCount` / `resolvedCount` on the session. It does not rewrite `totalCount` / `feedbackCount` in the same update; for a consistent session, total is unchanged when moving items from open → resolved. If those fields were previously wrong, this path does not repair them.

---

## Step 5 — Legacy System Removal

### Verdict: **PASS** in **TypeScript source**; **artifact caveat**

**Searched:** `/api/feedback/counts`, `fetchCounts`, `fetchCountsDedup`, `sessionCountsStore`, `resolveSessionFeedbackCounts`, `countsRequestStore`.

- **`*.{ts,tsx}`:** No matches.
- **Committed extension bundle:** `echly-extension/background.js` (minified) still matches grep for legacy substrings such as `/api/feedback/counts` / `fetchCountsDedup` in this workspace. **`echly-extension/src/`** does not reference those symbols. Treat as **stale build output** until regenerated from current sources.
- **`audit/*.md` and `docs/audits/*`:** Historical documents still name removed modules (expected for archives; not runtime).

---

## Step 6 — Snapshot Purity

### Verdict: **PASS**

- **`useSessionFeedbackPaginated.ts`:** Feedback `onSnapshot` only updates the in-memory ticket list and loading flags. Counts are updated only in the separate session-doc `onSnapshot`. No `authFetch` / counts API / count “hydration” inside the feedback listener.
- **`useWorkspaceOverview.ts`:** Sessions `onSnapshot` only; counts are derived per row from session fields; `refreshSessions` is a no-op placeholder (comment states counts live on documents).

---

## Step 7 — Query Model Certification

### Verdict: **PASS** (aligned with Phase 6.7 intent)

| Surface | Sessions / session meta | Feedback list | Count fetch |
|--------|-------------------------|-----------------|-------------|
| **Dashboard** | One Firestore query: `sessions` where `workspaceId`, `orderBy updatedAt`, `limit(30)` | N/A | None beyond fields on session docs in that snapshot |
| **Session page** | One `onSnapshot` on `sessions/{sessionId}` for counters | One `onSnapshot` on `feedback` where `workspaceId` + `sessionId` | No separate counts HTTP API |
| **Overview** | `getSessionById` + Firestore-backed session for counts | `getSessionFeedbackByResolved` / comments / by-ids for **previews and activity**, not for metric totals | Metric totals from session doc via `countsFromSession` |
| **Share** | Initial payload | Client state for incremental updates per product | Counts from `session` fields in payload (`PublicShareSessionView`) |
| **Extension** | `GET /api/sessions`, `GET /api/sessions/:id` | `GET /api/feedback?…` for pages | Counts from session JSON only (not from list length) |

---

## Step 8 — Extension Consistency

### Verdict: **PASS** (source); **PARTIAL** (committed bundle)

- **`echly-extension/src/`:** No `countsRequestStore`, no `/api/feedback/counts`, no `fetchCounts*` references (grep). Counts parsed from session API responses; list fetches use `/api/feedback`.
- **`echly-extension/background.js`:** See Step 5 — possible stale strings in minified output.

---

## Step 9 — Data Model Consistency

### Verdict: **PARTIAL**

- **Canonical write path:** `feedbackRepository.server.ts` uses `status: "open" | "resolved"` for counter logic; create payload defaults `status` to `"open"`.
- **Domain / readers still allow legacy shapes:** e.g. `lib/domain/feedback.ts` mentions `processing`; `lib/domain/normalizeTicketStatus.ts` maps `processing` → `open`; client `lib/repositories/feedbackRepository.ts` `docToFeedback` treats `status === "done"` as resolved for `isResolved`. So **stored / legacy data** may not be strictly only `"open"` | `"resolved"` everywhere, but **counters and server transactions** are aligned to open/resolved semantics.
- **Session document:** Type and serializers include `openCount`, `resolvedCount`, `totalCount`, `feedbackCount`.
- **`isResolved`:** Used as an input on PATCH (mapped to `status`) and mirrored on domain objects; **session totals** are not driven by aggregating `isResolved` from the client list in the certified hooks.

---

## Step 10 — Architecture Purity

### Verdict: **PASS** (clean split for ticket counts)

- **Writes:** Feedback create/update/delete paths that affect ticket totals go through **Admin SDK** repositories and API routes (e.g. `app/api/feedback/post.ts`, `app/api/tickets/[id]/route.ts`).
- **Reads (app):** Dashboard and session page use **client Firestore** snapshots; extension uses **HTTP** session endpoints backed by server reads — not a second client-side counter cache store.
- **No parallel counts store** in TypeScript (`sessionCountsStore` removed).

---

## Step 11 — Dead Code / Artifacts

### Verdict: **PARTIAL**

- **Removed modules:** No TypeScript imports of deleted counts-store / dedup / resolve-counts API paths were found.
- **Possible stale artifact:** `echly-extension/background.js` may not match `src/` (legacy string grep). Dead-code / bundle hygiene is an **artifact/build** concern, not proven unused-function analysis across the whole repo in this audit.

---

## Final Certification

### 1. Deterministic system

**YES** for runtime behavior **given** session documents are authoritative and writes use the transactional paths above. Determinism is **conditional** on data migration (legacy `status` / `done` / `processing`) and optional bulk tools (`resolveAllOpenFeedbackInSession`, maintenance scripts).

### 2. Single source of truth

**YES** for **per-session ticket totals** in the web app, share view, and extension **source**: the session row’s counter fields (with `totalCount`/`feedbackCount` aliasing on the same doc).

### 3. No fallback system

**YES** for **runtime** ticket-count behavior (no feedback-scan fallback in UI/API/extension `src`). **No** if interpreted to forbid **maintenance** scripts that rescan feedback — those exist by design.

### 4. No recomputation

**YES** for **displayed** totals (not derived from list `filter`/`length`/`reduce`). **Maintenance / verification scripts** do recompute from feedback for repair or audit.

### 5. Clean architecture

**CLEAN** for the ticket-count architecture in application TypeScript (session-backed counters, transactional writes, Firestore listeners without counts API coupling). **PARTIAL** overall due to legacy status handling in mappers and the extension bundle artifact.

### 6. Risk level

**MEDIUM**

- Stale **`echly-extension/background.js`** may confuse audits or load outdated behavior if shipped without rebuild.
- Legacy **status** values and client **`done`** handling imply edge-case drift until data is normalized.
- **`resolveAllOpenFeedbackInSession`** does not refresh `totalCount`/`feedbackCount` fields in the same write (usually redundant mathematically).

### 7. Phase 6.8 readiness

**READY** — **provided** the following are accepted:

1. Runtime code paths for ticket counts match Phase 6.7 (session doc only; no TS legacy counts API/store).
2. **`echly-extension/background.js`** is rebuilt from current `src/` before release so shipped extension matches certified source.
3. **Scripts** (`rebuildSessionCounts`, `verifySessionCounts`) are understood as **operational** tooling, not alternate runtime sources.

If the bar is **strictly** “no recomputation anywhere in the repository including `scripts/`” or “no committed JS may contain legacy route strings,” the verdict would be **NOT READY** until scripts are excluded by policy or the extension bundle is regenerated and verified clean.

---

## Summary Table

| Step | Topic | Result |
|------|--------|--------|
| 1 | Source of truth (global) | **PASS** |
| 2 | Zero fallback (counts) | **PASS** |
| 3 | No recomputation (display totals) | **PASS** |
| 4 | Write layer | **PASS** (with notes) |
| 5 | Legacy removal | **PASS** TS / **caveat** `background.js` |
| 6 | Snapshot purity | **PASS** |
| 7 | Query model | **PASS** |
| 8 | Extension | **PASS** src / **PARTIAL** bundle |
| 9 | Data model | **PARTIAL** |
| 10 | Architecture | **PASS** |
| 11 | Dead code / artifacts | **PARTIAL** |

**Phase 6.7 certification (product runtime):** Session-backed ticket counts are **consistently enforced** in application TypeScript, with **no** restored counts API or client counts store, and **clean** separation between feedback listeners (list) and session listeners (totals). **Ship readiness** should include regenerating the extension bundle and acknowledging maintenance scripts and legacy status edge cases.
