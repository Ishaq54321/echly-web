# Phase 6.7 Preflight — Write Layer + Schema Audit

**Scope:** Read-only inventory of feedback writes, Firestore access patterns, schema truth, session counters, fallbacks, and background systems.  
**Repo snapshot:** `echly` (branch `optimizations-dashboard` as of audit).  
**Code changes:** None (this document only).

---

## 🔴 Feedback Write Paths

### 1. API-based writes (product runtime)

| File | Function / handler | Operation | Transport | Persistence |
|------|-------------------|-----------|-----------|-------------|
| `app/api/feedback/post.ts` | `POST` handler | **Create** feedback | HTTP `POST /api/feedback` | `addFeedbackWithSessionCountersRepo` (Admin SDK transaction) |
| `app/api/tickets/[id]/route.ts` | `PATCH` handler | **Update** ticket fields + resolve/reopen | HTTP `PATCH /api/tickets/:id` | `updateFeedbackResolveAndSessionCountersRepo` (status / resolve change) or `updateFeedbackRepo` (non-status fields) + `updateSessionUpdatedAtRepo` |
| `app/api/tickets/[id]/route.ts` | `DELETE` handler | **Soft delete** (see Deletion Model) | HTTP `DELETE /api/tickets/:id` | `deleteFeedbackWithSessionCountersRepo` |

**Callers (examples, all HTTP to the above):**

- **Web app:** `lib/feedback.ts` → `authFetch` PATCH/DELETE; `SessionPageClient.tsx`, `useFeedbackDetailController.ts`, `useCaptureWidget.ts` → `authFetch` `/api/tickets/:id`.
- **Extension:** `echly-extension/src/background.ts` → `createFeedbackInternal` → `apiFetch` `POST ${API_BASE}/api/feedback`; `echly-extension/src/content.tsx` → `apiFetch` PATCH/DELETE `/api/tickets/:id` (and bundled `content.js` mirrors this).

**Related feedback-document updates (not ticket lifecycle, but mutate `feedback/*`):**

| File | Function | Operation | Notes |
|------|----------|-----------|--------|
| `lib/repositories/commentsRepository.server.ts` | `addCommentRepo` | Updates `feedback.commentCount`, `lastCommentPreview`, `lastCommentAt` | Via `incrementFeedbackCommentCountRepo` after `POST /api/comments` |

**Does not write feedback documents:**

- `app/api/structure-feedback/route.ts` + `lib/ai/runFeedbackPipeline.ts` — AI structuring only; returns JSON to client, **no** Firestore feedback write.

---

### 2. Direct client Firestore writes

**Not used** for feedback in the Next.js app or extension **runtime**: dashboard session list uses `onSnapshot` on `feedback` for reads (`useSessionFeedbackPaginated.ts`); `lib/repositories/feedbackRepository.ts` uses client Firestore **read** APIs only (no `setDoc` / `updateDoc` / `addDoc` / `deleteDoc` on `feedback`).

**Do exist (maintenance / one-off scripts, client SDK + `lib/firebase`):**

| File | Operation | Target |
|------|-----------|--------|
| `scripts/hardDeleteInvalidFeedback.ts` | `deleteDoc`, `updateDoc` | `feedback/{id}` |
| `scripts/deleteSkippedFeedback.ts` | `delete` (hard), `update` sessions/workspaces in transaction | `feedback/{id}`, `sessions/{id}` |

These are **not** API routes; they bypass the normal write architecture when executed.

---

### 3. Extension writes

Extension **ticket create / update / delete** go through **HTTP** to the Next API (`POST /api/feedback`, `PATCH` / `DELETE /api/tickets/:id`), not direct Firestore from the extension for feedback documents.

---

### 4. Admin / server writes

All production feedback **create / update / soft-delete** paths above resolve to **`lib/repositories/feedbackRepository.server.ts`** using **`adminDb`** (Firebase Admin):

- `addFeedbackWithSessionCountersRepo` — `tx.set` feedback doc; session + workspace + insights updates in same transaction.
- `updateFeedbackRepo` — `adminDb.doc('feedback/{id}').update(...)`.
- `updateFeedbackResolveAndSessionCountersRepo` — transaction: `tx.update` feedback + session (+ insights when resolve counts change).
- `deleteFeedbackWithSessionCountersRepo` — transaction: `tx.update` feedback (`isDeleted`, `deletedAt`) + session counters + workspace touch.
- `incrementFeedbackCommentCountRepo` — transaction on feedback doc comment fields.

