# Email Cadence Fix — Summary

**Date:** 2026-05-26
**Companion to:** [`email-cadence-audit.md`](email-cadence-audit.md)
**Deliverability fix (previous pass):** [`email-deliverability-fix-summary.md`](email-deliverability-fix-summary.md)

This PR ships four coherent changes that close the launch-blocking cadence and observability gaps from the audit. The deliverability work (From addresses, footers, `List-Unsubscribe`, DMARC) is unchanged.

---

## 1. What shipped

### 1a. Per-actor cooldown (`lib/email/cooldowns.ts`)

A new module gates four notification dispatchers behind a 30-minute, per-actor-per-recipient-per-event-type stamp:

- `sendNewCommentEmail`
- `sendMentionEmail`
- `sendTicketAssignedEmail`
- `sendTicketResolvedEmail`

Stamp lives at `users/{recipientUid}.emailSends.cooldowns.{actorUid}_{eventType}`. Claim is done in a Firestore transaction. The stamp is written only when an email actually sends (after the preference gate passes) — opt-outs don't accumulate phantom stamps.

Order of gates inside each dispatcher:
1. **Cooldown check** (cheap; Firestore read of the recipient doc).
2. **Preference check** (existing `canSendEmail` logic).
3. **Template + send.**
4. **Stamp write** (best-effort, only on `sent: true`).

Not in scope (already correctly capped):
- `sessionOpened` (once-per-session-ever via transaction)
- `welcome` (once-per-uid-ever)
- `planLimit*` (once-per-cycle)
- `inviteAccepted` (no burst risk)
- Transactional / billing templates (different concern, different dedup)

### 1b. Preferences UI at `/settings?tab=notifications`

New tab in `app/(app)/settings/page.tsx` with two toggles:

- **Activity notifications** → `emailPreferences.notifications` — comments, mentions, assignments, resolutions, session views.
- **Product updates** → `emailPreferences.lifecycle` — welcome, plan limits, account milestones.

Reads from `GET /api/users/email-preferences` (layers stored values over the all-true defaults). Writes via `POST /api/users/email-preferences` with optimistic UI + rollback. Footer note clarifies that transactional emails always send.

The post-unsubscribe confirmation page's "Manage email preferences" link now resolves to a real surface.

### 1c. Removed `digest` and `marketing` preferences

Dead state — nothing read either category at runtime. Removed from:

- `DEFAULT_EMAIL_PREFERENCES` and `EmailPreferences` type (`lib/email/preferences.ts`)
- `UnsubscribeCategory` validator (`lib/email/unsubscribeToken.ts`)
- The `all`-category fan-out on the unsubscribe page
- The `UserDoc` Firestore type

**No data migration required.** Existing Firestore user docs may still carry `emailPreferences.digest` / `emailPreferences.marketing` from when they could be turned off. The runtime reader (`getEmailPreferences`) spreads stored values over the new defaults — unknown keys pass through and are ignored downstream.

### 1d. Resend dashboard tags

`sendEmailOrLog` now accepts `templateName` and `templateCategory` and emits them as Resend `tags: [{ name: "template", value }, { name: "category", value }]`. Every dispatcher (notification, workspace, billing, security/lifecycle) was updated to pass its template identifier — names match the audit's §2 table (`newComment`, `renewalReceipt`, `workspaceInvite`, etc.).

