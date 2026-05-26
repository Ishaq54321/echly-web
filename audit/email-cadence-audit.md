# Email Cadence, Frequency & Notification Setup — Read-Only Audit

**Date:** 2026-05-26
**Companion to:** [`email-deliverability-audit.md`](email-deliverability-audit.md), [`email-deliverability-fix-summary.md`](email-deliverability-fix-summary.md)
**Scope:** full repo. All email originates from `lib/email/*` and is dispatched from API routes / repositories / one cron / one webhook. No second backend, no job queue, no digest layer.

The deliverability work is complete. This audit is about **cadence** — how often a real user is hit, who is included in a fan-out, what dedup or throttling exists, and where the spam-risk gaps live today. Findings only; no recommendations.

---

## 1. Summary

- **No batching, no digesting, no per-recipient rate cap, no per-event throttling anywhere.** Every trigger sends immediately, one Resend call per recipient. The only "throttle"-shaped guards in the codebase are three single-shot idempotency keys: `users/{uid}.emailSends.welcome` (welcome), `sessions/{sid}.emailSends.firstViewerNotified` (session-opened), and `workspaces/{wid}.planLimitWarnings.{approaching,hit}.lastSentAt` (plan limit). Everything else fires per event.
- **Self-action filtering is solid for the per-event notification family** (`newComment`, `mention`, `ticketAssigned`, `ticketResolved`) but is enforced **only at the trigger site**, not in the senders. The commenter never gets their own `newComment`/`mention` (filtered in [commentsRepository.server.ts:212-218](../lib/repositories/commentsRepository.server.ts#L212-L218) and the description-mention path filters `recipientIds.filter((uid) => uid && uid !== actorId)` in [app/api/tickets/[id]/route.ts:520](../app/api/tickets/[id]/route.ts#L520)). The resolver/assigner is filtered the same way for ticket emails.
- **Mention vs new-comment dedup IS implemented** (and correctly): when a comment carries mentions, the mentioned uids are subtracted from the comment-recipient set before either email is dispatched. A user who is both creator/assignee AND mentioned gets exactly one email — the more-specific mention. See [commentsRepository.server.ts:211-254](../lib/repositories/commentsRepository.server.ts#L211-L254). This is the cleanest dedup in the codebase.
- **Session-opened is correctly capped at one email per session, ever** (not per viewer, not per day) via a Firestore transaction on `sessions/{sid}.emailSends.firstViewerNotified`. A 50-person viewing audience produces exactly one email. Maya cannot trigger a `sessionOpened` to herself (the trigger requires `viewer.uid !== ownerUid` — see [sessionsRepository.server.ts:289-297](../lib/repositories/sessionsRepository.server.ts#L289-L297)).
- **Plan-limit emails fire at most once per billing cycle per workspace per kind.** Cycle is keyed off `workspace.usage.feedbackResetDate` (the 1st-of-month string); the transaction in [planLimitDispatch.server.ts:60-86](../lib/email/planLimitDispatch.server.ts#L60-L86) stamps `planLimitWarnings.{approaching,hit}.lastSentAt`. Repeated crossings inside the same cycle send nothing. Downgrades that change the limit mid-cycle still respect the existing per-cycle stamp.
- **Stripe webhook IS idempotent at the event level**, gated by `webhookEvents/{provider}_{eventId}` ([app/api/billing/webhook/route.ts:116-130](../app/api/billing/webhook/route.ts#L116-L130)). Three Stripe retries of `invoice.paid` produce one `renewalReceipt`. Note: the idempotency record is written **after** all side-effects, so a handler that crashes mid-fan-out and is re-delivered would re-send the email; the per-event handlers do not have inner dedup. A second guard exists for `subscription_started` only (skip if already on paid plan + has subscriptionId + not comp).
- **Fan-out emails have NO cap and run effectively in parallel** via `Promise.allSettled`. Workspace deletion of a 50-person workspace = 49 `workspaceDeletedMember` emails fired ≈ in parallel. Access-request notification of a 200-member workspace = up to 200 emails per request. Ownership transfer = 2 emails (always). Workspace invite-batch = N emails (one per address in the batch). None pace, none batch, none warn at high counts.
- **Preference gate covers only 9 of the 33 distinct sends.** All 10 billing templates, the 7 account-lifecycle/security templates, and 7 of the workspace-collaboration templates (invites, access requests, ownership, deletion fan-out, member removal, email change, password reset, verification) bypass preferences entirely via `sendEmailOrLog`. Only the notification-family + welcome + plan-limit + invite-accepted are preference-gated. There is no per-template granularity within a category (no "mentions only, no new comments"); a user who turns off `notifications` loses all 5 notification templates at once.
- **There is no preferences UI.** The unsubscribe page exists at [app/unsubscribe/page.tsx](../app/unsubscribe/page.tsx) and writes `users/{uid}.emailPreferences.{category}=false`. The "Manage email preferences" link in the post-unsubscribe confirmation points at `/settings?tab=notifications`, which does not exist (TODO at line 141-143). The ONLY way a user changes preferences today is by clicking unsubscribe in an email.
- **`fireAndForget` is the dominant pattern for email sends.** Errors are caught and `console.error`'d; Resend failures never propagate. No retry on Resend rate-limit, no DLQ, no per-recipient suppression check. A bounced address gets re-sent every time it's hit.
- **No Resend `tags`/categories on send.** Per the prior audit fix #8 (deferred). Means "how many comment emails did user X get this week" is answerable only by greping Vercel logs (`[new-comment-email] recipient=… sent=true`) — there is no Resend dashboard breakdown by template.

---

## 2. Trigger-by-trigger behavior

Every `Send` column is one Resend call. "Sync" means the route awaits the send before responding; "async (fAF)" means `fireAndForget` / `void (async () => {…})()` / bare `void send(...)` — the route returns and the send completes in the background. "Sync, allSettled" means awaited but inside a `Promise.allSettled` wrapper around a parallel fan-out.

### 2a. Notifications (preference-gated under `notifications`)

| Template | Trigger site | Trigger condition | Sends per trigger | Recipients | Sync? | Prefs gate |
|---|---|---|---|---|---|---|
| `newComment` | [commentsRepository.server.ts:282-291](../lib/repositories/commentsRepository.server.ts#L282-L291) | `addCommentRepo` → POST `/api/feedback/[id]/comments` succeeds | 0..2 | `{ticket.userId, ticket.assigneeId} \ {commenter} \ {mentionedUserIds}` | async (fAF) | YES, `notifications` |
| `mention` | [commentsRepository.server.ts:270-280](../lib/repositories/commentsRepository.server.ts#L270-L280) | Same as above when the comment carries `mentionedUserIds` | 0..N (N = len(mentionedUserIds) − 1 if commenter mentioned themselves, else len) | `mentionedUserIds \ {commenter}` | async (fAF) | YES, `notifications` |
| `mention` (description) | [app/api/tickets/[id]/route.ts:566-578](../app/api/tickets/[id]/route.ts#L566-L578) | PATCH `/api/tickets/:id` where `description` changed and adds NEW mentions vs. the previous description | 0..N | `diffMentionSets(prev, next) \ {actor}` | async (fAF) | YES, `notifications` |
| `ticketAssigned` | [app/api/tickets/[id]/route.ts:491-502](../app/api/tickets/[id]/route.ts#L491-L502) | PATCH `/api/tickets/:id` where `assigneeId` changes to a non-null UID OTHER than the actor | 0..1 | `afterAssigneeId` (if `!== actorId`) | async (fAF) | YES, `notifications` |
| `ticketResolved` | [app/api/tickets/[id]/route.ts:381-388](../app/api/tickets/[id]/route.ts#L381-L388) | PATCH `/api/tickets/:id` transitions open → resolved | 0..1 | `ticket.userId` (reporter), only if `!== actor` | async (fAF) | YES, `notifications` |
| `sessionOpened` | [sessionsRepository.server.ts:300-351](../lib/repositories/sessionsRepository.server.ts#L300-L351) | First non-owner viewer touches `recordSessionView`; transaction wins | exactly 1 per session, EVER | session owner | async (fAF, transaction-gated) | YES, `notifications` |
| `inviteAccepted` | [app/api/workspace/invitations/accept/[token]/route.ts:346-354](../app/api/workspace/invitations/accept/[token]/route.ts#L346-L354) | Invitee POSTs accept | exactly 1 | inviter (`invitation.invitedBy`) | sync | YES, `notifications` |

### 2b. Lifecycle (preference-gated under `lifecycle`)

| Template | Trigger site | Trigger condition | Sends per trigger | Recipients | Sync? | Prefs gate |
|---|---|---|---|---|---|---|
| `welcome` | [usersRepository.server.ts:252-263](../lib/repositories/usersRepository.server.ts#L252-L263) | `ensureUserRepo` fresh-signup branch; transaction claims `users/{uid}.emailSends.welcome` | exactly 1 per uid, EVER | new user | async (fAF, transaction-gated) | YES, `lifecycle` |
| `planLimitApproaching` | [planLimitDispatch.server.ts:112-148](../lib/email/planLimitDispatch.server.ts#L112-L148) | POST `/api/feedback` succeeds AND `ratioBefore < 0.8 ≤ ratioAfter < 1.0` AND not already sent this billing cycle | 0..1 per cycle | workspace owner | async (.then chain off counter increment) | YES, `lifecycle` |
| `planLimitHit` | [planLimitDispatch.server.ts:156-180](../lib/email/planLimitDispatch.server.ts#L156-L180) | POST `/api/feedback` blocked by `checkFeedbackTicketLimit` with code `PLAN_LIMIT_REACHED` AND not already sent this cycle | 0..1 per cycle | workspace owner | async (void IIFE) | YES, `lifecycle` |

### 2c. Account / security (transactional, **no preference gate**)

| Template | Trigger site | Trigger condition | Sends per trigger | Recipients | Sync? |
|---|---|---|---|---|---|
| `passwordReset` | [app/api/auth/forgot-password/route.ts:107](../app/api/auth/forgot-password/route.ts#L107), [app/api/users/send-password-reset/route.ts:57](../app/api/users/send-password-reset/route.ts#L57) | User submits forgot-password OR clicks "send reset" in settings | 1 per request | self | sync |
| `emailVerification` | [app/api/auth/send-verification/route.ts:109](../app/api/auth/send-verification/route.ts#L109) | User triggers verification resend (signup flow or settings) | 1 per request | self | sync |
| `emailChange` | [app/api/users/change-email/route.ts:97-102](../app/api/users/change-email/route.ts#L97-L102) | User submits change-email | 1 to NEW address | new email | sync, allSettled |
| `emailChangeNotice` | [app/api/users/change-email/route.ts:103-108](../app/api/users/change-email/route.ts#L103-L108) | Same request | 1 to OLD address (security alert) | original email | sync, allSettled |
| `memberRemoved` | [app/api/workspace/members/[uid]/route.ts:111](../app/api/workspace/members/[uid]/route.ts#L111) | Owner/admin removes a member | 1 | the removed user | sync |
| `workspaceDeletedConfirmation` | [app/api/workspace/route.ts:72-76](../app/api/workspace/route.ts#L72-L76) | Owner deletes workspace (soft delete) | 1 | owner | sync |
| `workspaceDeletedMember` | [app/api/workspace/route.ts:102-109](../app/api/workspace/route.ts#L102-L109) | Same request, fan-out to non-owner members | N where N = `members.length − 1` (excludes owner) | every non-owner member | async (void IIFE, allSettled inside) |
| `ownershipTransferredOld` | [app/api/workspace/ownership/route.ts:206-212](../app/api/workspace/ownership/route.ts#L206-L212) | Owner transfers ownership | 1 | previous owner | async (allSettled) |
| `ownershipTransferredNew` | [app/api/workspace/ownership/route.ts:215-225](../app/api/workspace/ownership/route.ts#L215-L225) | Same request | 1 | new owner | async (allSettled) |

### 2d. Workspace / session collaboration (transactional, no preference gate)

| Template | Trigger site | Trigger condition | Sends per trigger | Recipients | Sync? |
|---|---|---|---|---|---|
| `workspaceInvite` | [app/api/workspace/members/invite/route.ts:193](../app/api/workspace/members/invite/route.ts#L193), [app/api/workspace/members/invite-batch/route.ts:288](../app/api/workspace/members/invite-batch/route.ts#L288), [app/api/workspace/members/invitations/[token]/resend/route.ts:83](../app/api/workspace/members/invitations/[token]/resend/route.ts#L83) | Owner creates invite (single, batch, or resend) | 1 (single/resend) or N (batch) | invitee | sync (single/resend), sync allSettled (batch) |
| `workspaceInviteReminder` | [app/api/cron/workspace-invite-reminders/route.ts:52](../app/api/cron/workspace-invite-reminders/route.ts#L52) | Daily cron (09:00 UTC) | up to all pending invites aged 25-26 days that haven't gotten a reminder | invitee | sync, per-doc loop |
| `sessionInvite` | [app/api/sessions/[sessionId]/invite/route.ts:189](../app/api/sessions/[sessionId]/invite/route.ts#L189), [app/api/sessions/[sessionId]/invite/route.ts:325](../app/api/sessions/[sessionId]/invite/route.ts#L325) | Owner shares a session by email (existing-account branch + new-account branch) | 1 per address | invitee | async (bare void) |
| `accessRequestNotification` | [app/api/sessions/[sessionId]/request-access/route.ts:151-157](../app/api/sessions/[sessionId]/request-access/route.ts#L151-L157) | Viewer requests access | N = union(workspaceOwners ∪ sessionMembers) − requester | every owner + every session member | async (void IIFE, allSettled inside) |
| `accessRequestResult` | [app/api/sessions/[sessionId]/access-requests/route.ts:250](../app/api/sessions/[sessionId]/access-requests/route.ts#L250), [L377](../app/api/sessions/[sessionId]/access-requests/route.ts#L377) | Owner/admin approves or denies | 1 | requester | async (bare void) |

### 2e. Billing (transactional, no preference gate, behind webhook idempotency)

All from [app/api/billing/webhook/route.ts](../app/api/billing/webhook/route.ts). All sync inside the webhook handler (await before recording the idempotency stamp).

| Template | Stripe event(s) | Recipients | Sends per accepted event |
|---|---|---|---|
| `subscriptionConfirmation` | `customer.subscription.created` → `subscription_started` | workspace owner | 1, only if `!alreadyPaid \|\| wasManualOverride` (the comp-clear branch) |
| `subscriptionCancelled` | `customer.subscription.deleted` → `subscription_canceled` | workspace owner | 1, only if `wasOnPaidPlan` |
| `paymentFailed` | `invoice.payment_failed` → `payment_failed` | workspace owner | 1, only if `!wasSuspended` (skips repeated failures while already suspended) |
| `renewalReceipt` | `invoice.paid` (renewal only — `billing_reason === "subscription_cycle"`, skips first invoice) | workspace owner | 1 |
| `upcomingRenewalReminder` | `invoice.upcoming` (Stripe schedules ~7 days pre-renewal) | workspace owner | 1 |
| `cardExpiring` | `customer.source.expiring` | workspace owner | 1 |
| `paymentMethodUpdated` | `payment_method.attached` | workspace owner | 1 |
| `planChanged` | `subscription_updated` AND plan or cycle actually changed | workspace owner | 1; subject variants for upgrade/downgrade/lateral |
| `refundIssued` | `charge.refunded` | workspace owner | 1 |
| `seatAdded` | NOT webhook — sent from [app/api/workspace/invitations/accept/[token]/route.ts:400](../app/api/workspace/invitations/accept/[token]/route.ts#L400) when an accepted invite GROWS the seat count | workspace owner | 1 (per seat-add event), behind the same accept flow that also fires `inviteAccepted` |

### 2f. Dev preview route

[app/dev/email-preview/[template]/route.ts](../app/dev/email-preview/[template]/route.ts) renders only; no send. Not a cadence concern.

---

## 3. Recipient logic deep dive

### 3a. Self-action filtering

| Template | Self-filtered? | Where |
|---|---|---|
| `newComment` | YES | `commentRecipientSet` adds creator + assignee only if `!== resolvedUserId` ([commentsRepository.server.ts:211-217](../lib/repositories/commentsRepository.server.ts#L211-L217)) |
| `mention` (comment) | YES | `mentionRecipients = mentionedIds.filter(id !== resolvedUserId)` ([commentsRepository.server.ts:237-239](../lib/repositories/commentsRepository.server.ts#L237-L239)); ALSO pre-filtered in `filteredMentionedUserIds` at write time ([L105-L107](../lib/repositories/commentsRepository.server.ts#L105-L107)) |
| `mention` (description) | YES | `recipientIds.filter((uid) => uid && uid !== actorId)` ([app/api/tickets/[id]/route.ts:520-521](../app/api/tickets/[id]/route.ts#L520-L521)) |
| `ticketAssigned` | YES | `afterAssigneeId !== activityActorId` check ([app/api/tickets/[id]/route.ts:477](../app/api/tickets/[id]/route.ts#L477)). Self-assignment skipped. Unassignment (`null`) also skipped. |
| `ticketResolved` | YES | `reporterUid && reporterUid !== actorId` ([app/api/tickets/[id]/route.ts:360](../app/api/tickets/[id]/route.ts#L360)). Self-resolve skipped. |
| `sessionOpened` | YES | `firstView` only set when `viewerId !== ownerUid` ([sessionsRepository.server.ts:289-297](../lib/repositories/sessionsRepository.server.ts#L289-L297)). Owner viewing their own session does NOT trigger. |
| `inviteAccepted` | n/a (accepter and inviter are inherently different users; no explicit check, but `invitation.invitedBy === acceptedBy` would require sending to oneself — protected only by the natural flow) |
| `welcome` | n/a — self by definition |
| `accessRequestNotification` | YES at the email layer | `emails.filter((e) => e !== requesterEmail)` ([app/api/sessions/[sessionId]/request-access/route.ts:148](../app/api/sessions/[sessionId]/request-access/route.ts#L148)) — by email, not uid; safe because requester is identified by email |
| `accessRequestResult` | n/a — the requester is the recipient by definition |
| `memberRemoved` | n/a (removed user, not the remover) |
| `ownershipTransferredOld/New` | n/a (separate parties) |
| `workspaceDeletedMember` | YES | `members.filter((m) => m.uid !== user.uid)` excludes the deleter/owner ([app/api/workspace/route.ts:100](../app/api/workspace/route.ts#L100)) |
| `workspaceInvite` / `sessionInvite` | n/a (sent to invitee email, not the inviter) |

**Holes:** None found in the self-action set. The trigger sites uniformly filter the actor out.

### 3b. Recipient deduplication across email types

The only cross-type dedup is **mention ⇄ newComment**:
- A comment with `mentionedUserIds=[Sarah, Daniel]` posted by Maya: `commentRecipientSet` starts as `{ticket.creator, ticket.assignee} \ {Maya}`, then `for (const mid of mentionedIds) commentRecipientSet.delete(mid)` ([commentsRepository.server.ts:218](../lib/repositories/commentsRepository.server.ts#L218)). Sarah and Daniel get `mention` only. Anyone in `commentRecipientSet` who was NOT mentioned gets `newComment` only.
- Description mentions on a PATCH `/api/tickets/:id` (no comment involved) have no comment-side path to dedup against — just one `mention` per newly-added uid.

**Holes:**
- `ticketAssigned` + `mention` (description): if Maya edits a ticket description to mention Daniel AND simultaneously reassigns the ticket to Daniel in the same PATCH, Daniel will receive BOTH a `ticketAssigned` and a `mention` email. Both paths fire from the same handler; no cross-check. (Realistic scenario for a single triage edit.)
- `ticketAssigned` + `newComment`: assignee is in the new-comment recipient set with no exclusion. If Maya assigns Daniel and then comments on the ticket in two requests, Daniel gets one `ticketAssigned` + one `newComment`. (Expected.)
- `ticketResolved` + `newComment`: a resolver who is also the reporter is filtered by self-action. But a resolver who simultaneously posts a "marking resolved" comment in two separate requests sends the reporter both a `newComment` and a `ticketResolved`. No cross-check.
- `inviteAccepted` + `seatAdded`: both fire from the same accept handler. `inviteAccepted` goes to the inviter (preference-gated). `seatAdded` goes to the workspace owner (always). If inviter == owner, the owner gets BOTH emails for the same accept event. No cross-check.

### 3c. Fan-out behavior

| Trigger | Fan-out scope | Cap? | Parallelism |
|---|---|---|---|
| `newComment` / `mention` | bounded by ticket creator + assignee + #mentions — usually 1–3, never huge | none | `Promise.allSettled` over both lists |
| `sessionOpened` | exactly 1 (owner) | implicit (transaction guard) | n/a |
| `ticketAssigned` / `ticketResolved` | exactly 1 | none needed | n/a |
| `welcome` | exactly 1 | implicit (transaction guard) | n/a |
| `accessRequestNotification` | `union(workspaceOwners ∪ sessionMembers) − requester`. Workspace owners is typically 1, but session members can be large. NO cap on workspace owners or session members. | NONE | `Promise.allSettled` |
| `workspaceDeletedMember` | every workspace member except deleter. `getWorkspaceMembersRepo` returns the full list; no slicing. | NONE | `Promise.allSettled` |
| `workspaceInvite` (batch) | one per invited email — bounded by what the inviter pasted into the UI | NONE in this code path; upstream UI may cap | `Promise.allSettled` |
| `ownershipTransferred*` | exactly 2 (old owner + new owner) | n/a | `Promise.allSettled` |
| `accessRequestResult` | exactly 1 | n/a | n/a |
| `memberRemoved` | exactly 1 | n/a | n/a |
| `workspaceInviteReminder` (cron) | every pending invite aged 25-26d, exactly once (`reminderSentAt` stamp) | per-doc | sequential `for…of` |
| `seatAdded` | exactly 1 (workspace owner) | n/a | n/a |
| All billing templates | exactly 1 (workspace owner) | per-event idempotency | n/a |

**Worst case observed in code:** `accessRequestNotification` can hit every workspace owner + every session member in one request, with no batching or pacing. For a workspace with 200 members where the session is shared with all of them, a single access request fires ~200 emails in parallel — Resend will receive ~200 simultaneous calls from one Node process. There's also no `accessRequestNotification` dedup if the same requester requests access twice (an `already_requested` early-return in `createAccessRequest` does protect against this — [app/api/sessions/[sessionId]/request-access/route.ts:115-122](../app/api/sessions/[sessionId]/request-access/route.ts#L115-L122)).

### 3d. Watcher / subscriber model

There is no watcher model. "Who gets notified about a ticket" is computed from the ticket row at trigger time:

- For `newComment`: `feedback.userId` (reporter) + `feedback.assigneeId` (assignee), minus mention recipients, minus the commenter. **No "all prior commenters", no "all session members", no "anyone who reacted".**
- For `mention`: explicit `mentionedUserIds` only.
- For `ticketResolved`: `feedback.userId` (reporter) only. The assignee, who likely cares, is NOT notified.
- For `ticketAssigned`: the new assignee only.

This is much narrower than a typical "watchers" model and naturally bounds noise. The flip side is that someone who comments on a ticket they didn't create or aren't assigned to will never hear about the next comment.

---

## 4. Debouncing / batching / throttling

| Pattern | Present? | Where |
|---|---|---|
| Time-window debouncing per recipient ("no more than 1 every N min") | **NO** | not found anywhere |
| Activity batching ("queue events, send one summary email") | **NO** | not found |
| Digest emails (daily/weekly summary) | **NO** | explicit "post-launch" note in [usersRepository.server.ts:423](../lib/repositories/usersRepository.server.ts#L423) (`day1Capture, day3Sessions, day7InviteTeam, day14CheckIn, inactivity`); preferences include `digest: true` default but nothing reads it |
| Per-recipient rate cap (per hour/day) | **NO** | not found |
| Per-session cooldown (`sessionOpened` no more than every X min) | **NO** — the guard is stricter (once per session ever), not a cooldown |
| Idempotency / dedup tables | **PARTIAL** | webhook-event-id dedup in `webhookEvents` collection; per-cycle plan-limit stamps; per-uid `emailSends.welcome`; per-session `emailSends.firstViewerNotified`; per-invitation `reminderSentAt`. NO dedup for `newComment`/`mention`/`ticketAssigned`/`ticketResolved`/`accessRequestNotification`/any of the workspace/session collaboration emails. |
| Background queue with delay | **NO** | only the daily cron + per-call `fireAndForget` (which is in-process, not queued) |

**Verdict:** the codebase has single-shot "fire once per X" idempotency keys for four specific events (welcome, session-opened, plan-limit approaching, plan-limit hit) and an event-level webhook dedup. There is no temporal smoothing, no batching, no rate limiting at any layer. Every other email fires instantly per trigger.

---

## 5. Preference categories

### 5a. Categories

Defined in [lib/email/preferences.ts:18-23](../lib/email/preferences.ts#L18-L23):

```ts
DEFAULT_EMAIL_PREFERENCES = {
  lifecycle: true,
  notifications: true,
  digest: true,
  marketing: true,
};
```

Plus an always-on `transactional` bucket in `EmailCategory` (not stored on the user; the gate is hard-coded `category === "transactional" → return true`).

| Category | Used by templates | Default | Granularity |
|---|---|---|---|
| `lifecycle` | `welcome`, `planLimitApproaching`, `planLimitHit` | ON | category-level only |
| `notifications` | `newComment`, `mention`, `ticketAssigned`, `ticketResolved`, `sessionOpened`, `inviteAccepted` | ON | category-level only |
| `digest` | nothing (no caller reads it) | ON | n/a |
| `marketing` | nothing (no caller reads it) | ON | n/a |
| `transactional` | every other template (16 in workspaceEmails + 10 in billingEmails — see §2c, §2d, §2e) | n/a | always on |

### 5b. Defaults — opt-in or opt-out?

**Opt-out, all-enabled by default.** `getEmailPreferences(user) = { ...DEFAULT_EMAIL_PREFERENCES, ...user.emailPreferences }` — a missing or empty stored object means every category is `true`. A new user gets every preference-gated email by default.

### 5c. Granularity

**Category-level only.** A user who turns off `notifications` loses comments, mentions, assignments, resolves, session-opened, and invite-accepted as a single switch. Mentions cannot be kept on while turning comments off.

### 5d. Which templates use which path

| Path | Preference-gated? | Templates |
|---|---|---|
| `sendEmailOrLog` | NO | every billing template (10), every account/security template (7 — passwordReset, emailVerification, emailChange, emailChangeNotice, workspaceDeletedConfirmation, workspaceDeletedMember, memberRemoved), every workspace/session collaboration template except `inviteAccepted` (7 — workspaceInvite, workspaceInviteReminder, sessionInvite, accessRequestNotification, accessRequestResult, ownershipTransferredOld, ownershipTransferredNew) |
| `sendEmailWithPreferences` / `…ByUid` | YES | welcome, sessionOpened, newComment, mention, ticketAssigned, planLimitApproaching, planLimitHit, ticketResolved, inviteAccepted (9 templates) |

This matches the prior audit's classification — and is unchanged by the deliverability fix (the fix added `unsubscribeUrl` plumbing without changing which path a template uses).

### 5e. Unsubscribe surface

- **One-click link in the email footer.** Emitted only when an `unsubscribeUrl` is threaded through, i.e., only on the 9 preference-gated templates. The other 24 templates have no unsubscribe footer at all (CAN-SPAM transactional exemption).
- **Page: [/unsubscribe?token=…](../app/unsubscribe/page.tsx).** Token = HMAC over `uid:category:timestamp`. Verifies, then POSTs (form auto-submit) to write `emailPreferences.{category}=false`. Token category can be `lifecycle | notifications | digest | marketing | all`. `all` flips all four to false at once.
- **`List-Unsubscribe` + `List-Unsubscribe-Post: One-Click` headers** are set only when the send carries an `unsubscribeUrl` ([lib/email/resend.ts:118-122](../lib/email/resend.ts#L118-L122)) — i.e., on the same 9 templates.
- **There is NO preferences UI.** The post-unsubscribe confirmation links to `/settings?tab=notifications` (line 145), but a `TODO(post-launch)` at line 141-143 confirms this tab does not yet exist. A user who wants to resubscribe or adjust categories has no in-product way to do so today.
- **Footer per-email "unsubscribe" link category** is whatever category the email was sent under — clicking unsubscribe from a `newComment` email only turns off `notifications`. To turn off everything, the user would need to hit unsubscribe on a `lifecycle` AND a `notifications` email (no "unsubscribe from all" link is currently surfaced — the `all` category exists in code but no template builds a URL using it).

### 5f. Mention-as-override

**Not implemented.** A user with `notifications: false` will NOT receive mention emails. `canSendEmail(user, "notifications")` returns false uniformly — both `sendNewCommentEmail` and `sendMentionEmail` use the same `notifications` category and are gated identically. There is no "always send mentions" carve-out.

---

## 6. High-noise scenario traces

Assumptions:
- All users have default preferences (`notifications: true`, `lifecycle: true`).
- `notifications` opt-outs don't apply (covered separately above).
- "Watching" doesn't exist; only ticket creator + ticket assignee are notified on comments.

### Scenario A — Burst of 5 comments across 3 tickets in 10 minutes

Setup: Maya owns session S. Sarah leaves 5 comments on 3 different tickets in S, 10-min window.
Assume ticket creators are Maya (she created all 3 tickets — typical for the owner). No assignees. No mentions.

- Maya: per comment, she is `ticket.userId`, Sarah is the commenter, no mentions → `commentRecipients = {Maya}`. She gets one `newComment` per Sarah comment = **5 emails**.
- Sarah: filtered out as commenter on every send → **0 emails**.
- Anyone else in the session: not notified (no watcher model) → **0 emails**.

If tickets had different creators (e.g., 3 different reporters), each reporter gets 1 email per comment on their own ticket.

### Scenario B — One comment with two mentions, three watchers

Setup: Maya posts one comment on a ticket. Mentions Sarah and Daniel. Three other people are session members. Ticket creator: Maya. Ticket assignee: none.

- `mentionRecipients` = `[Sarah, Daniel]` (Maya filtered) → 2 `mention` emails.
- `commentRecipientSet` = `{Maya}` start (creator) → Maya filtered as commenter → `{}` → minus mentions → still `{}` → **0 `newComment` emails**.
- Three "watchers": not in creator/assignee/mention set → **0 emails**.

Total: Sarah gets 1 `mention`, Daniel gets 1 `mention`, watchers get 0. Maya gets 0 (own action).

Alternate (Maya is NOT the creator — say Daniel created the ticket): `commentRecipientSet` = `{Daniel}` → minus mentions (Daniel is mentioned) → `{}`. Daniel gets ONE email (the more-specific mention), not two. Confirmed by [commentsRepository.server.ts:218](../lib/repositories/commentsRepository.server.ts#L218).

### Scenario C — 8 viewers open Maya's session in 1 hour

Setup: Maya creates session S, shares the link, 8 distinct viewers open within 1 hour.

- `sessionOpened` is gated by `sessions/{S}.emailSends.firstViewerNotified` (a Firestore timestamp). The FIRST viewer's transaction wins, sets the stamp; all subsequent viewers find the stamp already set and skip.
- Maya gets **exactly 1 `sessionOpened` email**, naming the FIRST non-owner viewer.
- If Maya herself opens her own session, the trigger requires `viewerId !== ownerUid` ([L289-L297](../lib/repositories/sessionsRepository.server.ts#L289-L297)) — no email. (Even if she somehow set the stamp via the transaction, she still wouldn't be the named viewer.)
- This is once-per-session-ever. If Maya creates a SECOND session, that session's stamp is independent — the first viewer of session 2 triggers an email.

### Scenario D — Ticket lifecycle (Maya creates, assigns to Daniel, Daniel comments x2, Daniel resolves)

| Step | Actor | Recipients | Emails |
|---|---|---|---|
| Maya creates ticket | Maya | none (creation does not trigger an email) | 0 |
| Maya assigns Daniel | Maya | Daniel (`ticketAssigned`, since `afterAssigneeId !== actorId`) | Daniel: 1 |
| Daniel comments #1 | Daniel | `commentRecipientSet = {Maya, Daniel} \ {Daniel} = {Maya}` → Maya gets `newComment` | Maya: 1 |
| Daniel comments #2 | Daniel | same | Maya: 1 |
| Daniel resolves | Daniel | reporterUid=Maya ≠ Daniel → Maya gets `ticketResolved` | Maya: 1 |

Totals: Daniel = 1, Maya = 3 (one assigned-side path, but Daniel was the assigner there; wait — re-reading: in step 2 Maya IS the assigner, Daniel IS the assignee → Daniel gets the email. In step 3 Daniel is now the assignee, so when Daniel comments, the commenter==Daniel; recipients = `{Maya} ∪ {Daniel(assignee)} \ {Daniel} = {Maya}`. Confirms Daniel does not get his own comment email).

If "other watchers of the session" means non-creator non-assignee folks: they get nothing.

### Scenario E — Ownership transfer in a 10-person workspace

Setup: Maya is the owner of a 10-person workspace. She transfers ownership to Daniel.

- `Promise.allSettled` over exactly two sends ([ownership/route.ts:204-227](../app/api/workspace/ownership/route.ts#L204-L227)):
  - Maya gets `ownershipTransferredOld` (1 email).
  - Daniel gets `ownershipTransferredNew` (1 email).
- The other 8 members get **0 emails**. No fan-out exists for the transfer event.

Total: 2 emails, sent in parallel via `Promise.allSettled`.

### Scenario F — Plan limit crossed multiple times in a single morning

Setup: Workspace hits 80% on Tuesday 10:00. Crosses 90%, 95%, then 100% at 11:00. Same billing cycle, no month rollover.

- `planLimitApproaching` is keyed off the EXACT 80% crossing: `ratioBefore < 0.8 && ratioAfter >= 0.8 && ratioAfter < 1.0`. The first feedback create that crosses 80% triggers a candidate send; the per-cycle transaction stamps `planLimitWarnings.approaching.lastSentAt`. Subsequent crossings into 90%, 95% find `lastSentAt` is fresh-this-cycle → the transaction returns false → no send. **One `planLimitApproaching` total.**
- When the workspace tries to create the next ticket at 100% (`checkFeedbackTicketLimit` throws `PLAN_LIMIT_REACHED`), `maybeSendPlanLimitHit` fires. First time this cycle → stamps `planLimitWarnings.hit.lastSentAt` → sends 1 email. Subsequent blocked creates this cycle find the stamp → no send. **One `planLimitHit` total.**
- Per cycle, owner gets at most 1 of each (2 total).
- A new billing cycle (next month rollover) resets `usage.feedbackResetDate` to the new 1st-of-month → both stamps are older than the new cycleStart → both can fire again.

Edge case: if the workspace was already over the limit on a Starter plan, then downgrades / changes plan mid-month, the lastSentAt timestamp from the previous send still suppresses re-fire for the rest of the original cycle — there's no plan-change reset. (Could leave a user without warning emails until the calendar 1st-of-next-month.)

### Scenario G — Stripe webhook delivered 3x for one event

Setup: Stripe sends `invoice.payment_succeeded` once; webhook 500s twice (e.g. transient downstream), succeeds on the 3rd delivery. Same `event.id`.

- Each delivery enters the handler, parses the event, and **looks up `webhookEvents/{provider}_{event.eventId}`** ([app/api/billing/webhook/route.ts:120-130](../app/api/billing/webhook/route.ts#L120-L130)).
- Delivery 1: idempotency doc does not exist → handler runs `handleInvoicePaid` → sends `renewalReceipt` → BUT if any code inside the handler throws (Firestore write fail, Resend rate-limit), the handler reaches the catch and returns 500. The idempotency record is written **after** the switch — if the switch fails, the record is NOT written. Delivery 2 will re-enter the handler. **The email will be re-sent on the retry that completes the switch.**
- Delivery 2 (assuming delivery 1 wrote the email but failed AFTER on a different line, idempotency NOT recorded): re-sends the email. Owner sees 2 receipts.
- Delivery 3 succeeds: writes the idempotency stamp. Future re-deliveries dedupe.

**Verdict:** The idempotency guard is at the BOUNDARY of the handler, not around the email send. For events where the email is the only side-effect (`renewalReceipt`, `cardExpiring`, `paymentMethodUpdated`, `refundIssued`, `upcomingRenewalReminder`), a partial-failure-then-retry scenario CAN double-send. For events that also write to Firestore first (`subscription_started`, `subscription_updated`, `subscription_canceled`, `payment_failed`), the inner workspace state check (`alreadyPaid && !wasManualOverride`, `wasOnPaidPlan`, `wasSuspended`) acts as a second guard and typically blocks the redundant email even when the outer dedup record wasn't written. The renewal-receipt path has NO such inner guard.

---

## 7. Cron and scheduled jobs

All cron jobs in the repo. Schedules are in [vercel.json](../vercel.json).

| Path | Schedule | What it does | Emails? | Dedup |
|---|---|---|---|---|
| `/api/cron/workspace-invite-reminders` | `0 9 * * *` (daily 09:00 UTC) | Queries `workspaceInvitations` where `status==pending` AND `createdAt` is 25-26 days ago. For each, sends `workspaceInviteReminder` and stamps `reminderSentAt` | YES: 1 `workspaceInviteReminder` per matching invitation | `if (data.reminderSentAt != null) continue;` — per-invitation, single-shot |
| `/api/cron/workspace-purge` | `0 3 * * *` (daily 03:00 UTC) | Hard-purges workspaces whose 30-day soft-delete window expired | NO email | per-workspace single-shot (deleted record disappears) |
| `/api/cron/cleanup-temp-screenshots` | NOT in vercel.json (orphan?) | Deletes TEMP screenshots > 1 hour old | NO email | not relevant |

**Findings:**
- Only one cron sends mail (workspace invite reminders). Single send per matching invite per day; the `reminderSentAt` stamp prevents the same invite getting a second reminder if a retry runs.
- The 25-26 day window in [workspace-invite-reminders/route.ts:25-27](../app/api/cron/workspace-invite-reminders/route.ts#L25-L27) is 1 day wide. The cron runs daily. So each pending invite gets at most one reminder email in its lifetime.
- The `cleanup-temp-screenshots` route exists but is NOT in `vercel.json`'s `crons` array — either dead code or invoked elsewhere; no email impact.
- No other scheduled job (no Inngest, no BullMQ, no Trigger.dev, no Quirrel — verified by grepping for these names; none in package.json).

---

## 8. Plan limit logic — detail

From [lib/email/planLimitDispatch.server.ts](../lib/email/planLimitDispatch.server.ts):

| Concern | Behavior |
|---|---|
| Thresholds | 80% (approaching) and 100% (hit). No 50/60/90/95/etc. |
| Approaching evaluated when | Every successful feedback create, in the `.then` chain off `incrementFeedbackCreatedThisMonthRepo` ([feedback/post.ts:351-374](../app/api/feedback/post.ts#L351-L374)). Async, never blocks the POST. |
| Approaching fires when | EXACT 80% crossing: `ratioBefore < 0.8 && ratioAfter >= 0.8 && ratioAfter < 1.0`. NOT triggered at 81%, 90%, 95% — only on the single create that took the usage across 80%. |
| Hit evaluated when | `checkFeedbackTicketLimit` throws `PLAN_LIMIT_REACHED` (i.e. the user attempts to create a ticket and is blocked). |
| Once-per-cycle guard | Firestore transaction on `workspaces/{id}.planLimitWarnings.{kind}.lastSentAt`. If the stamp is ≥ `cycleStartMillis(workspace)`, return false → no send. The transaction also writes the stamp atomically, so two concurrent feedback creates can't both win. |
| Cycle start | Parsed from `workspace.usage.feedbackResetDate` (YYYY-MM-DD string for the 1st of the current month). Missing/garbage → `cycleStart = 0` (never suppress). |
| Downgrades mid-cycle | NOT handled. If the plan changes mid-cycle in a way that lowers the limit (e.g., Business → Starter, with usage already > new limit), the previous `lastSentAt` still suppresses re-fire. No reset on plan change. |
| Plan limit absent (e.g., enterprise unlimited) | `planLimit` is null/`Infinity` → both functions early-return. No emails. |
| Owner email missing | early-return after `getUserByIdRepo` returns null. No fallback to a different admin. |
| Repeat-fire risk inside a cycle | Zero (guarded by the once-per-cycle stamp). |
| Cross-cycle re-fire | YES — when `usage.feedbackResetDate` advances to a new month's 1st, the `lastSentAt` from the previous cycle is now before `cycleStart` → next 80% crossing in the new cycle re-fires. Expected behavior. |

---

## 9. Failure modes

### 9a. Resend errors

- `sendEmailOrLog` ([resend.ts:124-136](../lib/email/resend.ts#L124-L136)) `throw`s on a Resend error response. Callers wrap this in `try/catch` and return `{ sent: false, reason }`. No retry. No backoff. No queue.
- `sendEmailWithPreferences` ([sendEmailWithPreferences.ts:90-105](../lib/email/sendEmailWithPreferences.ts#L90-L105)) catches the inner throw and converts to `{ sent: false, reason }`.
- A 4xx from Resend (recipient suppressed, etc.) is logged once and lost. A 5xx / rate-limit is treated the same way.
- No suppression-list check before sending — the same suppressed address will be tried again on every event.

### 9b. fire-and-forget swallow

Almost every notification email is sent inside `fireAndForget(...)` ([fireAndForget.ts:7-15](../lib/server/fireAndForget.ts#L7-L15)) or a bare `void (async () => { try { … } catch (e) { console.error(…) } })()`. Errors `console.error` only — never returned to the caller, never paged, never re-queued.

### 9c. Client retries

- The comment add path is idempotent via `clientId` ([commentsRepository.server.ts:126-136](../lib/repositories/commentsRepository.server.ts#L126-L136)) — duplicate POST with the same clientId throws `ADD_COMMENT_DUPLICATE_ID`, mapped to HTTP 409. The email send sits INSIDE the success path, so duplicate POSTs do NOT double-send.
- Feedback create is similarly idempotent via `feedbackId` ([app/api/feedback/post.ts:330-339](../app/api/feedback/post.ts#L330-L339)); the `inserted` flag determines whether the plan-limit chain runs.
- PATCH `/api/tickets/[id]` is NOT idempotency-keyed. A double-click that fires two PATCHes resolving the same ticket open→resolved would: first PATCH transitions the row, second PATCH finds `wasOpen = existingForOwnership.isResolved === false` is FALSE (because the first PATCH committed) → skips `sendTicketResolvedEmail`. So the natural state guard prevents double-send IF the second request reads the post-first-write state. If they overlap (race), it's possible (but the Firestore transaction in `updateFeedbackResolveAndSessionCountersRepo` should serialize them).
- Assignment changes use `assignmentChanged` ([app/api/tickets/[id]/route.ts:416-419](../app/api/tickets/[id]/route.ts#L416-L419)) — `after !== before`. Reassigning to the same uid is a no-op (no email).

### 9d. Idempotency guards on the trigger side

| Trigger | Trigger-side dedup? |
|---|---|
| `newComment` / `mention` | Yes — via `clientId` on comment create (no comment row, no email) |
| `ticketAssigned` | Partial — only fires when `assignmentChanged`. Re-assigning to same user = no email. But there is no "we already emailed X for being assigned to ticket Y" record; reassigning A→B→A would send two emails to A. |
| `ticketResolved` | Partial — only fires on `open → resolved` transition. Re-resolve a ticket that's already resolved: `wasOpen` false → no email. Resolve → reopen → resolve would send the email twice. |
| `sessionOpened` | Yes — single-shot stamp per session |
| `welcome` | Yes — single-shot stamp per uid |
| `planLimit*` | Yes — per-cycle stamps |
| `inviteAccepted` | No — re-accepting (somehow) would re-send; the underlying invitation row's state guard (`accepted` once it's accepted) is the implicit dedup |
| `seatAdded` | No explicit dedup; bound to the accept path which has its own state guard |
| `workspaceInviteReminder` | Yes — `reminderSentAt` |
| Workspace invites (`workspaceInvite`) | No dedup. The "resend invite" route deliberately RE-fires the email (and rotates the invite token). |
| Ownership transfer | No explicit dedup; transferring back-and-forth would resend both emails each time. |
| Workspace deletion | Soft-delete is a one-way state; can't fan out the deletion emails twice. |
| Access requests | The underlying `createAccessRequest` throws `already_requested` for an active pending request → no duplicate notification. But if the previous request was denied/closed and the same user requests again, the email fires again. |
| Billing | Webhook-event-id dedup (boundary), not template-level. See §6 Scenario G. |

---

## 10. Observability

| Channel | What's logged |
|---|---|
| `console.log` | Per send: `[<label>] uid=… sent=true/false reason=…` from each notification dispatcher (e.g. `[new-comment-email]`, `[mention-email]`, `[plan-approaching-email]`). Plus dev-mode `📧 [DEV EMAIL — not sent]` block when `EMAIL_DEV_LOG=true` or no key. |
| `console.error` | All Resend failures ("[Resend] send failed"), all `fireAndForget` rejections, all dispatcher try/catch arms. |
| Vercel logs | The above are captured by Vercel's default log aggregation (no Datadog/Sentry hookup found in `package.json` or grep). |
| Sentry / Datadog / external APM | NOT FOUND. No `@sentry/*`, no `dd-trace`, no `winston`, no structured logger beyond `lib/utils/logger.ts` (which is just a `log()` wrapper around `console.log`). |
| Resend per-send tags / categories | NOT SET. Per the prior audit fix #8, this was deferred. No `tags: [...]` argument is passed in [lib/email/resend.ts:124-132](../lib/email/resend.ts#L124-L132). |
| `users/{uid}.emailSends.*` | Only `welcome` is currently tracked (with a forward-looking comment about future drip keys). |
| `workspaces/{wid}.planLimitWarnings.*` | Per-cycle stamps for both kinds. |
| `sessions/{sid}.emailSends.firstViewerNotified` | Set once per session. |
| `webhookEvents/{provider}_{eventId}` | Per-event dedup record; 30-day TTL via `expiresAt` field. |

**Tracing "how many emails has user X received this week":** has to be done by grepping Vercel logs for `recipient=<uid>` across template labels. There is no email log, no `emailSends` collection, no `messageId` persisted from Resend, no analytics event emitted from the send sites.

---

## 11. Open questions and ambiguities

1. **`digest` preference is defined but unused.** [preferences.ts:21](../lib/email/preferences.ts#L21) lists it as a default-true category. No code paths gate on `digest`. Is this a "preserve user choices for the future digest rollout" placeholder, or dead state? (Likely intentional — see [memory/email_phase5_postlaunch_todos.md](../../memory/email_phase5_postlaunch_todos.md).)
2. **`marketing` preference, same.** No template uses it; the `all` unsubscribe category turns it off though.
3. **`accessRequestNotification` fan-out scope.** The recipient set is `union(workspaceOwners, sessionMembers)` minus the requester. For a workspace with many "OWNER" role members (the codebase allows multiple owners?) AND a shared session, the fan-out can exceed dozens. There's no inspection of session size before fanning out.
4. **`ticketAssigned` + `mention` on the same PATCH.** Same-recipient double-send is possible (see §3b). Is this acceptable per product intent, or a missed dedup?
5. **Plan-limit downgrade mid-cycle.** If a workspace downgrades and the new limit is below current usage, `planLimitHit` will NOT fire because the previous-cycle `lastSentAt` still suppresses it. Acceptable, or should it fire on a plan change too?
6. **Re-open / re-resolve loop on a ticket.** Each open→resolved transition sends a `ticketResolved`. A reporter could be spammed by a flaky resolver. There's no "we just told this user 5 min ago" guard. Is this acceptable in practice?
7. **`cleanup-temp-screenshots` route is not in vercel.json** — orphan or invoked another way? Either way, no email impact, but worth noting.
8. **No suppression-list check before sending.** If Resend marks an address as suppressed after a hard bounce, we'll keep firing sends to it on every event (and every send burns API quota + risks deliverability score). Did out-of-band suppression cleanup (mentioned in fix summary) cover this risk durably, or just for the snapshot?
9. **Resend dashboard tags status.** The prior audit said tags were deferred. No `tags` param appears in the SDK call. Confirmed not implemented today.
10. **Webhook idempotency record is written AFTER the switch.** A partial-failure-then-retry scenario can double-send the renewal-receipt / refund / card-expiring / payment-method-updated / upcoming-renewal-reminder emails (the ones with no inner Firestore state guard). Real-world frequency depends on Stripe retry rate + the rarity of mid-handler errors. Not measured.
11. **`seatAdded` + `inviteAccepted` double-send when inviter == workspace owner.** Both fire from the same accept handler; one to inviter (`inviteAccepted`, preference-gated), one to owner (`seatAdded`, always). If they're the same person, the owner sees both within the same minute. Intended (different content) or noise?
12. **No "manage email preferences" UI.** The unsubscribe-confirmation page links to `/settings?tab=notifications`, which does not exist. Users who unsubscribe by category cannot re-subscribe or fine-tune from in-product UI — only by clicking another email link AFTER they've been unsubscribed (which they won't get because they unsubscribed). This is a one-way door for `lifecycle` (welcome only fires once per uid). Acceptable for launch?

---

## 12. Resolution (2026-05-26)

This audit's open findings are addressed in a single PR. See [`email-cadence-fix-summary.md`](email-cadence-fix-summary.md) for the rollout plan and behavior changes.

| Finding | Status | Resolution |
|---|---|---|
| #1 `digest` preference unused | **Closed** | Removed from `DEFAULT_EMAIL_PREFERENCES`, `EmailPreferences` type, `UnsubscribeCategory` enum, and the unsubscribe page's `all`-category fan-out. Legacy fields on existing Firestore user docs are now ignored at runtime (the reader uses the new defaults as the base; unknown keys pass through harmlessly). No migration required. |
| #2 `marketing` preference unused | **Closed** | Same removal pass as #1. |
| #3 `accessRequestNotification` fan-out | **Deferred** | Real but low-probability and best addressed post-launch with real workspace-size distribution data. Re-evaluate if any single send exceeds ~50 recipients. |
| #4 `ticketAssigned` + description-`mention` on same PATCH | **Closed by cooldown** | The new per-actor cooldown (lib/email/cooldowns.ts) absorbs this collision: `ticketAssigned` fires at app/api/tickets/[id]/route.ts:491 BEFORE the description-mention dispatch at line 568, so assignment wins and mention is suppressed in the same PATCH. Inline comment added at the dispatch site documenting the ordering invariant. |
| #5 Plan-limit downgrade mid-cycle | **Deferred** | Same per-cycle stamp semantics retained. Acceptable for launch; revisit if a downgrade-after-suppression case is reported. |
| #6 Re-open / re-resolve loop spam | **Partially closed by cooldown** | The per-actor cooldown caps a single resolver to one `ticketResolved` email per recipient per 30-minute window regardless of how many tickets they cycle. A multi-actor coordinated reopen/resolve loop is still possible; not in scope. |
| #7 `cleanup-temp-screenshots` orphan | **Out of scope** | No email impact; tracked elsewhere. |
| #8 No Resend suppression-list check | **Deferred** | Tags (see #9) will make any anomaly visible in the Resend dashboard; if a suppressed address shows persistent failures we'll add the pre-send check then. |
| #9 No Resend tags | **Closed** | Every dispatcher now passes `templateName` and `templateCategory` through `sendEmailOrLog` → Resend `tags: [{ name, value }]`. Names match the template identifiers used in the audit table (§2). Filter the Resend Logs dashboard by `template:<name>` for per-template volume. |
| #10 Webhook idempotency written after side-effects | **Deferred (documented)** | Inline comment added at app/api/billing/webhook/route.ts near the stamp write explaining the partial-failure-retry double-send window and the post-launch hardening path. Not changed in this PR. |
| #11 `seatAdded` + `inviteAccepted` double-send | **Out of scope** | Different content, different recipients in most cases; the spec excluded this. |
| #12 No preferences UI | **Closed** | `/settings?tab=notifications` now renders with two toggles (Activity / Product updates) reading from and writing to `users/{uid}.emailPreferences.{category}` via the new `POST /api/users/email-preferences` endpoint. The post-unsubscribe confirmation page link now resolves to a real surface. |

**New finding from this work**

- **Per-actor cooldown adds suppression state at `users/{uid}.emailSends.cooldowns.{actorUid}_{eventType}`.** A user can accumulate many cooldown stamps over time if they receive notifications from many actors. The stamps are bounded by the workspace's distinct actor count and overwritten on each send within the window — effectively a small bounded map per user. Acceptable for launch. If a workspace ever scales to hundreds of distinct actors per recipient and the map becomes unwieldy, GC can be done with a daily cron that prunes entries older than `EMAIL_COOLDOWN_MS`.
