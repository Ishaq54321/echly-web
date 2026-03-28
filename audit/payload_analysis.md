# Phase 6.7 — Payload analysis (document shape / field weight)

Based on **TypeScript domain types** and **mapping code** in repositories/hooks (not a live Firestore export). Use this to spot **over-fetch** for list views.

---

## `feedback` (tickets)

**Domain**: `lib/domain/feedback.ts` — `Feedback` interface.

**Approximate field groups** (all may exist on a full document):

| Group | Fields | List relevance |
|-------|--------|----------------|
| Identity | `id`, `workspaceId`, `sessionId`, `userId` | High |
| Display | `title`, `type`, `status`, `isResolved` | High |
| Text bodies | `instruction`, `description`, `suggestion`, `contextSummary` | **Large** — often unnecessary for **compact list rows** |
| Structured | `actionSteps[]`, `suggestedTags[]` | Medium (arrays) |
| Metadata | `url`, `viewportWidth/Height`, `userAgent`, `clientTimestamp` | Low for list |
| Screenshot | `screenshotUrl`, `screensStatus` | **Large URLs**; image bytes not in Firestore but URL triggers image fetch |
| Denormalized discussion | `commentCount`, `lastCommentPreview`, `lastCommentAt` | High for discussion surfaces |
| Timestamps | `createdAt` | High |

**Session board listener** (`useSessionFeedbackPaginated` → `mapDocToFeedback`): Maps **full document** into `Feedback` for **every** doc in the session query — **entire payload** for each ticket on every snapshot.

**List views that need less**: Dashboard only shows sessions, not feedback. Discussion list uses **API** shaping (limit 20). If a future list used the same listener as the board, it would be **overloaded**.

---

## `sessions`

**Domain**: `lib/domain/session.ts`.

| Field | Notes |
|-------|-------|
| `title`, `updatedAt`, `archived` / `isArchived` | Dashboard cards |
| `workspaceId`, `userId` | Scoping |
| `createdBy` | Nested object (profile) — **medium** payload for cards |
| Denormalized counts | `openCount`, `resolvedCount`, `totalCount`, `feedbackCount`, `commentCount`, `viewCount` | Small scalars; **valuable** to avoid extra queries |
| `accessLevel` | Session board permission |

**Dashboard snapshot**: Returns **full** session documents up to limit 30 — includes any extra fields stored on the doc (Firestore returns all fields unless projection — **no projection** in client query).

---

## `workspaces`

**Domain**: `lib/domain/workspace.ts` — large nested structure:

- `appearance`, `notifications`, `automations`, `permissions`, `ai`, `integrations`, `billing`, `entitlements`, `usage`, optional `stats`, session counters.

**Realtime listener** (`workspaceStore.ts`): Reads **entire** `workspaces/{id}` document to derive `plan` and `sessionUsed` (and full `Workspace` object on snapshot). **Over-fetch** for usage meter if most fields never change but doc is large.

---

## `users`

**Typical client read**: `users/{uid}` for `workspaceId` (and any profile fields present). **Small** if only `workspaceId` is stored; grows if profile denormalized.

---

## `comments`

**Domain**: `lib/domain/comment.ts`.

| Field | Notes |
|-------|-------|
| `message` | Text — can be long |
| `userAvatar`, `attachment` (`file_url`, etc.) | URLs / metadata |
| `position`, `textRange` | Structured pin/selection data |

**Listener**: `limit(100)` — caps documents but each doc can still be **large** (threads with long messages, attachments).

---

## Insights document

**Mapped in** `insights/page.tsx` from `WorkspaceInsightsDoc` (`lib/repositories/insightsRepository`):

- Lifetime scalars, `daily` map (per-day aggregates), `issueTypes`, `sessionCounts`, `response` timing stats.

**Shape**: Potentially **large** `daily` object over long horizons; still **one document** read vs many queries (by design).

---

## Overloaded documents / list-view mismatch

| Issue | Detail |
|-------|--------|
| Full feedback docs in session listener | Board needs detail for selected item; **sidebar list** still receives **all** fields for **all** tickets |
| Full workspace doc for usage | Billing strip only needs plan + session count subset |
| Session doc for insights titles | Only `title` (+ workspace check) needed; `getDoc` returns whole session |

---

## Recommendations bucket (for Phase 6.7 planning only)

- Consider **selective field** strategies (composite lightweight index docs, or split collections) for large-session ticket lists.
- Consider **projected** or **summary** docs for dashboard if session documents grow heavy fields.
- Discussion **API** path already limits list size; **orphan `DiscussionFeed`** would pull 100 full feedback docs + N session reads — **high** payload if enabled.
