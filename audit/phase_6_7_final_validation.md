# Phase 6.7 — Final Validation Audit

**Mode:** Read-only. No application code was modified for this audit.  
**Date context:** Repository state as validated (branch `optimizations-dashboard` / working tree per audit run).

---

## Step 1 — Single source of truth validation

### Search scope

Searched for: `openCount`, `resolvedCount`, `totalCount`, `feedbackCount` across `*.{ts,tsx,js,jsx}`.

### Source of truth check

**Verdict: FAIL** (against the strict criteria: *all* UI counts *only* from `sessions/{id}` with *no* derivation from loaded feedback rows).

**Files where session-document fields are read (primary path — session doc):**

| Area | Files |
|------|--------|
| Domain / serialization | `lib/domain/session.ts`, `lib/server/serializeSession.ts`, `lib/server/publicShareSanitize.ts` |
| Dashboard | `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` (`mapSessionDoc`, `countsFromSessionFields`) |
| Session tickets | `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` (separate `onSnapshot` on `sessions/{id}`) |
| Session overview | `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` (`countsFromSession` after `getSessionById`) |
| API | `app/api/sessions/route.ts` (list payload), `app/api/sessions/[id]/route.ts` (GET returns serialized session) |
| Share (sanitized payload) | `components/share/PublicShareSessionView.tsx` — **uses session fields when all three present** |
| Extension (TS source) | `echly-extension/src/background.ts` (`fetchFeedbackCountFresh` → `GET /api/sessions/:id`), `echly-extension/src/cachedSessions.ts` |
| Capture / extension UI | `lib/capture-engine/core/CaptureWidget.tsx`, `lib/capture-engine/core/types.ts`, `echly-extension/src/content.tsx` (props from global state fed by background) |
| Other | `lib/repositories/feedbackRepository.server.ts` (writes), `lib/repositories/sessionsRepository*.ts`, `components/dashboard/WorkspaceCard.tsx` (via `counts` from workspace overview) |

**Strict failure — counts derived from feedback collection / loaded rows:**

- **`components/share/PublicShareSessionView.tsx`** — `listCounts` falls back when session counters are incomplete to:
  - `total: feedbackRows.length`
  - `open` / `resolved` via **`feedbackRows.filter(...).length`**  
  This violates “no `.filter().length` for totals” and “counts only from session docs” for that code path.

**Synthetic total when `totalCount` / `feedbackCount` absent (still session-field–based, not a feedback scan):**

Several readers compute `total` as `open + resolved` when `totalCount` and `feedbackCount` are missing, e.g. `useSessionFeedbackPaginated.ts`, `useWorkspaceOverview.ts`, `useSessionOverview.ts`, `app/api/sessions/route.ts`, `echly-extension/src/background.ts`, `echly-extension/src/cachedSessions.ts`, `lib/server/publicShareSanitize.ts`. That is not a feedback-collection scan but is a **secondary derivation** from other session fields.

**Server-side (not UI):**

- `lib/repositories/feedbackRepository.server.ts` defines `getSessionFeedbackCountRepo` — **Firestore `count()` on the `feedback` collection**. No `*.{ts,tsx}` callers were found; it is a **parallel server capability**, not the main app read path for dashboard/session UI.

---

## Step 2 — Complete removal of legacy counts system

### Search strings

`/api/feedback/counts`, `fetchCounts`, `fetchCountsDedup`, `sessionCountsStore`, `resolveSessionFeedbackCounts`, `countsRequestStore`

### Legacy counts system removal

**Application source (`*.{ts,tsx}`): PASS** — **zero** matches outside this audit file’s creation.

**Repository-wide: FAIL** under a literal reading of “FAIL if any found”:

| Location | Notes |
|----------|--------|
| `audit/*.md` (multiple) | Historical write-ups still name removed APIs and modules (`/api/feedback/counts`, `fetchCountsDedup`, `sessionCountsStore`, `resolveSessionFeedbackCounts`, etc.). |
| `echly-extension/content.js` | Bundled output still contains strings such as `fetchCountsDedup` and `/api/feedback/counts` (stale build artifact vs `src/`). |
| `echly-extension/content.js.map` | Source map references same legacy identifiers. |

**Deleted routes/modules (git status):** `app/api/feedback/counts/route.ts`, `lib/server/resolveSessionFeedbackCounts.ts`, `lib/state/sessionCountsStore.ts`, `lib/state/fetchCountsDedup.ts`, `components/share/useShareCounts.ts`, `echly-extension/src/countsRequestStore.ts` — absent from the TypeScript source tree as expected.

---

## Step 3 — No recomputation anywhere (count semantics)

### Approach

Searched for `.reduce(` in TS/TSX; spot-checked `.filter` / `.length` against **open / resolved / total** display semantics.

### Recalculation check