Tag values are sanitized to `[A-Za-z0-9_-]+` defensively (Resend's allowed character set). The Resend SDK version (`^6.12.0`) supports `tags`; no dependency bump.

Filter the Resend Logs UI by `template:<name>` for per-template volume; by `category:notifications` for cadence-class breakdowns.

---

## 2. Behavior change for users

| Before | After |
|---|---|
| Daniel resolves 100 tickets reported by Maya in 10 min → Maya gets 100 emails. | First email fires; the next 99 are suppressed at the dispatcher with `reason=cooldown`. After 30 min the bucket resets and the next resolve can send. |
| User opts out of `notifications` via an email footer; no in-product way to fine-tune. | `/settings?tab=notifications` exposes both toggles. User can re-enable at any time. |
| Unsubscribe link in confirmation page leads to a dead URL. | Link resolves to the new tab. |
| Resend dashboard shows one undifferentiated stream of sends. | Every send carries `template:` and `category:` tags; the dashboard can filter by either. |
| `digest` and `marketing` preferences existed as dead state — visible to engineers, unused. | Both removed from the codebase. Existing Firestore values are ignored at runtime. |

**The same-actor PATCH dedup case** (one PATCH both reassigns a ticket to Daniel and mentions Daniel in the new description): `ticketAssigned` fires before the description-mention email in `app/api/tickets/[id]/route.ts`, so assignment lands first and mention is suppressed by the cooldown. Assignment is action-required; mention is informational — this is the desired ordering. An inline comment documents the invariant at the dispatch site.

---

## 3. What's deferred (not in this PR)

- **Webhook idempotency hardening.** The stamp at `app/api/billing/webhook/route.ts` is still written after side-effects. A partial-failure-then-retry can still double-send `renewalReceipt` / `refundIssued` / `cardExpiring` / `paymentMethodUpdated` / `upcomingRenewalReminder`. Inline comment added documenting the limit and the path to a fix. Stripe retries are rare enough in practice that this can wait for real data.
- **Fan-out caps.** `accessRequestNotification` and `workspaceDeletedMember` still fan out without batching or pacing. Re-evaluate post-launch once we see real workspace-size distributions.
- **Real digest engine.** The per-actor cooldown replaces this for launch. If, post-launch, we want richer summarization, build it on the existing dispatch sites with the same preference gate.
- **Presence-awareness suppression.** Don't email if the recipient is actively viewing the surface. Out of scope.
- **Per-recipient global rate cap.** The per-actor cooldown is sufficient for launch.
- **Resend suppression-list check.** Tags now make hard-bounce anomalies dashboard-visible; if a single template starts seeing repeated bounces to the same address, add the pre-send check then.

---

## 4. Rollout plan

After PR review and merge:

1. **Deploy to production.** No env-var changes required.

2. **Sanity check existing flows.**
   - Sign up with a fresh email → welcome email arrives (lifecycle, single-shot).
   - Trigger a password reset → arrives immediately (transactional, no cooldown).

3. **Verify cooldown behavior.**
   - Use two test accounts (Actor and Recipient) in the same workspace.
   - Actor resolves a ticket reported by Recipient → Recipient gets one `ticketResolved` email.
   - Actor immediately resolves another ticket reported by Recipient → Recipient receives NO email. Vercel logs show `[ticket-resolved-email] recipient=… sent=false reason=cooldown`.
   - Wait 30+ minutes; Actor resolves a third ticket reported by Recipient → Recipient receives one email.
   - Cross-actor check: Sarah resolves a fourth ticket reported by Recipient → Recipient receives one email (different actor, different cooldown bucket).
   - Cross-event-type check: Actor comments on a different ticket the Recipient watches → Recipient gets a `newComment` email (different event type, different bucket).

4. **Verify preferences UI.**
   - Navigate `/settings?tab=notifications` as a real user → both toggles render with current state.
   - Toggle "Activity notifications" off → `users/{uid}.emailPreferences.notifications=false` in Firestore.
   - Have Actor comment on a ticket Recipient owns → Recipient receives NO email; logs show `reason=preference-off`.
   - Toggle back on → next comment from Actor sends.
   - Reload the page → toggle state persists.

5. **Verify Resend tags.**
   - Filter Resend Logs by `template:welcome` → only welcome emails appear.
   - Filter by `template:newComment` → only new-comment emails appear.
   - Filter by `category:transactional` → password resets, billing, invites appear; notification-family does not.

6. **First 7 days post-deploy: monitor.**
   - Resend Logs daily: any per-template volume anomaly worth investigating? Any template suddenly 10x normal?
   - DMARC aggregate reports (weekly): `dmarc@annote.ai` for unexpected sender misalignment.
   - Vercel logs: spot-check `reason=cooldown` rate. If it's >50% of all notification-family dispatch attempts, the cooldown window may be too aggressive for normal workflow (unlikely; revisit only if reported).

If all checks pass, the launch cadence work is complete.

---

## 5. Open monitoring items (first week)

- Resend dashboard: any template dominating abnormally? Investigate the trigger.
- Cooldown log rate: rough sanity check that suppression isn't happening for innocuous single-user activity. Cooldown should fire only on bursts, not on normal one-off actions (since a single action has no prior stamp to suppress against).
- The `users/{uid}.emailSends.cooldowns` map size: unlikely to balloon at our scale, but worth confirming with a spot-check on a power user. If it does grow large (>100 keys), schedule a daily cron to prune stamps older than `EMAIL_COOLDOWN_MS`.