**Additional Admin SDK scripts (batch / alignment, not HTTP):**

| File | Effect on feedback / sessions |
|------|------------------------------|
| `scripts/phase1AlignFirestore.ts` | **Hard `delete`** invalid `feedback` docs (no session counter repair in script) |
| `scripts/backfillFeedbackStatusField.ts` | `updateDoc` feedback `status` (client SDK in repo) |
| `scripts/hardDeleteInvalidFeedback.ts` | See §2 |
| `scripts/deleteSkippedFeedback.ts` | See §2 |
| `lib/server/resolveSessionFeedbackCounts.ts` | **Repair** `sessions/{id}` counter fields when inconsistent (see §5) |

**Internal utility (unused by any route in this repo):**

- `lib/server/resolveAllOpenFeedbackInSession.ts` — Admin batch `update` on open feedback → `resolved` + session `openCount` / `resolvedCount`. **No imports** elsewhere found; not part of live API.

---

## STEP 2 — Write Control (CRITICAL)

**Are ALL feedback writes going through API routes?**

- **For the shipped product (web + extension):** **YES** — create/update/delete ticket flows use `POST /api/feedback` and `PATCH` / `DELETE /api/tickets/:id` only.
- **For the entire repository including scripts:** **NO** — direct Firestore writes exist in:
  - `scripts/hardDeleteInvalidFeedback.ts`
  - `scripts/deleteSkippedFeedback.ts`
  - `scripts/backfillFeedbackStatusField.ts` (feedback updates)
  - `scripts/phase1AlignFirestore.ts` (hard deletes feedback docs; Admin SDK)

Comment-driven **feedback field** updates (`commentCount`, etc.) run from **`POST /api/comments`** → server repo (still API-controlled).

---

## 📦 Feedback Schema

### Firestore / server payload (authoritative storage)

**On create** (`feedbackPayload` in `feedbackRepository.server.ts`):  
`userId`, `sessionId`, `workspaceId` (added at create), `title`, `instruction`, `suggestion`, `type`, **`status`** (`open` / `resolved` / `processing` allowed on input; POST normalizes `processing` → `open` before repo), `createdAt`, `commentCount` (0), `contextSummary`, `actionSteps`, `suggestedTags`, `url`, `viewportWidth`, `viewportHeight`, `userAgent`, `clientTimestamp`, `screenshotUrl`, `screenshotStatus`, **`isDeleted: false`**.

**On soft delete:** `isDeleted: true`, `deletedAt` (Date).

**On update (ticket PATCH):** `title`, `instruction`, `type`, **`status`** (derived from `isResolved` when using resolve path), `screenshotUrl`, `screenshotStatus`, `actionSteps`, `suggestedTags` as applicable.

**Not set on create in payload:** explicit `updatedAt` on the feedback document (session/workspace/insights get `updatedAt`).

### Domain / API shape

- **`lib/domain/feedback.ts` — `Feedback`:** `id`, optional `workspaceId`, `sessionId`, `userId`, `title`, `instruction` / `description`, `suggestion`, `type`, **`isResolved`**, `createdAt`, `commentCount`, comment preview fields, structuring fields, metadata, screenshot fields, optional **`status`**, optional **`isDeleted`**.
- **`StructuredFeedback`:** includes optional `status` including `processing`.
- **API list shape** (`serializeFeedbackMinimal` in `app/api/feedback/route.ts`): exposes `status` (normalized), **`isResolved`**, `isDeleted`, plus list-oriented fields.
- **API ticket shape** (`serializeTicket` in `lib/server/serializeFeedback.ts`): spreads domain ticket, sets **`status`** via `normalizeTicketStatus`, serializes `createdAt`.

---

## Schema Analysis (CRITICAL)

1. **Is `status` used OR `isResolved` OR both?**  
   **Both** appear in types and API JSON. **Firestore stores `status`** as the primary column for queries (`where('status', '==', ...)`). **`isResolved` is derived** when mapping docs: server `docToFeedback` sets `isResolved` from `status === 'resolved'` or legacy `data.isResolved === true`. Client `lib/repositories/feedbackRepository.ts` also derives `isResolved` from `status` / legacy fields / `done`.