**Verdict: FAIL** (strict: no list-derived open/resolved/total).

| Item | Assessment |
|------|------------|
| `components/share/PublicShareSessionView.tsx` | **Fail** — fallback counts from `feedbackRows.length` and `.filter().length` for open/resolved. |
| `useSessionFeedbackPaginated.ts` | `openFeedback` / `resolvedFeedback` use `.filter` for **list splits**; **exposed** `total`, `activeCount`, `resolvedCount` come from **session** `onSnapshot` — **allowed** per “UI filtering (not counts)” if those memos are not used as the numeric source of truth for metrics (they are not, for the main counters). |
| `useWorkspaceOverview.ts` | `openCount + resolvedCount` only when `totalCount` / `feedbackCount` missing — **synthetic total from session fields**. |
| Insights / charts / command-center | Various `.reduce` uses for **analytics or non-ticket-count** data — **out of scope** for session ticket totals. |
| `scripts/verifySessionCounts.ts` | Recomputes from feedback **for verification** — operational, not product UI. |

---

## Step 4 — Write layer integrity

**File reviewed:** `lib/repositories/feedbackRepository.server.ts`

### CREATE (`addFeedbackWithSessionCountersRepo`)

- Runs in **`runTransaction`**.
- Sets feedback doc; updates session with **`openCount` += 1**, **`totalCount` = open + resolved**, **`feedbackCount` = `totalCount`**, clears `skippedCount`.
- Counters floored via `Math.max(0, num(...))` before arithmetic; **non-negative** assuming consistent starting state.

### RESOLVE / REOPEN (`updateFeedbackResolveAndSessionCountersRepo`)

- **`runTransaction`**: reads feedback + session; applies `open`/`resolved` delta only when `wasStatus !== toStatus`; recomputes `totalCount` and `feedbackCount`; **no double increment** on no-op status.
- **`updateFeedbackRepo`**: updates feedback only — **no session counters**. Safe for current API usage because **`PATCH /api/tickets/[id]`** routes **status / `isResolved` changes** to `updateFeedbackResolveAndSessionCountersRepo` and uses `updateFeedbackRepo` only when **not** a status change.

### DELETE (soft)

- **`deleteFeedbackWithSessionCountersRepo`**: transaction; **`isDeleted: true`**; decrements **`openCount` or `resolvedCount`** from `status === "resolved"`; updates **`totalCount` / `feedbackCount`**; uses **`Math.max(0, ...)`** on decrements.

### Gaps / caveats

- **Legacy `status` values** on feedback are mapped to `wasStatus` / `wasResolved` as **open unless explicitly `"resolved"`** — odd legacy values behave like **open** for counter math (documented risk, not a missing transaction case).
- **`getSessionFeedbackCountRepo`** remains a **feedback-collection count()** helper with **no in-repo TS callers** found — dead or reserved API surface.

### Write layer integrity

**Verdict: PASS** for the implemented create / resolve-reopen / soft-delete paths used by `app/api/feedback/post.ts` and `app/api/tickets/[id]/route.ts`, with the legacy-status caveat above.

---

## Step 5 — No counts fetch after snapshot

### Files

- `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`

### Snapshot purity

**Verdict: PASS**

- **`useSessionFeedbackPaginated`**: Feedback `onSnapshot` updates the ticket list only. Counts come from a **separate** `onSnapshot` on **`sessions/{sessionId}`** — no counts HTTP API, no `fetchCounts*` in this hook.
- **`useWorkspaceOverview`**: Single Firestore query on `sessions`; `sessionsWithCounts` uses **`countsFromSessionFields(session)`** from snapshot data; `refreshSessions` is a no-op regarding counts; **no** post-snapshot counts hydration API.

---

## Step 6 — One query per screen rule

### Query model check

**Verdict: PASS** (with explicit listener breakdown; no counts API on these surfaces).

| Screen | Queries / listeners | Counts source |
|--------|---------------------|---------------|
| **Dashboard (workspace list)** | One `onSnapshot` on `sessions` (workspace, `orderBy updatedAt`, `limit 30`) | Session doc fields on each row |
| **Session page (tickets)** | One `onSnapshot` on `feedback` (workspace + session) **+** one `onSnapshot` on `sessions/{id}` for counters | Counters: session doc only |
| **Session overview** | `getSessionById` + Firestore reads for previews/activity (not used for **metric** totals) | `countsFromSession(session)` from session record |

No `GET /api/feedback/counts` in application `*.{ts,tsx}`.

---

## Step 7 — Extension integration

### Extension consistency

**Verdict: PASS** for **`echly-extension/src/background.ts`**.

