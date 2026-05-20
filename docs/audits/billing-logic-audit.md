# Billing Logic Audit — Notion-Style Seat Model

**Date:** 2026-05-20
**Scope:** Read-only audit of every code path that creates, modifies, or reads billing/seat state. Verify Notion-style "seats = capacity, never auto-decrement" model.
**Method:** Direct file reads + targeted searches. All file:line citations verified against the working tree on `main` (head `d18c398`).

---

## Executive Summary

The system **largely implements the Notion seat model correctly**, with one significant write-ahead anti-pattern, one bypass admin route, and a few smaller risks. The webhook is the single Firestore writer for paid-subscription state, member removal explicitly never decrements seats, and the only user-triggered seat growth path (invite accept) is gated by `actualMemberCount > currentSeats` (grow-only).

**Critical findings:**
1. **Write-ahead bug on invite accept** — member is added to Firestore *before* the Stripe seat-grow call; if Stripe fails, the error is swallowed and the workspace is left with members > seats and an under-billed subscription.
2. **`/api/admin/update-plan` bypass route** — admin can change `billing.plan` without touching Stripe or checking `manualOverride`, creating divergence.
3. **No structural enforcement of `members ≤ seats` on Business** — Business has `maxMembers: null` (unlimited). `checkPlanLimit` allows unbounded growth; seat capacity is sync'd at accept time but is not a hard limit.

