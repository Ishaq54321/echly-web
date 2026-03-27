# Counter Integrity Audit

Date: 2026-03-27  
Scope: Detect duplicate counter updates across client and server paths, with focus on:
- `commentCount`
- `feedbackCount`
- `openCount`
- `resolvedCount`
- `totalComments`
- `totalFeedback`
- insights counters (`totalFeedback`, `totalComments`, `totalResolved`, `timeSavedMinutes`, `issueTypes.*`, `sessionCounts.*`, `daily.*`)

Constraint honored: no production code changes made.

---

## Executive Verdict

Are counters safe? **No (currently mixed)**.

- Runtime API routes are using `*.server.ts` repositories for comment/feedback flows.
- But duplicate counter mutation logic still exists in non-server repositories (`*.ts`) and remains callable.
- This means architecture is **not yet counter-safe by construction**: drift can reappear if any client/import path uses those non-server mutation functions.

Top answer:
- **Duplicate update logic exists** for all major counter families (comment, feedback/session, workspace stats, insights).
- **Current active API flows are mostly server-owned**, but **client-callable mutation implementations remain present**.

---

## Step 1 — Counter Inventory

Identified counter fields:

- Feedback doc: `commentCount`
- Session doc: `openCount`, `resolvedCount`, `totalCount`, `feedbackCount`, `commentCount`, `viewCount`
- Workspace doc: `stats.totalComments`, `stats.totalFeedback`, `stats.totalSessions`, `sessionCount`, `archivedCount`, `usage.sessionsCreated`
- Insights doc (`workspaces/{workspaceId}/insights/main`):
  - `totalFeedback`
  - `totalComments`
  - `totalResolved`
  - `timeSavedMinutes`
  - `issueTypes.{type}`
  - `sessionCounts.{sessionId}`
  - `daily.{yyyy-mm-dd}.feedback|comments|resolved`

---

## Step 2 — Update Path Trace (Where / Function / Client or Server / Trigger)

## A) Comment counters

- `lib/repositories/commentsRepository.ts` — `addCommentRepo` — **CLIENT**
  - Trigger: comment create
  - Updates:
    - calls `incrementSessionCommentCountRepo` (`sessions.commentCount += 1`)
    - calls `incrementFeedbackCommentCountRepo` (`feedback.commentCount += 1`)
    - updates `workspaces.stats.totalComments += 1`
    - calls `incrementInsightsOnCommentCreateRepo` (`insights.totalComments`, `daily.*.comments`)

- `lib/repositories/commentsRepository.server.ts` — `addCommentRepo` — **SERVER**
  - Trigger: comment create (used by `POST /api/comments`)
  - Same counter updates as above, but with Admin SDK.

- `lib/repositories/feedbackRepository.ts` — `incrementFeedbackCommentCountRepo` — **CLIENT**
  - Trigger: comment create helper
  - Updates `feedback.commentCount += 1`

- `lib/repositories/feedbackRepository.server.ts` — `incrementFeedbackCommentCountRepo` — **SERVER**
  - Trigger: comment create helper
  - Updates `feedback.commentCount += 1`

- `lib/repositories/sessionsRepository.ts` — `incrementSessionCommentCountRepo` — **CLIENT**
  - Trigger: comment create helper
  - Updates `sessions.commentCount += 1`

- `lib/repositories/sessionsRepository.server.ts` — `incrementSessionCommentCountRepo` — **SERVER**
  - Trigger: comment create helper
  - Updates `sessions.commentCount += 1`

- Comment delete path:
  - `commentsRepository.ts` / `commentsRepository.server.ts` — `deleteCommentRepo` decrements `workspaces.stats.totalComments`.

## B) Feedback + session counters

- `lib/repositories/feedbackRepository.ts` — `addFeedbackWithSessionCountersRepo` — **CLIENT**
  - Trigger: feedback create
  - Updates:
    - session: `openCount`, `totalCount`, `feedbackCount`
    - workspace: `stats.totalFeedback`, `stats.last30DaysFeedback`
    - insights: `totalFeedback`, `timeSavedMinutes`, `issueTypes.*`, `sessionCounts.*`, `daily.*.feedback`