- **`fetchFeedbackCountFresh`** uses **`GET ${API_BASE}/api/sessions/${sessionId}`** and reads **`openCount`, `resolvedCount`, `totalCount` / `feedbackCount`** from JSON — aligned with session document exposure via API.
- **Caveat:** Committed **`echly-extension/content.js`** still contains legacy **`/api/feedback/counts`** / **`fetchCountsDedup`** strings — treat as **stale bundle** until rebuilt from current `src/`.

---

## Step 8 — Data model cleanliness

### `feedback.status`

- **`lib/repositories/feedbackRepository.server.ts` `docToFeedback`**: normalizes to **`"open" | "resolved"`** for domain mapping; `isResolved` is **derived** for UI (`status === "resolved" || data.isResolved === true`).
- **`lib/domain/feedback.ts`**: `StructuredFeedback` / `Feedback` types still allow **`"processing"`** etc. on some shapes — **schema is broader than the two-state runtime** for tickets.

### Session document

- Types and serialization include **`openCount`, `resolvedCount`, `totalCount`, `feedbackCount`** (`lib/domain/session.ts`, `serializeSession` commentary, API routes).

### Data model validation

**Verdict: PASS** with **caveat**: domain/types allow legacy/extended status strings; **write path and server mapping** target **open/resolved** for counter logic.

---

## Step 9 — No fallback / no patch system

### Fallback system check

**Verdict: FAIL** against “no fallback / no dual system” as strictly stated.

| Finding | Description |
|---------|-------------|
| **Public share UI** | **PublicShareSessionView** — fallback counts from **loaded feedback rows** when session counters incomplete. |
| **Read path** | Multiple places use **`open + resolved`** when **`totalCount` / `feedbackCount`** missing — defensive derivation from other session fields. |
| **Extension** | **`mutateGlobalCounts` / `applyStatusTransition`** — **client-side optimistic** adjustments (shadow state until refresh). |
| **Scripts** | **`scripts/verifySessionCounts.ts`**, **`scripts/rebuildSessionCounts.ts`** — scan/rebuild/compare tooling (not runtime product, but **explicit** recompute/repair workflows exist in repo). |

No **`resolveSessionFeedbackCounts`** or **`GET /api/feedback/counts`** remains in **runtime TypeScript** sources.

---

## Step 10 — Clean architecture check

### Architecture integrity

**Verdict: MIXED** (leaning clean for main app, with noted exceptions).

**Strengths**

- **Writes:** Feedback create / resolve / soft-delete go through **Admin SDK** repos with **transactions** updating **`sessions/{id}`** counters.
- **Reads (app):** Dashboard and session page consume counts from **Firestore session documents** or **GET session** serialization — **no** parallel counts API in TS sources.

**Concerns**

- **`getSessionFeedbackCountRepo`** — **feedback `count()`** query living alongside “session doc is truth” story; currently **uncalled** from TS app code.
- **Public share fallback** — **second source** (row-derived counts) when counters missing.
- **Committed extension `content.js`** — may **not** match `src/` (legacy strings).
- **Audit markdown** — still describes removed architecture (documentation debt, not runtime).

---

## Phase 6.7 final verdict

### 1. System type

**Not fully deterministic** from a **read-model** perspective: optional **`open + resolved`** synthesis, public-share **list-derived** fallback, and extension **optimistic** counter mutation introduce paths where displayed numbers can diverge briefly or depend on non-session inputs.

**Write path** for standard APIs is **transactional** and **deterministic** given consistent prior state.

### 2. Source of truth

**Multiple** for **strict** Phase 6.7 goals: **primary** = `sessions/{id}` fields everywhere except **public share fallback** and **tooling/scripts** that recompute from `feedback`.

### 3. Architecture quality

**Mixed** — core dashboard + session surfaces are **aligned** with session-backed counts; **exceptions** (share fallback, dead count repo helper, stale extension bundle, audit doc references) prevent a “clean / single-path” rating.

### 4. Risk level

**MEDIUM** — production TS paths are largely consistent; **residual risk** from share fallback accuracy, **legacy feedback status** edge cases in counter math, and **shipping** extension artifacts that may not match `src/`.

### 5. Ready for Phase 6.8?

**NO** — not with a **strict** zero-fallback / zero-dual-source bar: **PublicShareSessionView** still derives metrics from **feedback rows**, and **repo-wide** legacy strings remain in **audit docs** and **bundled extension JS**.  

**YES** — if Phase 6.8 scope is **signed-in Firestore + API surfaces only**, with follow-ups for **share UI**, **extension rebuild**, and **doc/bundle hygiene**.

---

## Verification checklist (audit deliverable)

| Requirement | Status |
|-------------|--------|
| Only **one** file created for this request (`audit/phase_6_7_final_validation.md`) | Done |
| No application code modified by this audit | Done |
| All sections above filled | Done |
| No partial answers — failures explicitly tied to evidence | Done |

---

*End of report.*