2. **Which is the TRUE source of truth?**  
   **Persisted source of truth: Firestore field `status`** (open / resolved for normal flows). **`isResolved` is a domain/API convenience** aligned from `status` (and legacy boolean if present).

3. **Inconsistent usage anywhere?**  
   - **`updateFeedbackRepo`** accepts both `status` and `isResolved`; if both were sent, **`isResolved` overwrites `status`** (later branch). The **tickets PATCH** route maps body `status` / `isResolved` to **`isResolved` only** and uses the resolve-aware repo for status transitions — consistent for that entry point.  
   - **Legacy / edge:** raw docs with `status: 'skipped'`, `'processing'`, or missing fields can disagree with counters and with `resolveSessionFeedbackCounts` scan logic (see Count Reliability).  
   - **DELETE route comment** says “permanently delete” but implementation **soft-deletes** — documentation vs behavior mismatch.

---

## 🧨 Deletion Model

- **Product `DELETE /api/tickets/:id`:** **Soft delete.**  
  `deleteFeedbackWithSessionCountersRepo` sets **`isDeleted: true`** and **`deletedAt`**, and adjusts session counters. The document **remains** in `feedback`.

- **Hard delete** occurs only in **scripts** (e.g. `deleteSkippedFeedback.ts`, `hardDeleteInvalidFeedback.ts`, `phase1AlignFirestore.ts`), not in the standard ticket API.

---

## 📊 Session Count Fields

From **`lib/domain/session.ts`** and **`createSessionRepo`** (`sessionsRepository.server.ts`), session documents include denormalized:

| Field | Role |
|-------|------|
| `openCount` | Open tickets (status open) |
| `resolvedCount` | Resolved tickets |
| `totalCount` | Total non-deleted tickets (intended `open + resolved` for consistency checks) |
| `feedbackCount` | Parallel total-style counter maintained alongside `totalCount` on create/delete |
| `skippedCount` | Legacy / skipped path; decremented on soft-delete when `status === 'skipped'`; **removed** on count repair fallback (`FieldValue.delete()`) |

Also on session (not ticket counts but same doc): `commentCount`, `viewCount`, etc.

---

## Reliability Check (CRITICAL)

| Field | Where written / updated |
|-------|-------------------------|
| `openCount`, `totalCount`, `feedbackCount` | **Increment** on **`addFeedbackWithSessionCountersRepo`** (create only bumps **open** among status buckets; `resolvedCount` unchanged). |
| `openCount`, `resolvedCount` | **Adjusted** on **resolve/reopen** in **`updateFeedbackResolveAndSessionCountersRepo`** (transaction, compares prior `status` on doc). |
| `openCount`, `resolvedCount`, `skippedCount`, `totalCount`, `feedbackCount` | **Decremented** on **soft delete** in **`deleteFeedbackWithSessionCountersRepo`** according to current `status`. |
| `openCount`, `resolvedCount`, `totalCount` | **Repaired** when **`resolveSessionFeedbackCounts`** runs a full scan (see below). **`skippedCount` cleared** on that repair path. |

**On create:** `resolvedCount` is not incremented (correct for new open ticket).

**On comment add:** Session **`commentCount`** updates via `incrementSessionCommentCountRepo`; **open/resolved/total/feedbackCount** are unchanged (by design).

---

## Consistency Check (CRITICAL)

**Are counts ALWAYS updated on every mutation?**

**NO** (not for every conceivable data change):

1. **Soft delete** updates session counters in-repo; **hard deletes** from **scripts** (`phase1AlignFirestore`, `deleteSkippedFeedback`, `hardDeleteInvalidFeedback`) **do not** run the same transactional logic as `deleteFeedbackWithSessionCountersRepo` in all cases — **session aggregates can drift** after script use until repair or manual backfill.
2. **`resolveAllOpenFeedbackInSession`** (if ever wired) batches status updates and session counters but **does not filter `isDeleted`** in its query; **unused** today but would be a risk if enabled without alignment to soft-delete semantics.
3. **Legacy feedback** with `status` not exactly `open` or `resolved` (e.g. `skipped`, odd values): **`resolveSessionFeedbackCounts` scan** only increments totals for **`open` and `resolved`** docs (non-deleted). Such rows can cause **under-count vs `totalCount`** until repaired or normalized.
4. **`total === open + resolved` gate** in `resolveSessionFeedbackCounts` does **not** validate **`feedbackCount`** or **`skippedCount`** against reality.