The full Notion-model rule-by-rule scorecard is in [Section 9](#section-9--formal-check-against-notion-model).

---

# SECTION 1 — Every Seat / Billing Field Write Site

## 1.1 `billing.seats`

| # | File:Line | Trigger | New Value | Gating |
|---|---|---|---|---|
| 1 | [app/api/billing/webhook/route.ts:214](../../app/api/billing/webhook/route.ts#L214) | Stripe `customer.subscription.created` webhook | `subData.seatCount` (re-fetched from Stripe) | None — fires on subscription activation |
| 2 | [app/api/billing/webhook/route.ts:302](../../app/api/billing/webhook/route.ts#L302) | Stripe `customer.subscription.updated` webhook | `subData.seatCount` (re-fetched from Stripe) | **Always applies, even to comp** (per L300 comment: "seats/billingCycle apply even to a comp") |
| 3 | [app/api/billing/webhook/route.ts:388](../../app/api/billing/webhook/route.ts#L388) | Stripe `customer.subscription.deleted` webhook | Literal `1` (hard reset to Starter) | Only if `!manualOverride` (returns early at L365) |
| 4 | [app/api/admin/workspaces/actions/route.ts:227](../../app/api/admin/workspaces/actions/route.ts#L227) | Admin `set_manual_override` | Request body `seats` (validated int ≥ 1) | Admin auth + integer validation |
| 5 | [app/api/workspace/invitations/accept/[token]/route.ts:219](../../app/api/workspace/invitations/accept/[token]/route.ts#L219) | Member accepts invitation | `actualMemberCount` (only if `> currentSeats`) | `plan === "business"` + `subscriptionId` + `actualMemberCount > currentSeats` (grow-only) |

**Notable: no decrement path.** Member removal does NOT write `billing.seats` ([members/[uid]/route.ts:63-70](../../app/api/workspace/members/[uid]/route.ts#L63) explicit no-op with comment).

## 1.2 `billing.subscriptionId`

| # | File:Line | Trigger | New Value | Gating |
|---|---|---|---|---|
| 1 | [app/api/billing/webhook/route.ts:213](../../app/api/billing/webhook/route.ts#L213) | `subscription.created` webhook | `event.data.subscriptionId` | None |
| 2 | [app/api/billing/webhook/route.ts:389](../../app/api/billing/webhook/route.ts#L389) | `subscription.deleted` webhook | Literal `null` | `!manualOverride` |
| 3 | [app/api/admin/workspaces/actions/route.ts:232](../../app/api/admin/workspaces/actions/route.ts#L232) | Admin `set_manual_override` | Literal `null` (clear stale sub) | Admin auth |

## 1.3 `billing.plan`

| # | File:Line | Trigger | New Value | Gating |
|---|---|---|---|---|
| 1 | [app/api/billing/webhook/route.ts:211](../../app/api/billing/webhook/route.ts#L211) | `subscription.created` webhook | Literal `"business"` | None |
| 2 | [app/api/billing/webhook/route.ts:387](../../app/api/billing/webhook/route.ts#L387) | `subscription.deleted` webhook | Literal `"starter"` | `!manualOverride` |
| 3 | [app/api/admin/workspaces/actions/route.ts:109](../../app/api/admin/workspaces/actions/route.ts#L109) | Admin `set_plan` (comp path) | Body `plan` | Admin + `manualOverride === true` |
| 4 | [app/api/admin/workspaces/actions/route.ts:226](../../app/api/admin/workspaces/actions/route.ts#L226) | Admin `set_manual_override` | Body `plan` | Admin auth |
| 5 | [lib/repositories/workspacesRepository.server.ts](../../lib/repositories/workspacesRepository.server.ts) `updateWorkspacePlanRepo` (via [app/api/admin/update-plan/route.ts:56](../../app/api/admin/update-plan/route.ts#L56)) | Admin `POST /api/admin/update-plan` | Body `newPlan` | Admin only — **NO provider sync, NO manualOverride check** (RED FLAG #2) |

## 1.4 `billing.customerId`

| # | File:Line | Trigger | New Value | Gating |
|---|---|---|---|---|
| 1 | [app/api/billing/webhook/route.ts:212](../../app/api/billing/webhook/route.ts#L212) | `subscription.created` webhook | `event.data.customerId` | None |

**Note:** `customerId` is **never cleared** — even on cancellation, `subscription.deleted` only nulls `subscriptionId`. The customer record persists for re-subscription.

## 1.5 `billing.suspended`

| # | File:Line | Trigger | New Value | Gating |
|---|---|---|---|---|
| 1 | [app/api/billing/webhook/route.ts:216](../../app/api/billing/webhook/route.ts#L216) | `subscription.created` | `false` | None |
| 2 | [app/api/billing/webhook/route.ts:328](../../app/api/billing/webhook/route.ts#L328) | `subscription.updated` | `subData.status === "past_due"` | `!isManualOverride` (otherwise logs skip) |
| 3 | [app/api/billing/webhook/route.ts:399](../../app/api/billing/webhook/route.ts#L399) | `subscription.deleted` | `false` (clear so canceled+suspended can't coexist) | `!manualOverride` |
| 4 | [app/api/billing/webhook/route.ts:473](../../app/api/billing/webhook/route.ts#L473) | `invoice.payment_failed` | `true` | `!isManualOverride` (otherwise logs skip at L452) |
| 5 | [app/api/admin/workspaces/actions/route.ts:60](../../app/api/admin/workspaces/actions/route.ts#L60) | Admin `suspend` | `true` | Admin |
| 6 | [app/api/admin/workspaces/actions/route.ts:65](../../app/api/admin/workspaces/actions/route.ts#L65) | Admin `resume` | `false` | Admin |
| 7 | [app/api/admin/workspaces/actions/route.ts:229](../../app/api/admin/workspaces/actions/route.ts#L229) | Admin `set_manual_override` | `false` (always unsuspend on comp) | Admin |

## 1.6 `billing.cancelAt`

| # | File:Line | Trigger | New Value | Gating |
|---|---|---|---|---|
| 1 | [app/api/billing/webhook/route.ts:220](../../app/api/billing/webhook/route.ts#L220) | `subscription.created` | `null` | None |
| 2 | [app/api/billing/webhook/route.ts:316-318](../../app/api/billing/webhook/route.ts#L316) | `subscription.updated` | `subData.cancelAtPeriodEnd ? subData.currentPeriodEnd : null` | None (applies to comps too) |
| 3 | [app/api/billing/webhook/route.ts:392](../../app/api/billing/webhook/route.ts#L392) | `subscription.deleted` | `null` (cancel landed) | `!manualOverride` |

---

# SECTION 2 — Every Stripe Seat/Plan Mutation Call

## 2.1 Provider Method Definitions

All Stripe SDK calls are encapsulated in [lib/billing/payments/stripe.ts](../../lib/billing/payments/stripe.ts). **No direct `stripe.subscriptions.*` calls exist outside this file** — verified via grep.

| Method | File:Line | Stripe SDK Calls |
|---|---|---|
| `updateSubscriptionSeats(subId, count)` | [stripe.ts:153](../../lib/billing/payments/stripe.ts#L153) | `subscriptions.retrieve` → `subscriptionItems.update({ quantity, proration_behavior: "always_invoice" })` |
| `updateSubscriptionPlan(subId, priceId, _mode)` | [stripe.ts:171](../../lib/billing/payments/stripe.ts#L171) | `subscriptions.retrieve` → `subscriptionItems.update({ price, quantity, proration_behavior: "always_invoice" })` |
| `cancelSubscription(subId, atPeriodEnd)` | [stripe.ts:190](../../lib/billing/payments/stripe.ts#L190) | If `atPeriodEnd`: `subscriptions.update({ cancel_at_period_end: true })`. Else: `subscriptions.cancel()` |
| `resumeSubscription(subId)` | [stripe.ts:206](../../lib/billing/payments/stripe.ts#L206) | `subscriptions.update({ cancel_at_period_end: false })` |

## 2.2 `updateSubscriptionSeats` Callsites

| Callsite | File:Line | Value Passed | Classification |
|---|---|---|---|
| Invite accept | [app/api/workspace/invitations/accept/[token]/route.ts:214](../../app/api/workspace/invitations/accept/[token]/route.ts#L214) | `actualMemberCount` (only if `> currentSeats`) | ✅ **GROW-ONLY** (Notion-correct) |

**One callsite, grow-only.** Wrapped in `if (actualMemberCount > currentSeats)` at L212. Followed by Firestore update at L218-220. Error swallowed in catch at L223-225 (see RED FLAG #1).

## 2.3 `updateSubscriptionPlan` Callsites

| Callsite | File:Line | Value | Gating | FS update nearby? |
|---|---|---|---|---|
| Admin `set_plan` (paid path) | [app/api/admin/workspaces/actions/route.ts:154](../../app/api/admin/workspaces/actions/route.ts#L154) | `resolveBusinessPriceId(cycle)`, mode `"prorated_immediately"` | Not manualOverride, has subscription, `newPlan === "business"` (starter/enterprise rejected) | **NO** — explicitly deferred to webhook (comment at L169) |

## 2.4 `cancelSubscription` Callsites

| Callsite | File:Line | Value | Gating | FS update nearby? |
|---|---|---|---|---|
| Admin `cancel_subscription` | [app/api/admin/workspaces/actions/route.ts:331](../../app/api/admin/workspaces/actions/route.ts#L331) | `effective === "next_billing_period"` | Not manualOverride, has subscription | **NO** — deferred to webhook |
| Workspace soft-delete | [app/api/workspace/route.ts:52](../../app/api/workspace/route.ts#L52) | Always `false` (immediate cancel) | `subscriptionId` exists | **NO** — soft-delete writes `deletedAt`; webhook handles billing |

## 2.5 `resumeSubscription` Callsites

**Zero callsites in production code.** The method is implemented but unused. Owners restore subscriptions through the Stripe customer portal (which fires `subscription.updated` with `cancel_at_period_end=false` → handled by webhook). **Dead code** — recommend deletion or wiring up.

---

# SECTION 3 — Trigger Map

| # | Trigger | Entry Point | Firestore Effect | Stripe Effect |
|---|---|---|---|---|
| A | User clicks "Upgrade" | POST [/api/billing/checkout](../../app/api/billing/checkout/route.ts#L12) | None (deferred to webhook) | `createCheckoutSession({ seatCount = max(requested, memberCount) })` at [L77-87](../../app/api/billing/checkout/route.ts#L77) |
| B | Invitee accepts invitation | POST [/api/workspace/invitations/accept/[token]](../../app/api/workspace/invitations/accept/[token]/route.ts#L80) | (1) `members/{uid}` add + `usage.members += 1` ([L179](../../app/api/workspace/invitations/accept/[token]/route.ts#L179)); (2) invitation `status="accepted"` ([L189](../../app/api/workspace/invitations/accept/[token]/route.ts#L189)); (3) **conditional** `billing.seats = actualMemberCount` ([L219](../../app/api/workspace/invitations/accept/[token]/route.ts#L219)) | If members > seats AND plan=business: `updateSubscriptionSeats()` ([L214](../../app/api/workspace/invitations/accept/[token]/route.ts#L214)) |
| C | Owner sends invite | POST [/api/workspace/members/invite](../../app/api/workspace/members/invite/route.ts#L40) | `workspaceInvitations/{token}` doc, status=pending, expires +30d ([L139-165](../../app/api/workspace/members/invite/route.ts#L139)) | None |
| D | Owner removes member | DELETE [/api/workspace/members/[uid]](../../app/api/workspace/members/[uid]/route.ts#L18) | Delete member doc + `usage.members -= 1` (via `removeWorkspaceMemberRepo`); reset target user `workspaceId`/claims | **None** (explicit no-op per L63-70 comment) |
| E | Member leaves | **NOT IMPLEMENTED** — DELETE route blocks self-removal at [L31-33](../../app/api/workspace/members/[uid]/route.ts#L31) | n/a | n/a |
| F | Owner cancels via portal | POST [/api/billing/portal](../../app/api/billing/portal/route.ts#L12) returns Stripe portal URL; cancellation happens in Stripe UI | None (deferred to webhook) | Stripe portal → fires `subscription.updated` with `cancel_at_period_end=true`, or `subscription.deleted` |
| G | Admin cancels | POST [/api/admin/workspaces/actions](../../app/api/admin/workspaces/actions/route.ts#L300) action=`cancel_subscription` | **NO direct write** (deferred to webhook, comment at L344) | `cancelSubscription(subId, effective==="next_billing_period")` at [L331](../../app/api/admin/workspaces/actions/route.ts#L331) |
| H | Subscription auto-renews | Stripe webhook `invoice.paid` w/ `billing_reason="subscription_cycle"` → `handleInvoicePaid` at [webhook/route.ts:529](../../app/api/billing/webhook/route.ts#L529) | **None** — email only (no seat reconciliation at renewal) | None |
| I | Payment fails | Stripe webhook `invoice.payment_failed` → `handlePaymentFailed` at [webhook/route.ts:424](../../app/api/billing/webhook/route.ts#L424) | `billing.suspended = true` at [L473](../../app/api/billing/webhook/route.ts#L473) | None |
| J | Monthly → annual change | Owner via Stripe portal → `subscription.updated` webhook; OR admin via `set_plan` action (Stripe → `updateSubscriptionPlan`) | `billing.billingCycle`, `billing.nextBilledAt` updated by webhook at [L302-307](../../app/api/billing/webhook/route.ts#L302) | `subscriptionItems.update({ price })` |
| K | Admin grants comp | POST `/api/admin/workspaces/actions` action=`set_manual_override` at [L205](../../app/api/admin/workspaces/actions/route.ts#L205) | `manualOverride=true`, `plan`, `seats`, `pricePerSeat`, `suspended=false`, `subscriptionId=null` at [L224-234](../../app/api/admin/workspaces/actions/route.ts#L224) | **None** (comp is FS-only) |
| L | Admin removes comp | POST `/api/admin/workspaces/actions` action=`remove_manual_override` at [L243](../../app/api/admin/workspaces/actions/route.ts#L243) | `manualOverride=false` only ([L244-247](../../app/api/admin/workspaces/actions/route.ts#L244)). Plan/seats unchanged. | None |
| M | Admin sets plan via legacy tool | POST [/api/admin/update-plan](../../app/api/admin/update-plan/route.ts#L17) | `billing.plan = newPlan` ONLY (blind write, see RED FLAG #2) | **None** — no provider sync |
| N | Owner deletes workspace | DELETE [/api/workspace](../../app/api/workspace/route.ts#L18) | `deletedAt`, `deletedBy`, `deleteScheduledPurgeAt = now + 30d` via `softDeleteWorkspaceRepo` ([L58](../../app/api/workspace/route.ts#L58)) | `cancelSubscription(subId, false)` immediate, best-effort ([L52](../../app/api/workspace/route.ts#L52)) |
| O | Admin soft-deletes workspace | No dedicated endpoint exists; would invoke `softDeleteWorkspaceRepo` directly | Same as N | None |
| P | Owner updates payment method | Stripe portal → `payment_method.attached` / `customer.source.expiring` → `handlePaymentMethodEvent` at [webhook/route.ts:663+](../../app/api/billing/webhook/route.ts#L663) | None (email only) | None |
| Q | Invoice upcoming (T-7) | Stripe webhook `invoice.upcoming` → `handleInvoiceUpcoming` at [webhook/route.ts:601+](../../app/api/billing/webhook/route.ts#L601) | None — reminder email only | None |

---

# SECTION 4 — Reconciliation Scenarios

## 4.1 Renewal Behavior

### A. Owner bought 5 seats, currently has 3 active members
**Path:** Stripe renews → `invoice.paid` webhook → [handleInvoicePaid](../../app/api/billing/webhook/route.ts#L529)

**Behavior:**
- Re-fetches subscription, sees `seatCount = 5` (unchanged)
- Sends renewal receipt email
- **Does NOT right-size seats downward**
- `billing.seats` remains 5; owner continues paying for 5 seats

**Verdict:** ✅ Matches Notion model — paid capacity persists across renewal.

### B. Owner bought 5 seats, currently has 6 active members — IS THIS POSSIBLE?

**Possible? Theoretically yes, in narrow races.** Normal flow blocks it:
- Each invite-accept calls `checkPlanLimit({ metric: "maxMembers" })` ([accept/route.ts:137](../../app/api/workspace/invitations/accept/[token]/route.ts#L137)).
- **BUT:** for `plan === "business"`, the entitlement `maxMembers` is `null` (unlimited per [plans.ts:70](../../lib/billing/plans.ts#L70)), so the check is a no-op for Business.
- The only governor on Business is the grow-only logic at [accept/route.ts:212-221](../../app/api/workspace/invitations/accept/[token]/route.ts#L212), which raises seats *after* the member is already added.

**Race window:** If two invitees accept simultaneously and both `getWorkspace()` reads see `seats=5, members=5`, both pass `checkPlanLimit` (limit=null → no-op), both add a member (transaction-safe via `FieldValue.increment`), and both then try to sync seats to 6. The second `updateSubscriptionSeats(6)` is a no-op but `members=7, seats=6` could occur if more concurrent accepts happen. **Renewal does not detect or correct this.**

**Verdict:** ✅ In normal sequential flow, invariant holds via grow-on-accept. ⚠️ Race conditions on Business could produce `members > seats`; no reconciliation exists at renewal to fix it.

## 4.2 What enforces `members ≤ seats`?

| Layer | File:Line | Enforces? |
|---|---|---|
| `checkPlanLimit` at invite creation | [members/invite/route.ts:131](../../app/api/workspace/members/invite/route.ts#L131) | Only on Starter (maxMembers=5). Business has `maxMembers=null` → no-op. |
| `checkPlanLimit` at invite acceptance | [accept/[token]/route.ts:137](../../app/api/workspace/invitations/accept/[token]/route.ts#L137) | Same — Starter only. |
| Grow-on-accept (seat capacity sync) | [accept/[token]/route.ts:212-221](../../app/api/workspace/invitations/accept/[token]/route.ts#L212) | **Grows seats to match members.** Not an enforcer; converts the invariant violation into a billing change. |

**Practically:** Starter is hard-capped at 5. Business has no hard cap; it just buys more capacity. No code blocks invite-accept when seats already equal members (it instead grows the subscription). This is the Notion model and is intentional, but it means **`members ≤ seats` is enforced only by side-effect, not by a guard**.

## 4.3 Any code paths that right-size seats DOWNWARD?

Searched for: `Math.min` near billing, `seats:` lower-than-current writes, explicit downsize logic.

| File:Line | Behavior | Is it a downsize? |
|---|---|---|
| [webhook/route.ts:302](../../app/api/billing/webhook/route.ts#L302) | `billing.seats = subData.seatCount` (whatever Stripe says) | Convergent — downsizes Firestore IF the owner reduced quantity in the Stripe portal. **This is the only legitimate downsize path.** |
| [webhook/route.ts:388](../../app/api/billing/webhook/route.ts#L388) | `billing.seats = 1` on `subscription.deleted` | Hard reset to Starter, not a member-driven right-size |
| [members/[uid]/route.ts:63-70](../../app/api/workspace/members/[uid]/route.ts#L63) | **No-op** with explicit comment ("seats are capacity") | ✅ Correct |

**Verdict:** ✅ No accidental downsize paths. Stripe portal action is the only way to reduce seats, propagated via `subscription.updated` webhook (convergent re-read).

---

# SECTION 5 — Edge Case Trace

| Scenario | Trace | Outcome |
|---|---|---|
| A. Buys 5 seats, invites 5 members | Each `checkPlanLimit` on Business is no-op (limit=null); each accept does `if (members > seats)` → false (1≤5, 2≤5, …, 5≤5); no extra Stripe calls | ✅ 5 seats, 5 members, 1 Stripe call total |
| B. Buys 5 seats, invites 1, removes 1, invites another | Member removal: `usage.members -= 1`, seats unchanged. New invite/accept: members=1 < seats=5 → no Stripe sync. | ✅ 5 seats, 1 member, vacated seat refilled at no extra cost |
| C. Owner removes themselves | Blocked at [members/[uid]/route.ts:31-33](../../app/api/workspace/members/[uid]/route.ts#L31) (`CANNOT_REMOVE_SELF`). Owner can only exit by transferring ownership (no API found for transfer — see UNKNOWN #1) or deleting workspace. | Blocked |
| D. Cancels subscription with 5 members in workspace | `subscription.deleted` webhook writes `plan="starter", seats=1`. Members are NOT removed from `members` collection; `usage.members` stays at 5. | ⚠️ Workspace now has 5 members on a Starter plan (limit=5 — exactly at cap). No new invites allowed. Members keep access (no `suspended=true`). Feedback limits switch to Starter's 50/month. |
| E. Workspace has 5 seats; admin grants manual override | `set_manual_override` writes `manualOverride=true, subscriptionId=null` etc. The Stripe subscription is **NOT cancelled** — it is orphaned. Owner will continue to be billed by Stripe unless admin separately cancels it. | ⚠️ Orphaned Stripe subscription — see RED FLAG #5 |
| F. Manual override removed | Only `manualOverride=false` is written. Plan/seats retained. If a real subscription was set up after the comp, future webhooks now apply normally. If no subscription exists, workspace is in a frozen state — comp plan with no billing source. | ⚠️ Inconsistent state possible |
| G. Payment fails, sub becomes past_due | `invoice.payment_failed` → `billing.suspended = true` at [L473](../../app/api/billing/webhook/route.ts#L473). [assertWorkspaceActive](../../lib/server/assertWorkspaceActive.ts) blocks most API access. | Members lose access immediately on suspend |
| H. Workspace suspended, owner adds new member | POST `/api/workspace/members/invite` calls `assertWorkspaceActive(workspace)` — suspended workspace throws → invite blocked. However: [checkout](../../app/api/billing/checkout/route.ts#L26) uses `allowSuspended: true` so the owner can still upgrade/repair payment. | Invite blocked. Owner can still pay to restore. |

---

# SECTION 6 — Invitation State Machine

## 6.1 Lifecycle Transitions

| Transition | File:Line | Effect |
|---|---|---|
| **CREATE** (owner sends) | POST [/api/workspace/members/invite](../../app/api/workspace/members/invite/route.ts#L139) | Creates `workspaceInvitations/{token}` with status=`pending`, `expiresAt=+30d`. Sends email. |
| **CLICK** (no auth) | GET [/api/workspace/invitations/accept/[token]](../../app/api/workspace/invitations/accept/[token]/route.ts#L42) | Returns metadata. Lazy expiry: if expired, marks status=`expired` ([L62](../../app/api/workspace/invitations/accept/[token]/route.ts#L62)) |
| **SIGN UP / LOG IN** | No dedicated endpoint | n/a |
| **ACCEPT** | POST [/api/workspace/invitations/accept/[token]](../../app/api/workspace/invitations/accept/[token]/route.ts#L80) | See Section 3.B |
| **REJECT** | **NOT IMPLEMENTED** | Invitee cannot explicitly reject; just ignores until 30d expiry |
| **EXPIRE** | Lazy ([L62](../../app/api/workspace/invitations/accept/[token]/route.ts#L62), [L107](../../app/api/workspace/invitations/accept/[token]/route.ts#L107)) — only marked when invitee revisits the link past expiry. No active sweep cron. | Status=`expired`. Doc retained. |
| **REVOKE** (owner cancels) | DELETE [/api/workspace/members/invitations/[token]](../../app/api/workspace/members/invitations/[token]/route.ts#L16) | Status=`revoked` |

## 6.2 When does `actualMemberCount` / `usage.members` change?

Only ACCEPT (and member removal). Pending/click/signup/expire/revoke do **not** mutate `usage.members`.

## 6.3 When does seat count interact with Stripe?

Only ACCEPT (grow-only, see Section 1.1 #5). All other invitation transitions are Stripe-inert.

**Reminder cron:** [/api/cron/workspace-invite-reminders](../../app/api/cron/workspace-invite-reminders/route.ts) runs daily at 09:00 UTC (per [vercel.json](../../vercel.json)). Sends reminder email at day 25. Does NOT modify state — just emails.

---

# SECTION 7 — Data Shape (Stored vs Computed)

## 7.1 `workspace.usage.members`

Stores actual member count. Schema: [lib/domain/workspace.ts:120-128](../../lib/domain/workspace.ts#L120).

**Write sites (both atomic via FieldValue.increment):**
- `+1`: [workspaceMembersRepository.server.ts:72-75](../../lib/repositories/workspaceMembersRepository.server.ts#L72) — called from invite accept and workspace creation
- `-1`: [workspaceMembersRepository.server.ts:120-124](../../lib/repositories/workspaceMembersRepository.server.ts#L120) — called from member-remove DELETE

## 7.2 `workspace.billing.seats`

Stores **purchased capacity** (not used count). See [Section 1.1](#11-billingseats) for all 5 write sites.

## 7.3 Pending invite count

**None.** Pending invites are stored in the global `workspaceInvitations` collection. **They do NOT reserve seats** and do NOT count toward member limits. The only related check is duplicate detection at [members/invite/route.ts:123-126](../../app/api/workspace/members/invite/route.ts#L123).

## 7.4 Billing UI data sources

Billing tab: [app/(app)/settings/page.tsx:3199-3468](../../app/(app)/settings/page.tsx#L3199).

| Display | UI File:Line | Data Source |
|---|---|---|
| Starter "users count" | [settings/page.tsx:3449](../../app/(app)/settings/page.tsx#L3449) — `realtimeWorkspace.usage?.members ?? 1` | Firestore realtime listener (BillingUsageProvider context) |
| Business "X seats × $Y" | [BillingManagementView.tsx:78-79](../../components/billing/BillingManagementView.tsx#L78), rendered at [L164-168](../../components/billing/BillingManagementView.tsx#L164) | `workspace.billing.seats` from realtime listener |
| "Y used" | **NOT DISPLAYED** anywhere in billing UI for Business | n/a — Notion model treats seats as commitment, not utilization |

**Key insight:** There is no "X of Y used" gauge for Business owners. By design.

---

# SECTION 8 — Consistency Checks

## 8.1 Divergence Points

| Scenario | File:Line | Reconciliation |
|---|---|---|
| Webhook delivery lost on `subscription.created` | [webhook/route.ts:141](../../app/api/billing/webhook/route.ts#L141) | Stripe retries for days; idempotency dedup at [L81-95](../../app/api/billing/webhook/route.ts#L81); manual replay via Stripe Dashboard |
| Owner edits subscription in Stripe portal, webhook briefly lags | n/a | Convergent: next `subscription.updated` re-reads Stripe and overwrites Firestore at [L293-302](../../app/api/billing/webhook/route.ts#L293) |
| Invite accept: Stripe seat-grow fails after member already added | [accept/[token]/route.ts:213-225](../../app/api/workspace/invitations/accept/[token]/route.ts#L213) | **None.** Error swallowed (RED FLAG #1) |
| Admin `set_plan` (paid): Stripe call OK, webhook never lands | [admin/workspaces/actions/route.ts:154-188](../../app/api/admin/workspaces/actions/route.ts#L154) | Webhook retries (Stripe); convergent. |
| Admin `set_manual_override` orphans a live Stripe sub | [admin/workspaces/actions/route.ts:232](../../app/api/admin/workspaces/actions/route.ts#L232) | **None.** Subscription continues billing; not cancelled. (RED FLAG #5) |
| `/api/admin/update-plan` writes plan only | [admin/update-plan/route.ts:56](../../app/api/admin/update-plan/route.ts#L56) | **None.** Plan and provider can diverge silently. (RED FLAG #2) |

## 8.2 Write-Ahead Anti-Pattern (Firestore BEFORE Stripe)

**FOUND: [/api/workspace/invitations/accept/[token]/route.ts:179-226](../../app/api/workspace/invitations/accept/[token]/route.ts#L179)**

Sequence:
1. L179 — `addWorkspaceMemberRepo()` writes member doc + `usage.members += 1` atomically.
2. L189 — `updateWorkspaceInvitationRepo()` marks invitation accepted.
3. L197 — `addWorkspaceMembershipRepo()` updates user profile.
4. L200 — Re-read workspace.
5. L214 — **Stripe `updateSubscriptionSeats()` call.** If it throws, the `catch` at L223 logs and continues. Member is already in Firestore. No rollback.
6. L218 — `billing.seats` Firestore write (only if Stripe call succeeded).
7. L231-241 — User claims updated.

**Failure mode:** Stripe rejects the quantity update (network, rate limit, deleted subscription) → user is a member of the workspace with `usage.members=N+1` but `billing.seats=N` and Stripe still billing for N seats. Owner is silently under-billed. No retry or alarm.

## 8.3 Stripe-Ahead-of-Firestore (writes to Stripe with no FS update)

| File:Line | Pattern | Intended? |
|---|---|---|
| [admin/workspaces/actions/route.ts:154](../../app/api/admin/workspaces/actions/route.ts#L154) (`set_plan` paid) | Calls `updateSubscriptionPlan`, then "DON'T write Firestore — webhook is single writer" | ✅ Yes — webhook converges |
| [admin/workspaces/actions/route.ts:331](../../app/api/admin/workspaces/actions/route.ts#L331) (`cancel_subscription`) | Calls `cancelSubscription`, defers to webhook | ✅ Yes |
| [workspace/route.ts:52](../../app/api/workspace/route.ts#L52) (workspace delete) | Calls `cancelSubscription(_, false)`, defers to webhook | ✅ Yes — workspace also marked deleted in same call |

All three rely on the webhook eventually landing. ✅ Documented design choice. Risk only if webhook fails permanently.

---

# SECTION 9 — Formal Check Against Notion Model

| Rule | Followed? | Where (file:line) | Notes |
|---|---|---|---|
| 1. Seats are capacity, members are usage | ✅ Yes | [plans.ts:39-103](../../lib/billing/plans.ts#L39), [members/[uid]/route.ts:63-70](../../app/api/workspace/members/[uid]/route.ts#L63) | Schema separates `billing.seats` (capacity) from `usage.members` (actual). |
| 2. Adding a member when below capacity does NOT change billing | ✅ Yes | [accept/[token]/route.ts:212](../../app/api/workspace/invitations/accept/[token]/route.ts#L212) | `if (actualMemberCount > currentSeats)` — no-op when ≤ |
| 3. Adding a member when above capacity GROWS billing (prorated) | ✅ Yes | [accept/[token]/route.ts:214-220](../../app/api/workspace/invitations/accept/[token]/route.ts#L214), [stripe.ts:167](../../lib/billing/payments/stripe.ts#L167) | Uses `proration_behavior: "always_invoice"` |
| 4. Removing a member does NOT change billing mid-cycle | ✅ Yes | [members/[uid]/route.ts:63-70](../../app/api/workspace/members/[uid]/route.ts#L63) | Explicit no-op with documented intent |
| 5. At renewal, billing reconciles to actual member count | ❌ No | [webhook/route.ts:529-599](../../app/api/billing/webhook/route.ts#L529) (`handleInvoicePaid`) | Renewal handler is email-only; does not right-size seats. Comment at [members/[uid]/route.ts:66-68](../../app/api/workspace/members/[uid]/route.ts#L66) acknowledges this is deferred ("for v1 we accept that owners pay for purchased seats until they explicitly reduce") |
| 6. Owner can explicitly reduce seat count via portal/admin | ⚠️ Partial | [webhook/route.ts:302](../../app/api/billing/webhook/route.ts#L302) (handles reduction if it happens in Stripe portal) | Owner CAN reduce via Stripe portal — webhook will converge Firestore. There is **no in-app UI** for reducing seats; only the portal path works. Admin tools have no "reduce seats" action separate from `set_manual_override`. |
| 7. Members can never exceed paid seat capacity (invite blocked at limit) | ❌ No | [checkPlanLimit.ts:90-93](../../lib/billing/checkPlanLimit.ts#L90), [plans.ts:70](../../lib/billing/plans.ts#L70) | For Business, `maxMembers=null` (unlimited). Invite is never blocked — instead seats grow automatically. This is the **Notion model intentionally**, not a bug, but it does mean "blocked at limit" is not literally true. |
| 8. Workspace deletion cancels subscription | ✅ Yes | [workspace/route.ts:50-56](../../app/api/workspace/route.ts#L50) | `cancelSubscription(subId, false)` immediate, best-effort (error swallowed) |
| 9. Subscription cancellation does not immediately revoke member access | ✅ Yes | [webhook/route.ts:386-401](../../app/api/billing/webhook/route.ts#L386) | Sets `plan=starter, seats=1, suspended=false`. Members remain; access continues; only feature limits change to Starter caps. |
| 10. Manual override (comp) decouples from Stripe entirely | ⚠️ Mostly | [admin/workspaces/actions/route.ts:224-234](../../app/api/admin/workspaces/actions/route.ts#L224), [webhook/route.ts:300](../../app/api/billing/webhook/route.ts#L300) | Sets `subscriptionId=null` so webhooks can't match. BUT: if a real subscription is later created for the same workspace, `handleSubscriptionUpdated` writes `seats/cancelAt/paymentMethod` even when `manualOverride=true` (only `suspended` is gated). Also: setting manual override does NOT cancel any pre-existing Stripe subscription — it orphans it. |

---

# SECTION 10 — Red Flags

## RF#1 — Write-Ahead Bug on Invite Accept (HIGH)
**File:** [/api/workspace/invitations/accept/[token]/route.ts:179-225](../../app/api/workspace/invitations/accept/[token]/route.ts#L179)

Firestore member add (L179) happens BEFORE Stripe seat-grow call (L214). The catch at L223-225 swallows Stripe errors and the API still returns success. Result: workspace can have `members > seats`, owner is silently under-billed, and there is no compensating reconciliation (renewal doesn't right-size either).

**Fix options:**
- Transactional: fail the accept if Stripe fails (degrades UX during Stripe outages).
- Eventual: add a background reconciliation job that compares `usage.members` vs `billing.seats` for active subscriptions and retries `updateSubscriptionSeats`.
- Outbox pattern: persist the intended seat sync to a queue and retry.

## RF#2 — `/api/admin/update-plan` Bypass Route (HIGH)
**File:** [app/api/admin/update-plan/route.ts:56](../../app/api/admin/update-plan/route.ts#L56)

This admin route blindly writes `billing.plan` with no provider sync, no `manualOverride` check, no seat update. Any admin can put a paid workspace into a divergent state (e.g., set plan="enterprise" without changing the active Business subscription).

**Fix:** Either delete this endpoint in favor of `/api/admin/workspaces/actions` (which has correct hybrid logic), or add the same comp-vs-paid path detection.

## RF#3 — Invite-Accept Plan Limit Race (MEDIUM)
**File:** [/api/workspace/invitations/accept/[token]/route.ts:135-187](../../app/api/workspace/invitations/accept/[token]/route.ts#L135)

`checkPlanLimit` reads `usage.members` and `addWorkspaceMemberRepo` increments it — but there's no transaction binding them. Two concurrent invite-accepts on a Starter workspace with 4 members can both pass the check (each sees `currentUsage=4 < 5`) and both add, leaving the workspace with 6 members on a 5-member plan.

**Fix:** Wrap the read+write in a Firestore transaction.

## RF#4 — Stripe Errors Swallowed on Workspace Delete (MEDIUM)
**File:** [app/api/workspace/route.ts:51-55](../../app/api/workspace/route.ts#L51)

Workspace soft-delete attempts to cancel the subscription, but errors are caught and logged only. If Stripe rejects, the workspace is marked deleted while billing continues. No retry queue.

## RF#5 — Manual Override Orphans Live Subscriptions (MEDIUM)
**File:** [app/api/admin/workspaces/actions/route.ts:222-241](../../app/api/admin/workspaces/actions/route.ts#L222)

`set_manual_override` nulls `subscriptionId` in Firestore but does NOT cancel the underlying Stripe subscription. If admin comps a workspace that has a real paid subscription, Stripe continues billing the customer until someone manually cancels it through the portal. The webhook for the orphaned subscription can no longer match the workspace (lookup by `billing.subscriptionId` fails), so renewals fire silently forever.

**Fix:** Either auto-cancel the existing subscription when granting a comp, or require admin to explicitly choose: "comp + keep billing" vs "comp + cancel Stripe".

## RF#6 — Webhook Updates Comp Workspaces' Cancel/PaymentMethod (LOW)
**File:** [webhook/route.ts:300, 316-323](../../app/api/billing/webhook/route.ts#L300)

The L300 comment states "Seats/billingCycle apply even to a comp." In practice, only `billing.suspended` is gated by `!isManualOverride`; `billing.seats`, `billing.billingCycle`, `billing.cancelAt`, `billing.nextBilledAt`, and `billing.paymentMethod` all unconditionally overwrite. Combined with RF#5, an orphaned subscription's events can still mutate comp workspace state if the subscription IDs ever realign.

**Risk:** Low in practice because `subscriptionId=null` after comp prevents the workspace from being found via the `where("billing.subscriptionId", "==", ...)` query. Becomes a real risk only if `subscriptionId` is later reset by another flow.

## RF#7 — `resumeSubscription` Is Dead Code (LOW)
**File:** [stripe.ts:206-214](../../lib/billing/payments/stripe.ts#L206)

Defined on the provider, never called. Owners restore subscriptions via Stripe portal; the webhook handles the resulting `subscription.updated`. Either wire it to an admin/owner action or delete it.

## RF#8 — No Seat-Sync at Subscription Resume (LOW)
**File:** [webhook/route.ts:269-342](../../app/api/billing/webhook/route.ts#L269) (`handleSubscriptionUpdated`)

When a customer reverts a scheduled cancel in the portal, `cancelAt` clears, but if members were added during the grace period AND the count exceeds seats, no reconciliation runs. The next invite-accept will sync, but a workspace can sit with `members > seats` until then.

## RF#9 — `customerId` Never Cleared (LOW / probably intentional)
**File:** [webhook/route.ts:386-401](../../app/api/billing/webhook/route.ts#L386)

On `subscription.deleted`, `subscriptionId` is nulled but `customerId` is retained. Reasonable for re-subscription, but means a workspace cycling between Starter and Business retains the Stripe customer record forever. Not a bug; flagging for awareness.

## RF#10 — No Transfer-Ownership API Found (INFORMATIONAL)
Self-removal is blocked at [members/[uid]/route.ts:31-33](../../app/api/workspace/members/[uid]/route.ts#L31), and no `/api/workspace/ownership` route was located in this audit. Owner exit requires either workspace deletion or, presumably, manual Firestore intervention. **NEEDS CONFIRMATION** — see UNKNOWN #1.

---

# SECTION 11 — Unknowns

1. **Ownership transfer:** Is there an `/api/workspace/ownership/` endpoint? It appears in the route listing (`app/api/workspace/ownership/`) but was not read in this audit. If present, its behavior re: subscription transfer is unverified.

2. **Cron schedule for invite cleanup vs Vercel Pro:** Memory note `email_phase5_postlaunch_todos` mentions deferred cron work. Invite-reminders fires daily 09:00 UTC; workspace-purge fires daily 03:00 UTC (both per [vercel.json](../../vercel.json)). However, expired invitations are only marked `expired` lazily when the invitee re-clicks the link — no active sweep purges them from Firestore. Long-term storage growth uncertain.

3. **`grace period` after scheduled cancel:** `billing.cancelAt` is set when `cancel_at_period_end=true`. Members keep access. Specific UI / feature gates during this period were not exhaustively audited (banner code exists per webhook comments at L311-314 but not inspected here).

4. **Webhook signature in dev mode:** [webhook/route.ts:54-58](../../app/api/billing/webhook/route.ts#L54) allows skipping signature verification via `x-echly-webhook-test` header matching `CRON_SECRET` when `NODE_ENV !== "production"`. Verified that this is dev-only, but the surface area of `CRON_SECRET` reuse wasn't audited.

5. **`workspace.usage.members` vs members subcollection drift:** Both are written in the same batch in `addWorkspaceMemberRepo` / `removeWorkspaceMemberRepo`, but batches are not transactional across documents in older Admin SDK versions. The atomicity guarantee under failure wasn't tested.

6. **Plan limit check during invite CREATION vs ACCEPTANCE — for Business:** Both call `checkPlanLimit`, but Business has `maxMembers=null` so both are no-ops. There is no plan-specific block on inviting beyond a "soft cap" for Business. This is intentional per Notion model but worth verifying with product (is unlimited growth the desired UX, or should there be a sanity ceiling?).

7. **Behavior when Stripe API key rotates / webhook secret rotates:** Webhook returns 500 on parse failure (preserves Stripe retries), but no monitoring on consecutive 500s was inspected.

8. **`getPaymentProvider()`:** Audit assumed it returns the Stripe provider. The `payments/index.ts` factory was not deeply read; if there's a fallback or mock provider in non-Stripe environments, seat-sync behavior may differ.

9. **Member count display in UI vs server reality:** [BillingUsageProvider.tsx](../../lib/billing/BillingUsageProvider.tsx) wasn't read line-by-line; assumed it surfaces `realtimeWorkspace.usage.members`. Confirmed indirectly via settings page.

10. **Race between `subscription.created` and the first invite accept:** If owner upgrades and immediately invites members before the webhook lands, `billing.plan` is still `"starter"` and `billing.subscriptionId` is still null when the invite-accept runs. The grow-on-accept logic skips (`plan === "business"` check at L204 fails). Subsequent renewal won't fix the seat count. **POTENTIAL BUG — needs verification with a fast-invite test.**

---

# Recommendations (Prioritized)

1. **Fix RF#1 (write-ahead on accept)** — highest risk, silent under-billing. Add transactional rollback or reconciliation job.
2. **Decide on RF#2 (`/api/admin/update-plan`)** — delete the route or harden it. Currently the easiest way for an admin to break the system.
3. **Audit RF#5 (orphaned subs on comp)** — either auto-cancel or make the choice explicit in the admin UI.
4. **Add seat reconciliation at renewal** (rule 5) — wire `invoice.upcoming` (T-7) or `invoice.paid` to call `updateSubscriptionSeats(min(currentSeats, actualMembers))` IF the product wants Notion's "scale down at renewal" behavior. Currently deferred per code comment.
5. **Wrap `checkPlanLimit` + member add in a transaction** (RF#3) to close the Starter race.
6. **Verify UNKNOWN #10** — write a test that upgrades and accepts an invite within the webhook latency window.
7. **Delete `resumeSubscription` (RF#7)** or wire it to an admin "undo scheduled cancel" action.

---

**End of audit.**