- `lib/repositories/feedbackRepository.server.ts` — `addFeedbackWithSessionCountersRepo` — **SERVER**
  - Trigger: feedback create (used by `POST /api/feedback`)
  - Same logical updates via Admin SDK.

- `lib/repositories/feedbackRepository.ts` — `updateFeedbackResolveAndSessionCountersRepo` — **CLIENT**
  - Trigger: resolve / reopen feedback
  - Updates:
    - session: `openCount`, `resolvedCount`
    - insights: `totalResolved`, `daily.*.resolved`

- `lib/repositories/feedbackRepository.server.ts` — `updateFeedbackResolveAndSessionCountersRepo` — **SERVER**
  - Trigger: resolve / reopen feedback (used by `PATCH /api/tickets/[id]`)
  - Same logical updates via Admin SDK.

- `lib/repositories/feedbackRepository.ts` and `.server.ts` — `deleteFeedbackWithSessionCountersRepo`
  - Trigger: feedback delete
  - Updates session counters (`openCount`, `resolvedCount`, `totalCount`, `feedbackCount`), with floors.

## C) Session/workspace counters

- `lib/repositories/sessionsRepository.ts` — **CLIENT**
  - `createSessionRepo`: increments workspace `sessionCount`, `usage.sessionsCreated`, `stats.totalSessions`
  - `deleteSessionRepo`: decrements workspace `sessionCount`, `stats.totalSessions`, `stats.totalComments` (based on deleted comments)
  - `updateSessionArchivedRepo`: mutates `archivedCount`
  - `recordSessionViewIfNewRepo`: increments `viewCount`

- `lib/repositories/sessionsRepository.server.ts` — **SERVER**
  - Matching counter updates for same flows.

## D) Insights counters

- `lib/repositories/insightsRepository.ts` — **CLIENT**
  - `incrementInsightsOnFeedbackCreateRepo`
  - `incrementInsightsOnCommentCreateRepo`
  - `incrementInsightsOnFeedbackResolvedRepo`

- `lib/repositories/insightsRepository.server.ts` — **SERVER**
  - Same functions and counter intent via Admin SDK.

---

## Step 3 — Client Mutation Search (`increment(`, `updateDoc(`, `runTransaction(`)

Client-side mutation primitives found in non-server files:

- `lib/repositories/commentsRepository.ts`
- `lib/repositories/feedbackRepository.ts`
- `lib/repositories/sessionsRepository.ts`
- `lib/repositories/insightsRepository.ts`

Additionally:
- `lib/feedback.ts` imports non-server feedback/sessions repositories and exposes mutation wrappers (`updateFeedback`, `deleteFeedback`) from a client-importable module.

Note:
- API route files inspected are using `*.server.ts` repositories for feedback/comment mutation endpoints.

---

## Step 4 — Duplication Classification by Counter

- `feedback.commentCount`: **🔴 DUPLICATE**
  - Client update path exists (`feedbackRepository.ts`)
  - Server update path exists (`feedbackRepository.server.ts`)

- `sessions.commentCount`: **🔴 DUPLICATE**
  - Client path (`sessionsRepository.ts`)
  - Server path (`sessionsRepository.server.ts`)

- `sessions.openCount` / `sessions.resolvedCount` / `sessions.feedbackCount` / `sessions.totalCount`: **🔴 DUPLICATE**
  - Client path (`feedbackRepository.ts`)
  - Server path (`feedbackRepository.server.ts`)

- `workspaces.stats.totalComments`: **🔴 DUPLICATE**
  - Client path (`commentsRepository.ts`, `sessionsRepository.ts`)
  - Server path (`commentsRepository.server.ts`, `sessionsRepository.server.ts`)

- `workspaces.stats.totalFeedback`: **🔴 DUPLICATE**
  - Client path (`feedbackRepository.ts`)
  - Server path (`feedbackRepository.server.ts`)