---

## 🔁 Count Fallback Mechanisms

**Primary implementation:** `lib/server/resolveSessionFeedbackCounts.ts`, invoked from **`GET /api/feedback/counts`** (`app/api/feedback/counts/route.ts`).

**Behavior:**

1. Read `sessions/{sessionId}` fields `totalCount`, `openCount`, `resolvedCount`.
2. If **`total === open + resolved`**, return those values (fast path).
3. Else: **full query** `feedback` where `sessionId` + `workspaceId` match; scan each doc — skip `isDeleted === true`; count `status === 'open'` and `status === 'resolved'` only; compute `realTotal`, `realOpen`, `realResolved`.
4. **Repair write:** `sessionRef.update({ totalCount, openCount, resolvedCount, skippedCount: FieldValue.delete() })` (fire-and-forget `.catch`; errors swallowed).

**When fallback triggers:** Whenever stored session counters fail the simple consistency equation (often after legacy data, partial script deletes, or skipped/processing rows).

**Backfill / maintenance scripts** (separate from runtime API): `scripts/backfillWorkspaceCounts.ts`, `scripts/backfillWorkspaceTotalFeedback.ts`, `scripts/backfillWorkspaceStats.ts`, `scripts/backfillInsights.ts`, `scripts/backfillFeedbackStatusField.ts`, `scripts/deleteSkippedFeedback.ts`, etc. — batch alignment, not triggered by normal user requests.

---

## ⚙️ Background Systems

| Class | Finding |
|-------|---------|
| **Firebase Cloud Functions** | **None** in repo (`firebase.json` only configures Firestore + Storage rules; no `functions` package / triggers like `onCreate` / `onWrite` for feedback). |
| **Scheduled HTTP** | `app/api/cron/cleanup-temp-screenshots/route.ts` — **temp screenshots**, not feedback counts. |
| **Scripts** | Multiple `scripts/*.ts` for backfill, hard delete, alignment (manual / ops). |

---

## Responsibility Check

- **Session open/resolved/total (and feedbackCount on create/delete):** Maintained in **request lifecycle** via **Admin SDK** inside API handlers and shared repos (`feedbackRepository.server.ts`).
- **Repair / reconciliation:** **On-demand** when **`GET /api/feedback/counts`** detects inconsistency (`resolveSessionFeedbackCounts`), not a continuous background job.
- **No** Firestore trigger keeps counts in sync outside those paths.

---

## 🧠 Phase 6.7 Readiness Verdict

### 1. Write Control

- **All writes via API (product runtime):** **YES**  
- **All writes via API (entire repo including ops scripts):** **NO** — see §2 and §4.

### 2. Schema Clarity

- **Single source of truth for resolution state:** **YES** at storage level — **`status` on the feedback document**; `isResolved` is derived and used in API/domain.  
- **Caveat:** Legacy `isResolved` boolean on old docs and non-`open`/`resolved` `status` values can still appear in data until migrated; API normalization hides some of this in responses.

### 3. Count Reliability

- **Counts always correct:** **NO**  
- **Gaps:** repair depends on **`total === open + resolved`** check; **scan ignores** non-open/non-resolved statuses; **scripts** can hard-delete or mutate without transactional counter updates; **`feedbackCount` not part of** consistency check; **`skippedCount` dropped** on repair.

### 4. System Type

**Partially deterministic:** Normal API paths are transactional and intentional; **eventual consistency** and **repair-on-read** via counts API; **legacy + script** paths introduce **non-deterministic drift** until fallback or backfill.

### 5. Risk Level for Phase 6.7

**MEDIUM** — Strong API-only writes for live clients and clear primary schema (`status`, soft delete), but **counter invariants are not globally enforced** (repair predicate narrow, script bypasses, legacy status skew). Plan Phase 6.7 assuming **count repair and legacy rows** are in scope for verification.

---

## Verification Checklist

| Item | Status |
|------|--------|
| Only this file added under `audit/` for this task | ✅ `audit/phase_6_7_preflight_write_audit.md` |
| No application code modified | ✅ |
| Sections completed | ✅ |

---

*End of audit.*