- Insights counters (`totalFeedback`, `totalComments`, `totalResolved`, `timeSavedMinutes`, `issueTypes.*`, `sessionCounts.*`, `daily.*`): **🔴 DUPLICATE**
  - Client path (`insightsRepository.ts`, also touched directly in client feedback repo transaction)
  - Server path (`insightsRepository.server.ts`, server feedback repo transaction)

- `viewCount`, workspace `sessionCount`, `archivedCount`, `stats.totalSessions`: **🟡 POSSIBLE**
  - Duplicate code exists in client/server session repositories.
  - Not in your required counter list, but same structural risk.

---

## Step 5 — Comment System Verification

Requested check:
- "commentCount updates ONLY happen in `commentsRepository.server.ts`"

Result: **FAILED**

Why:
- `feedback.commentCount` is updated in `feedbackRepository.server.ts` (and duplicate client version in `feedbackRepository.ts`), not only in `commentsRepository.server.ts`.
- `sessions.commentCount` is updated in `sessionsRepository.server.ts` (and duplicate client version in `sessionsRepository.ts`).
- `commentsRepository.server.ts` orchestrates calls, but the underlying counter writes are split across server repositories and duplicated in client repositories.

Also verified:
- `commentsRepository.ts` still contains client counter writes.
- `lib/comments.ts` itself does not directly write counters (uses API), but it imports read helper from non-server repo.
- UI components checked do not directly call Firestore mutation primitives for these counters.

---

## Step 6 — Feedback System Verification

Requested check:
- "feedback counters ONLY updated in `feedbackRepository.server.ts`"

Result: **FAILED (strictly)**

Why:
- Duplicate feedback/session/insights counter writes exist in `feedbackRepository.ts` (client SDK).
- Active API create/update/delete feedback routes currently call server repo, which is good.
- But counter ownership is not exclusive because client mutation implementation remains present.

---

## Step 7 — Session + Workspace Verification

Requested check:
- session counters (`openCount`, etc.) and workspace stats (`totalComments`, etc.) updated server-side only

Result: **FAILED (strictly)**

Why:
- Client repository files still update these counters:
  - `feedbackRepository.ts` (session open/resolved/total/feedback counts)
  - `commentsRepository.ts` (workspace total comments)
  - `sessionsRepository.ts` (workspace/session aggregate counters)
- Server equivalents also exist and are used in API routes.

---

## Step 8 — Root Risk Analysis

1) Which counters are duplicated?
- All primary target counters in this audit:
  - `commentCount`
  - `feedbackCount`
  - `openCount`
  - `resolvedCount`
  - `totalComments`
  - `totalFeedback`
  - insights counters (`totalFeedback`, `totalComments`, `totalResolved`, plus nested analytics maps)

2) Which files still update counters client-side?
- `lib/repositories/commentsRepository.ts`
- `lib/repositories/feedbackRepository.ts`
- `lib/repositories/sessionsRepository.ts`
- `lib/repositories/insightsRepository.ts`
- Indirect risk surface: `lib/feedback.ts` (client-importable mutation wrappers calling non-server repos)

3) Which flows can cause drift?
- Any path that invokes client repo mutation functions instead of server API/server repos can diverge from intended single-owner accounting.
- Mixed invocation across environments (some calls through API server routes, others through direct client repositories) can produce double-writes or asymmetric updates.
- Legacy/deprecated client repository methods are still present and callable, so accidental reintroduction is plausible.

---

## What Must Be Removed (to meet server-only counter ownership)

- Remove/disable all counter mutation logic from non-server repository files:
  - `lib/repositories/commentsRepository.ts`
  - `lib/repositories/feedbackRepository.ts`
  - `lib/repositories/sessionsRepository.ts`
  - `lib/repositories/insightsRepository.ts`
- Ensure client-facing modules (`lib/feedback.ts`, comment helpers, UI actions) only hit server API endpoints for mutations.
- Keep counter mutation ownership in Admin SDK server repositories only.

---

## Final Safety Answer

- Are counters safe now? **No, not by architecture.**
- Where are duplicates? **Client and server repository pairs for comments, feedback, sessions, and insights counters.**
- What must be removed? **Client-side counter mutation paths and any client-importable wrappers that call them.**

