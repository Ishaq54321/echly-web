# Phase 1 (Stripe scaffolding) Pre-Flight Audit

**Date:** 2026-05-20
**Mode:** READ-ONLY — no files modified, no commands run, no APIs hit.
**Output file:** the only write performed by this audit.

---

## Section 1 — Email Template Patterns

### 1.1 Inventory of `lib/email/templates/`

All templates are **plain HTML/string `.ts` modules** (no `.tsx`, no React Email). Each exports HTML + plain-text builder functions that return `string`. Props are passed as a single object argument typed by a local `interface`.

| File | Exported functions | Props interface |
|------|--------------------|-----------------|
| [lib/email/templates/accessRequestNotification.ts](lib/email/templates/accessRequestNotification.ts) | `accessRequestNotificationEmailHtml`, `accessRequestNotificationEmailText` | `AccessRequestNotificationProps` |
| [lib/email/templates/accessRequestResult.ts](lib/email/templates/accessRequestResult.ts) | `accessRequestResultEmailHtml`, `accessRequestResultEmailText` | `AccessRequestResultProps` |
| [lib/email/templates/emailChange.ts](lib/email/templates/emailChange.ts) | `emailChangeEmailHtml`, `emailChangeEmailText` | `EmailChangeProps` (`newEmail`, `confirmUrl`) |
| [lib/email/templates/emailVerification.ts](lib/email/templates/emailVerification.ts) | `emailVerificationHtml`, `emailVerificationText` | `EmailVerificationProps` (`verifyUrl`) |
| [lib/email/templates/mention.ts](lib/email/templates/mention.ts) | `mentionSubject`, `mentionEmailHtml`, `mentionEmailText` | `MentionProps` |
| [lib/email/templates/newComment.ts](lib/email/templates/newComment.ts) | `newCommentSubject`, `newCommentEmailHtml`, `newCommentEmailText` | `NewCommentProps` |
| [lib/email/templates/passwordReset.ts](lib/email/templates/passwordReset.ts) | `passwordResetEmailHtml`, `passwordResetEmailText` | `PasswordResetProps` (`resetUrl`) |
| [lib/email/templates/paymentFailed.ts](lib/email/templates/paymentFailed.ts) | `paymentFailedEmailHtml`, `paymentFailedEmailText` | `PaymentFailedProps` |
| [lib/email/templates/planLimitApproaching.ts](lib/email/templates/planLimitApproaching.ts) | `planLimitApproachingSubject`, `planLimitApproachingEmailHtml`, `planLimitApproachingEmailText` | `PlanLimitApproachingProps` |
| [lib/email/templates/planLimitHit.ts](lib/email/templates/planLimitHit.ts) | `planLimitHitSubject`, `planLimitHitEmailHtml`, `planLimitHitEmailText` | `PlanLimitHitProps` |
| [lib/email/templates/sessionInvite.ts](lib/email/templates/sessionInvite.ts) | `sessionInviteEmailHtml`, `sessionInviteEmailText` | `SessionInviteProps` |
| [lib/email/templates/sessionOpened.ts](lib/email/templates/sessionOpened.ts) | `sessionOpenedSubject`, `sessionOpenedEmailHtml`, `sessionOpenedEmailText` | `SessionOpenedProps` |
| [lib/email/templates/subscriptionCancelled.ts](lib/email/templates/subscriptionCancelled.ts) | `subscriptionCancelledEmailHtml`, `subscriptionCancelledEmailText` | `SubscriptionCancelledProps` |
| [lib/email/templates/subscriptionConfirmation.ts](lib/email/templates/subscriptionConfirmation.ts) | `subscriptionConfirmationEmailHtml`, `subscriptionConfirmationEmailText` | `SubscriptionConfirmationProps` |
| [lib/email/templates/ticketAssigned.ts](lib/email/templates/ticketAssigned.ts) | `ticketAssignedSubject`, `ticketAssignedEmailHtml`, `ticketAssignedEmailText` | `TicketAssignedProps` |
| [lib/email/templates/welcome.ts](lib/email/templates/welcome.ts) | `welcomeEmailHtml`, `welcomeEmailText` | `WelcomeProps` |
| [lib/email/templates/workspaceDeletedConfirmation.ts](lib/email/templates/workspaceDeletedConfirmation.ts) | `workspaceDeletedConfirmationHtml`, `workspaceDeletedConfirmationText` | `WorkspaceDeletedConfirmationProps` |
| [lib/email/templates/workspaceInvite.ts](lib/email/templates/workspaceInvite.ts) | `workspaceInviteEmailHtml`, `workspaceInviteEmailText` | `WorkspaceInviteProps` |
| [lib/email/templates/workspaceInviteReminder.ts](lib/email/templates/workspaceInviteReminder.ts) | `workspaceInviteReminderHtml`, `workspaceInviteReminderText` | `WorkspaceInviteReminderProps` |

**Pattern summary:** every template is `.ts` (plain string builders), uses helpers from `../components` (`emailShellV2`, `emailCardV2`, `emailButtonV2`, `escapeEmailHtml`, `plainTextShellV2`, etc.), and exposes paired `*EmailHtml` + `*EmailText` exports. No React/JSX. **No new dependencies needed for Stripe email templates** — just two new files following this pattern.

---

### 1.2 Exact structure — billing templates

#### `lib/email/templates/subscriptionConfirmation.ts` (first 50 lines)

```ts
import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailInfoRowV2,
  emailDividerV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface SubscriptionConfirmationProps {
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
  settingsUrl: string;
  /** Monthly price per seat — from catalog, no hardcoded fallback. */
  pricePerSeat: number;
  /** Annual price per seat (monthly equivalent) — from catalog, no hardcoded fallback. */
  annualPricePerSeat: number;
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /** Phase-5 optional: plan display name. Defaults to "Business" (matches subject + prior copy). */
  planName?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Derives the human amount string from existing catalog props (no placeholders). */
function computeAmount(props: SubscriptionConfirmationProps): string {
  const { seatCount, billingCycle, pricePerSeat, annualPricePerSeat } = props;
  if (billingCycle === "annual") {
    return `$${(seatCount * annualPricePerSeat * 12).toFixed(2)}/year`;
  }
  return `$${(seatCount * pricePerSeat).toFixed(2)}/month`;
}

export function subscriptionConfirmationEmailHtml(
  props: SubscriptionConfirmationProps
```

#### `lib/email/templates/subscriptionCancelled.ts` (first 50 lines)

```ts
import {
  emailShellV2,
  emailCardV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface SubscriptionCancelledProps {
  workspaceName: string;
  /** Kept for signature stability — callers still pass it; the new copy is intentionally button-free. */
  upgradeUrl: string;
  /** Kept for signature stability — callers still pass it; new copy doesn't enumerate limits. */
  starterLimits: {
    maxMembers: number | null;
    maxFeedbackPerMonth: number | null;
    aiImprovementsPerMonth: number | null;
  };
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /** Phase-5 optional: paid plan display name. Defaults to "Business". */
  planName?: string;
  /** Phase-5 optional: date paid features end. Falls back to a generic phrase when absent. */
  periodEndDate?: string;
}

export function subscriptionCancelledEmailHtml(
  props: SubscriptionCancelledProps
): string {
  const { workspaceName, firstName, planName = "Business", periodEndDate } = props;

  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safePlan = escapeEmailHtml(planName);
  const throughClause = periodEndDate
    ? `You'll keep ${safePlan} features through <strong>${escapeEmailHtml(periodEndDate)}</strong>, after which the workspace switches to the free plan.`
    : `You'll keep ${safePlan} features until the end of your current billing period, after which the workspace switches to the free plan.`;

  return emailShellV2({
    preheader: "Your data stays put. The door's open whenever.",
    content: emailCardV2({
      content: `
        ${emailHeadingV2("Your Annote subscription is canceled")}
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `Your Annote subscription is canceled. You won't be charged again. ${throughClause}`
        )}
        ${emailParagraphV2(
          `What that means for your data: your sessions, captures, comments, and shared links all stay where they are. Nothing is deleted. You can keep using the free plan as long as you want, or export everything from the Billing page if you'd rather take it with you.`
```

#### `lib/email/templates/paymentFailed.ts` (first 50 lines)

```ts
import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailHeadingV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface PaymentFailedProps {
  workspaceName: string;
  portalUrl: string;
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /** Phase-5 optional: card brand (e.g. "Visa"). Copy degrades when absent. */
  cardBrand?: string;
  /** Phase-5 optional: last 4 of the card. Copy degrades when absent. */
  cardLast4?: string;
  /** Phase-5 optional: next retry date. Copy degrades when absent. */
  retryDate?: string;
  /** Phase-5 optional: plan display name. Defaults to "Business". */
  planName?: string;
}

/**
 * "We tried to charge Visa ending in 4242 for your Business plan" — degrades
 * to a generic line. `escape` is applied to interpolated values so the same
 * builder is safe for both HTML and plain-text callers (plain-text passes the
 * identity function).
 */
function chargeLine(
  props: PaymentFailedProps,
  escape: (s: string) => string
): string {
  const plan = escape(props.planName ?? "Business");
  if (props.cardBrand && props.cardLast4) {
    return `We tried to charge ${escape(props.cardBrand)} ending in ${escape(props.cardLast4)} for your ${plan} plan and it didn't go through. Most of the time this is an expired card or a temporary hold from your bank — easy to fix.`;
  }
  return `We tried to charge your card for your ${plan} plan and it didn't go through. Most of the time this is an expired card or a temporary hold from your bank — easy to fix.`;
}

/** Retry sentence — names the date when known, otherwise stays generic. */
function retryLine(retryDate?: string): string {
  return retryDate
    ? `We'll try again automatically over the next few days. If the next attempt fails on ${retryDate}, your workspace will drop to the free plan and new captures will pause. Everything you've already captured stays accessible either way.`
    : `We'll try again automatically over the next few days. If the next attempt fails, your workspace will drop to the free plan and new captures will pause. Everything you've already captured stays accessible either way.`;
```

---

### 1.3 `lib/email/billingEmails.ts` — full contents

```ts
import "server-only";
import { sendEmailOrLog } from "./resend";
import {
  subscriptionConfirmationEmailHtml,
  subscriptionConfirmationEmailText,
} from "./templates/subscriptionConfirmation";
import {
  subscriptionCancelledEmailHtml,
  subscriptionCancelledEmailText,
} from "./templates/subscriptionCancelled";
import {
  paymentFailedEmailHtml,
  paymentFailedEmailText,
} from "./templates/paymentFailed";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
}): Promise<void> { ... }

export async function sendSubscriptionCancelledEmail(params: {
  to: string;
  workspaceName: string;
}): Promise<void> { ... }

export async function sendPaymentFailedEmail(params: {
  to: string;
  workspaceName: string;
  portalUrl: string;
}): Promise<void> { ... }
```

**Three exported async functions** (signatures shown above; full bodies in [lib/email/billingEmails.ts](lib/email/billingEmails.ts:1-119)):

1. **`sendSubscriptionConfirmationEmail`** — looks up `business` plan from catalog (skips if prices missing), builds props with `pricePerSeat`/`annualPricePerSeat`/`settingsUrl`, sends with subject `"You're on Annote Business — here's what's next"`, `fromVariant: "founder"`.
2. **`sendSubscriptionCancelledEmail`** — looks up `starter` plan from catalog (skips if missing), builds `starterLimits` + `upgradeUrl`, subject `"Your Annote subscription is canceled"`, `fromVariant: "founder"`.
3. **`sendPaymentFailedEmail`** — direct pass-through of `workspaceName` + `portalUrl`, subject `"We couldn't process your payment"`, `fromVariant: "founder"`.

All three are **provider-agnostic** — none of them reference Paddle or Stripe directly. The webhook layer is the only thing that needs to vary by provider.

---

### 1.4 Email send mechanism

- **Service:** **Resend** (via `resend` npm package, declared in [package.json](package.json:58)).
- **`send()` call site:** [lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94) — `resend.emails.send({ from, to, subject, html, text, replyTo })`.
- **Wrapper:** all callers go through `sendEmailOrLog()` at [lib/email/resend.ts:55](lib/email/resend.ts#L55), which logs to console instead of sending when `RESEND_API_KEY` is unset or `EMAIL_DEV_LOG=true` (and not production).
- **From-address pattern** — defined at [lib/email/resend.ts:48-53](lib/email/resend.ts#L48-L53):
  - email constant: `noreply@annote.ai`
  - `system` variant → `Annote <noreply@annote.ai>`
  - `founder` variant → `Ishaq from Annote <noreply@annote.ai>`
- **Reply-to default:** `ishaq@annote.ai` ([lib/email/resend.ts:36](lib/email/resend.ts#L36)).
- All three billing emails use `fromVariant: "founder"`.

---

## Section 2 — Env Var Sync

### 2.1 Env vars declared in `.env.example`

Variables present (all currently commented out as templates):

- `ENABLE_DEBUG_UID`
- `ALLOWED_DEBUG_UIDS`
- `FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `EMAIL_DEV_LOG`
- `NEXT_PUBLIC_APP_URL`
- `UNSUBSCRIBE_SECRET`
- `PAYMENT_PROVIDER`
- `PADDLE_ENVIRONMENT`
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT`
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_BUSINESS_PRICE_MONTHLY_ID`
- `PADDLE_BUSINESS_PRICE_ANNUAL_ID`
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`

### 2.2 Env vars referenced in code but NOT in `.env.example`

**Stripe vars — confirmed ZERO hits across the entire repo** (excluding `node_modules`). Search `STRIPE_` returned `No files found`. We are starting fresh.

**Paddle vars — all present in `.env.example`**, matching code references in [lib/billing/payments/paddle.ts](lib/billing/payments/paddle.ts) and [lib/hooks/usePaddle.ts](lib/hooks/usePaddle.ts):
- `PADDLE_API_KEY` ✅
- `PADDLE_ENVIRONMENT` ✅
- `PADDLE_WEBHOOK_SECRET` ✅
- `PADDLE_BUSINESS_PRICE_MONTHLY_ID` ✅
- `PADDLE_BUSINESS_PRICE_ANNUAL_ID` ✅
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` ✅
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT` ✅

**`PAYMENT_PROVIDER`** — present in `.env.example` ([.env.example:33](.env.example#L33)), referenced in code at [lib/billing/payments/index.ts:6](lib/billing/payments/index.ts#L6).

**Other env vars used in code but missing from `.env.example`** (not blocking Phase 1 but worth flagging):
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — used by [lib/server/firebaseAdmin.ts:10-12](lib/server/firebaseAdmin.ts#L10-L12), [scripts/backfillUserProfiles.ts](scripts/backfillUserProfiles.ts).
- `NEXT_PUBLIC_FIREBASE_API_KEY` — used by [app/api/users/change-email/route.ts:13](app/api/users/change-email/route.ts#L13).
- `SESSION_SECRET`, `EXTENSION_TOKEN_SECRET` — used by [lib/server/session.ts:23](lib/server/session.ts#L23), [lib/server/emailVerifiedCookie.ts:9](lib/server/emailVerifiedCookie.ts#L9), [lib/server/extensionAuth.ts:10](lib/server/extensionAuth.ts#L10).
- `OPENAI_API_KEY` — used by [app/api/transcribe-audio/route.ts:73](app/api/transcribe-audio/route.ts#L73), [app/api/structure-feedback/route.ts:22](app/api/structure-feedback/route.ts#L22).
- `GOOGLE_OAUTH_CLIENT_ID`/`SECRET` (fallbacks to `GOOGLE_CLIENT_ID`/`SECRET`) — [app/api/auth/google-contacts/authorize/route.ts:52](app/api/auth/google-contacts/authorize/route.ts#L52).
- `ECHLY_WEB_APP_URL`, `ECHLY_API_BASE` — used by extension build [esbuild-extension.mjs:61](esbuild-extension.mjs#L61) and capture engine.

### 2.3 `.env.local` in `.gitignore`

**Yes** — covered by the wildcard rule at [.gitignore:34-35](.gitignore#L34-L35):

```
.env*
!.env.example
```

This excludes all `.env*` files except `.env.example`. `.env.local` is therefore git-ignored.

### 2.4 Other env files checked in

`Glob .env*` returned exactly two files:
- `.env.example` (committed, intentional)
- `.env.local` (present locally, **git-ignored** per the above rule — confirmed)

No `.env.production`, `.env.staging`, or other env file is tracked in the repository.

---

## Section 3 — Idempotency Store Confirmation

### 3.1 References to `webhookEvents` / dedup collections / TTL config

**Zero hits in code.** The only mentions of `webhookEvents` are in the prior audit document [docs/audits/paddle-migration-audit.md](docs/audits/paddle-migration-audit.md) (lines 462, 554, 604), which **recommends** adding such a collection. No collection, no rule, no index, no Firestore TTL policy exists.

Confirmed:
- **No `webhookEvents` collection rule** in `firestore.rules`.
- **No `webhookEvents` index** in `firestore.indexes.json`.
- **No TTL policy** declared anywhere in `firestore.indexes.json` (Firestore TTLs are managed via the Console or `gcloud firestore fields ttls update`, not in the indexes file — so the architect should plan to set it via Console or Terraform on the `expiresAt` field of the new collection).

Idempotency today is reconstructed from current workspace state inside each handler — see the comments in [app/api/billing/webhook/route.ts:160-172](app/api/billing/webhook/route.ts#L160-L172), [:350-353](app/api/billing/webhook/route.ts#L350-L353), [:437-446](app/api/billing/webhook/route.ts#L437-L446). The handler has no notion of `eventId`-level dedup. Phase 1 needs to add this from scratch.

### 3.2 Current `firestore.rules` (full)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthed() {
      return request.auth != null;
    }

    function isWorkspaceMember(wid) {
      return isAuthed()
        && request.auth.token.workspaceIds is list
        && wid in request.auth.token.workspaceIds;
    }

    function hasSessionAccess(uid, sid) {
      return isAuthed()
        && exists(/databases/$(database)/documents/sessionAccess/$(uid + "_" + sid));
    }

    match /users/{uid} {
      allow read: if isAuthed() && request.auth.uid == uid;
      allow write: if false;
    }

    match /userProfiles/{uid} {
      allow read: if isAuthed();
      allow write: if false;
    }

    match /workspaces/{wid} {
      allow read: if isWorkspaceMember(wid);
      allow write: if false;
    }

    match /workspaces/{wid}/insights/{docId} {
      allow read: if isWorkspaceMember(wid);
      allow write: if false;
    }

    match /sessions/{sessionId} {
      allow read: if isWorkspaceMember(resource.data.workspaceId)
                  || hasSessionAccess(request.auth.uid, sessionId);
      allow write: if false;

      match /members/{memberId} {
        allow read: if isAuthed()
                    && (
                         isWorkspaceMember(
                           get(/databases/$(database)/documents/sessions/$(sessionId)).data.workspaceId
                         )
                         || hasSessionAccess(request.auth.uid, sessionId)
                       );
        allow write: if false;
      }

      match /presence/{userId} {
        allow read: if isAuthed()
                    && (
                         isWorkspaceMember(
                           get(/databases/$(database)/documents/sessions/$(sessionId)).data.workspaceId
                         )
                         || hasSessionAccess(request.auth.uid, sessionId)
                       );
        allow write: if isAuthed() && request.auth.uid == userId;
      }

      match /accessRequests/{reqId} {
        allow read: if isAuthed()
                    && (
                         isWorkspaceMember(
                           get(/databases/$(database)/documents/sessions/$(sessionId)).data.workspaceId
                         )
                         || hasSessionAccess(request.auth.uid, sessionId)
                       );
        allow write: if false;
      }
    }

    match /feedback/{id} {
      allow read: if isWorkspaceMember(resource.data.workspaceId)
                  || hasSessionAccess(request.auth.uid, resource.data.sessionId);
      allow write: if false;
    }

    match /comments/{id} {
      allow read: if isWorkspaceMember(resource.data.workspaceId)
                  || hasSessionAccess(request.auth.uid, resource.data.sessionId);
      allow write: if false;
    }

    match /workspaces/{wid}/activityEvents/{eventId} {
      allow read: if isAuthed()
                  && (
                       isWorkspaceMember(wid)
                       || hasSessionAccess(request.auth.uid, resource.data.sessionId)
                     );
      allow write: if false;
    }

    match /screenshots/{id} {
      allow read: if isWorkspaceMember(resource.data.workspaceId)
                  || hasSessionAccess(request.auth.uid, resource.data.sessionId);
      allow write: if false;
    }

    match /sessionAccess/{docId} {
      allow read: if isAuthed()
                  && docId.matches(".+_.+")
                  && docId.split("_")[0] == request.auth.uid;
      allow write: if false;
    }

    match /notifications/{notificationId} {
      allow read: if isAuthed() && request.auth.uid == resource.data.userId;
      allow update: if isAuthed()
                    && request.auth.uid == resource.data.userId
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
      allow create, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Rule shape note for the architect:** every existing top-level collection follows the pattern `allow write: if false;` (writes are Admin-SDK only, bypassing rules) and an explicit `read` guard. The terminal `match /{document=**}` is a catch-all deny — so a new `webhookEvents` collection inserted **above** that line with `allow read, write: if false;` would correctly lock the collection to Admin SDK access (which is what we want — clients should never read or write webhook event records).

### 3.3 `firestore.indexes.json` confirmation

The full file is at [firestore.indexes.json](firestore.indexes.json) (375 lines). It contains composite indexes for `feedback`, `comments`, `sessions`, `activityEvents`, `notifications`, and one `fieldOverrides` entry for the `members` subcollection's `userId`. **Zero indexes reference `webhookEvents` or any billing collection.**

Single-field indexes on a new `webhookEvents` collection (e.g. `expiresAt` for TTL, or `provider + eventId` for the dedup key) will be needed depending on how the architect models it, but none exist today.

---

## Section 4 — Webhook Route Exact Structure

### 4.1 `app/api/billing/webhook/route.ts` — full contents

The file is 465 lines. Reproduced in full below.

```ts
  1  import { NextResponse } from "next/server";
  2  import { FieldValue } from "firebase-admin/firestore";
  3  import { adminDb } from "@/lib/server/firebaseAdmin";
  4  import { getPaymentProvider } from "@/lib/billing/payments";
  5  import { logAdminAction } from "@/lib/admin/adminLogs";
  6  import {
  7    sendSubscriptionConfirmationEmail,
  8    sendSubscriptionCancelledEmail,
  9    sendPaymentFailedEmail,
 10  } from "@/lib/email/billingEmails";
 11  import type { WebhookEvent } from "@/lib/billing/payments/types";
 12
 13  export const runtime = "nodejs";
 14  export const dynamic = "force-dynamic";
 15
 16  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
 17  const BILLING_PORTAL_URL = `${APP_URL}/settings?tab=billing`;
 18
 19  /**
 20   * Resolve the owner email + workspace name for a workspace. Inlined (rather
 21   * than a shared helper) — billing emails need both `to` and `workspaceName`.
 22   */
 23  async function getWorkspaceContext(
 24    workspaceId: string
 25  ): Promise<{ ownerEmail: string | null; workspaceName: string }> {
 26    try {
 27      const wsSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
 28      if (!wsSnap.exists) return { ownerEmail: null, workspaceName: "Your workspace" };
 29      const ws = wsSnap.data() as { ownerId?: string; name?: string } | undefined;
 30      const workspaceName = ws?.name ?? "Your workspace";
 31      if (!ws?.ownerId) return { ownerEmail: null, workspaceName };
 32      const userSnap = await adminDb.doc(`users/${ws.ownerId}`).get();
 33      if (!userSnap.exists) return { ownerEmail: null, workspaceName };
 34      const u = userSnap.data() as { email?: string } | undefined;
 35      return { ownerEmail: u?.email ?? null, workspaceName };
 36    } catch {
 37      return { ownerEmail: null, workspaceName: "Your workspace" };
 38    }
 39  }
 40
 41  export async function POST(req: Request) {
 42    // Pre-validation (cheap 400 cases). Signature/body are checked before any
 43    // provider work so a malformed request never reaches the SDK.
 44    const signature = req.headers.get("paddle-signature") ?? "";
 45    const rawBody = await req.text();
 46
 47    // DEV-ONLY: skip-signature mode for fixture testing. Guarded by NODE_ENV
 48    // AND a shared secret header so it cannot be triggered in production.
 49    const isDev = process.env.NODE_ENV !== "production";
 50    const devTestHeader = req.headers.get("x-echly-webhook-test");
 51    const skipSignature = Boolean(
 52      isDev && devTestHeader && devTestHeader === process.env.CRON_SECRET
 53    );
 54
 55    if (!skipSignature) {
 56      if (!signature) {
 57        return NextResponse.json(
 58          { error: "Missing paddle-signature header" },
 55          { status: 400 }
 60        );
 61      }
 62      if (!rawBody) {
 63        return NextResponse.json({ error: "Empty body" }, { status: 400 });
 64      }
 65    }
 66
 67    try {
 68      let event: WebhookEvent;
 69      if (skipSignature) {
 70        // Dev mode: trust the body as an already-normalized fixture.
 71        event = JSON.parse(rawBody) as WebhookEvent;
 72      } else {
 73        const provider = getPaymentProvider();
 74        event = await provider.parseWebhookEvent(rawBody, signature);
 75      }
 76
 77      switch (event.type) {
 78        case "subscription_started":
 79          await handleSubscriptionStarted(event);
 80          break;
 81        case "subscription_updated":
 82          await handleSubscriptionUpdated(event);
 83          break;
 84        case "subscription_canceled":
 85          await handleSubscriptionCanceled(event);
 86          break;
 87        case "payment_failed":
 88          await handlePaymentFailed(event);
 89          break;
 90        case "unknown":
 91          // No-op — includes transaction.completed and any unhandled type.
 92          console.log(
 93            `[webhook] Unhandled event type (no-op), eventId=${event.eventId}`
 94          );
 95          break;
 96      }
 97
 98      return NextResponse.json({ received: true });
 99    } catch (err) {
100      console.error("[webhook] handler error:", err);
101      // 500 — Paddle will retry. NOT 400: Paddle has no "stop retrying" status,
102      // and a 400 on a rotated/expired secret would silently drop events.
103      return NextResponse.json(
104        { error: "Internal handler error", received: false },
105        { status: 500 }
106      );
107    }
108  }
109
110  async function handleSubscriptionStarted(
111    event: Extract<WebhookEvent, { type: "subscription_started" }>
112  ) {
113    const provider = getPaymentProvider();
114
115    // Resolve workspaceId: primary (customData) → fallback (query by customerId).
116    let workspaceId = event.data.workspaceId;
117    if (!workspaceId) {
118      const snapshot = await adminDb
119        .collection("workspaces")
120        .where("billing.customerId", "==", event.data.customerId)
121        .limit(1)
122        .get();
123      if (!snapshot.empty) {
124        workspaceId = snapshot.docs[0].id;
125      }
126    }
127
128    if (!workspaceId) {
129      // Unrecoverable — log and accept (don't 500-loop on a permanently
130      // unresolvable event).
131      await logAdminAction({
132        adminId: "billing-webhook",
133        action: "webhook_unresolved_workspace",
134        workspaceId: null,
135        metadata: {
136          event: "subscription_started",
137          customerId: event.data.customerId,
138          subscriptionId: event.data.subscriptionId,
139        },
140      });
141      console.error(
142        "[webhook] subscription_started: could not resolve workspace",
143        event.data
144      );
145      return;
146    }
147
148    const wsRef = adminDb.collection("workspaces").doc(workspaceId);
149    const wsSnap = await wsRef.get();
150    const ws = wsSnap.data() as
151      | { name?: string; billing?: { plan?: string; subscriptionId?: string | null; manualOverride?: boolean } }
152      | undefined;
153
154    if (!ws) {
155      console.error(`[webhook] workspace ${workspaceId} not found`);
156      return;
157    }
158
159    const wasManualOverride = ws.billing?.manualOverride === true;
160    const alreadyPaid =
161      (ws.billing?.plan === "business" || ws.billing?.plan === "enterprise") &&
162      !!ws.billing?.subscriptionId;
163
164    // Idempotency: a genuine duplicate delivery finds the workspace already on
165    // a paid plan with a real subscription AND not a comp. A comp'd workspace
166    // must still fall through to write the real IDs and clear the comp flag.
167    if (alreadyPaid && !wasManualOverride) {
168      console.log(
169        `[webhook] subscription_started already applied for workspace ${workspaceId} — skipping (idempotency)`
170      );
171      return;
172    }
173
174    const subData = await provider.getSubscriptionData(
175      event.data.subscriptionId
176    );
177
178    // Real payment supersedes any admin-granted comp.
179    const startedUpdates: Record<string, unknown> = {
180      "billing.plan": "business",
181      "billing.customerId": event.data.customerId,
182      "billing.subscriptionId": event.data.subscriptionId,
183      "billing.seats": subData.seatCount,
184      "billing.billingCycle": subData.billingCycle,
185      "billing.suspended": false,
186      "billing.manualOverride": false,
187      "billing.cancelAt": null,
188      "billing.nextBilledAt": subData.currentPeriodEnd,
189      updatedAt: FieldValue.serverTimestamp(),
190    };
191    if (subData.paymentMethod) {
192      startedUpdates["billing.paymentMethod"] = subData.paymentMethod;
193    }
194    await wsRef.update(startedUpdates);
195
196    await logAdminAction({
197      adminId: "billing-webhook",
198      action: "subscription_activated",
199      workspaceId,
200      metadata: {
201        customerId: event.data.customerId,
202        subscriptionId: event.data.subscriptionId,
203        seatCount: subData.seatCount,
204        billingCycle: subData.billingCycle,
205      },
206    });
207
208    if (wasManualOverride) {
209      await logAdminAction({
210        adminId: "billing-webhook",
211        action: "webhook_cleared_manual_override",
212        workspaceId,
213        metadata: {
214          reason: "real_payment_completed",
215          customerId: event.data.customerId,
216          subscriptionId: event.data.subscriptionId,
217        },
218      });
219    }
220
221    const { ownerEmail, workspaceName } = await getWorkspaceContext(workspaceId);
222    if (ownerEmail) {
223      await sendSubscriptionConfirmationEmail({
224        to: ownerEmail,
225        workspaceName,
226        seatCount: subData.seatCount,
227        billingCycle: subData.billingCycle,
228        nextBillingDate: subData.currentPeriodEnd,
229      });
230    }
231  }
232
233  async function handleSubscriptionUpdated(
234    event: Extract<WebhookEvent, { type: "subscription_updated" }>
235  ) {
236    const provider = getPaymentProvider();
237
238    const snapshot = await adminDb
239      .collection("workspaces")
240      .where("billing.subscriptionId", "==", event.data.subscriptionId)
241      .limit(1)
242      .get();
243
244    if (snapshot.empty) {
245      console.warn(
246        `[webhook] subscription_updated: no workspace for sub ${event.data.subscriptionId}`
247      );
248      return;
249    }
250
251    const wsRef = snapshot.docs[0].ref;
252    const ws = snapshot.docs[0].data() as
253      | { billing?: { manualOverride?: boolean } }
254      | undefined;
255
256    // Re-fetch current state from Paddle (convergent — don't trust the delta).
257    const subData = await provider.getSubscriptionData(
258      event.data.subscriptionId
259    );
260
261    const shouldSuspend = subData.status === "past_due";
262    const isManualOverride = ws?.billing?.manualOverride === true;
263
264    const updates: Record<string, unknown> = {
265      "billing.seats": subData.seatCount,
266      "billing.billingCycle": subData.billingCycle,
267      "billing.nextBilledAt": subData.currentPeriodEnd,
268      updatedAt: FieldValue.serverTimestamp(),
269    };
270
271    updates["billing.cancelAt"] = subData.cancelAtPeriodEnd
272      ? subData.currentPeriodEnd
273      : null;
274
275    if (subData.paymentMethod) {
276      updates["billing.paymentMethod"] = subData.paymentMethod;
277    }
278
279    if (!isManualOverride) {
280      updates["billing.suspended"] = shouldSuspend;
281    } else if (shouldSuspend) {
282      await logAdminAction({
283        adminId: "billing-webhook",
284        action: "webhook_skip_suspend_manual_override",
285        workspaceId: wsRef.id,
286        metadata: {
287          event: "subscription_updated",
288          subscriptionId: event.data.subscriptionId,
289        },
290      });
291    }
292
293    await wsRef.update(updates);
294  }
295
296  async function handleSubscriptionCanceled(
297    event: Extract<WebhookEvent, { type: "subscription_canceled" }>
298  ) {
299    const snapshot = await adminDb
300      .collection("workspaces")
301      .where("billing.subscriptionId", "==", event.data.subscriptionId)
302      .limit(1)
303      .get();
304
305    if (snapshot.empty) {
306      console.warn(
307        `[webhook] subscription_canceled: no workspace for sub ${event.data.subscriptionId}`
308      );
309      return;
310    }
311
312    const wsRef = snapshot.docs[0].ref;
313    const ws = snapshot.docs[0].data() as
314      | { billing?: { plan?: string; manualOverride?: boolean } }
315      | undefined;
316
317    if (ws?.billing?.manualOverride === true) {
318      console.log(
319        `[webhook] subscription_canceled on manual-override workspace ${wsRef.id} — skipping downgrade`
320      );
321      await logAdminAction({
322        adminId: "billing-webhook",
323        action: "webhook_skip_downgrade_manual_override",
324        workspaceId: wsRef.id,
325        metadata: {
326          event: "subscription_canceled",
327          subscriptionId: event.data.subscriptionId,
328        },
329      });
330      return;
331    }
332
333    const wasOnPaidPlan =
334      ws?.billing?.plan === "business" || ws?.billing?.plan === "enterprise";
335
336    await wsRef.update({
337      "billing.plan": "starter",
338      "billing.seats": 1,
339      "billing.subscriptionId": null,
340      "billing.billingCycle": "monthly",
341      "billing.cancelAt": null,
342      "billing.nextBilledAt": null,
343      "billing.suspended": false,
344      updatedAt: FieldValue.serverTimestamp(),
345    });
346
347    await logAdminAction({
348      adminId: "billing-webhook",
349      action: "subscription_cancelled",
350      workspaceId: wsRef.id,
351      metadata: {
352        subscriptionId: event.data.subscriptionId,
353        previousPlan: ws?.billing?.plan,
354      },
355    });
356
357    if (wasOnPaidPlan) {
358      const { ownerEmail, workspaceName } = await getWorkspaceContext(wsRef.id);
359      if (ownerEmail) {
360        await sendSubscriptionCancelledEmail({
361          to: ownerEmail,
362          workspaceName,
363        });
364      }
365    }
366  }
367
368  async function handlePaymentFailed(
369    event: Extract<WebhookEvent, { type: "payment_failed" }>
370  ) {
371    if (!event.data.subscriptionId) {
372      console.warn(
373        "[webhook] payment_failed without subscriptionId — skipping"
374      );
375      return;
376    }
377
378    const snapshot = await adminDb
379      .collection("workspaces")
380      .where("billing.subscriptionId", "==", event.data.subscriptionId)
381      .limit(1)
382      .get();
383
384    if (snapshot.empty) {
385      console.warn(
386        `[webhook] payment_failed: no workspace for sub ${event.data.subscriptionId}`
387      );
388      return;
389    }
390
391    const wsRef = snapshot.docs[0].ref;
392    const ws = snapshot.docs[0].data() as
393      | { billing?: { suspended?: boolean; manualOverride?: boolean } }
394      | undefined;
395
396    if (ws?.billing?.manualOverride === true) {
397      console.log(
398        `[webhook] payment_failed on manual-override workspace ${wsRef.id} — skipping suspend`
399      );
400      await logAdminAction({
401        adminId: "billing-webhook",
402        action: "webhook_skip_suspend_manual_override",
403        workspaceId: wsRef.id,
404        metadata: {
405          event: "payment_failed",
406          subscriptionId: event.data.subscriptionId,
407        },
408      });
409      return;
410    }
411
412    const wasSuspended = ws?.billing?.suspended === true;
413
414    await wsRef.update({
415      "billing.suspended": true,
416      updatedAt: FieldValue.serverTimestamp(),
417    });
418
419    if (!wasSuspended) {
420      const { ownerEmail, workspaceName } = await getWorkspaceContext(wsRef.id);
421      if (ownerEmail) {
422        await sendPaymentFailedEmail({
423          to: ownerEmail,
424          workspaceName,
425          portalUrl: BILLING_PORTAL_URL,
426        });
427      }
428      await logAdminAction({
429        adminId: "billing-webhook",
430        action: "payment_failed",
431        workspaceId: wsRef.id,
432        metadata: {
433          subscriptionId: event.data.subscriptionId,
434          previousPlan: ws?.billing?.plan,
435        },
436      });
437    }
438  }
```

**Key insertion-point notes for the architect:**

- **Signature header is Paddle-specific** (`paddle-signature`, line 44). Stripe uses `stripe-signature`. Today, header lookup is inlined into `POST`; routing this through the provider abstraction would require lifting header parsing into `provider.parseWebhookEvent` or adding a `provider.signatureHeaderName` getter.
- **`provider.parseWebhookEvent(rawBody, signature)` is the single SDK boundary** (line 74). The normalized `WebhookEvent` discriminated union ([lib/billing/payments/types.ts](lib/billing/payments/types.ts)) already abstracts away provider differences — handlers below it know nothing about Paddle.
- **Idempotency injection point:** after `parseWebhookEvent` (line 74) and before the `switch` (line 77). A dedup check on `event.eventId + provider name` would short-circuit duplicate deliveries cleanly. **Caveat:** today, idempotency for `subscription_canceled` and `payment_failed` is reconstructed from state and *gates the email* (lines 333/412), so an `eventId`-level dedup needs to also guard those email sends, or the existing state-based guards become redundant (preferred — simpler).
- **Provider-agnostic by design:** the dev-test branch (lines 50-53, 69-71) bypasses signature verification with a fixed header name `x-echly-webhook-test`. That name is provider-agnostic and can stay; but the production `paddle-signature` lookup will need to vary by provider OR be parameterized.
- **DEV mode skip-signature reads `req.headers.get("paddle-signature")` (line 44) before deciding to skip** — harmless for Stripe (header just comes back `null`), so this doesn't block adding Stripe.

### 4.2 `lib/billing/payments/index.ts` — full contents

```ts
 1  import type { PaymentProvider } from "./types";
 2  import { PaddleProvider } from "./paddle";
 3
 4  let _provider: PaymentProvider | null = null;
 5
 6  const PROVIDER_NAME = process.env.PAYMENT_PROVIDER ?? "paddle";
 7
 8  export function getPaymentProvider(): PaymentProvider {
 9    if (_provider) return _provider;
 10
 11    // Paddle provider is the only supported provider going forward.
 12    // Construction is cheap — the SDK is lazily initialized in getPaddle().
 13    if (PROVIDER_NAME === "paddle") {
 14      _provider = new PaddleProvider();
 15      return _provider;
 16    }
 17
 18    throw new Error(`[billing] Unknown payment provider: ${PROVIDER_NAME}`);
 19  }
 20
 21  // Test/dev helper — Phase C2 will register the real PaddleProvider here.
 22  export function _setPaymentProvider(provider: PaymentProvider | null): void {
 23    _provider = provider;
 24  }
 25
 26  export * from "./types";
 27```

**Phase 1 modification surface:**
- Line 6: `PROVIDER_NAME` is read **once at module load**. The module-level `_provider` cache (line 4) means switching providers in-process is not possible — the second branch added for `"stripe"` will only matter on a fresh import (i.e. cold start). Good for production; matters for tests, where `_setPaymentProvider(null)` must be called between cases.
- Line 13-16: the if-block to mirror for Stripe. Will become something like:
  ```ts
  if (PROVIDER_NAME === "stripe") {
    _provider = new StripeProvider();
    return _provider;
  }
  ```
- Line 18: the unknown-provider throw stays as the catch-all; no change.
- Line 26 re-export means existing imports from `@/lib/billing/payments` keep working unchanged — any new types added in `types.ts` will be visible to callers.

---

## Section 5 — Package Installation Context

### 5.1 Canonical lockfile

Both `pnpm-lock.yaml` AND `package-lock.json` are present at the repo root. Inside `node_modules/.pnpm/` there is a populated pnpm content-addressed store (e.g. `node_modules/.pnpm/@google-cloud+firestore@7.11.6/...`), which is the definitive marker of **pnpm** as the installer in use. The presence of `package-lock.json` alongside is most likely a vestige of an earlier npm setup that wasn't deleted and is not the active source of truth.

**Verdict:** **pnpm is the canonical package manager.** Architect should use `pnpm add stripe` (and `pnpm add -D @types/stripe` if not bundled) for Phase 1.

Flag for cleanup (optional, not blocking Phase 1): the redundant `package-lock.json` could be deleted to avoid future confusion.

### 5.2 `scripts` section of `package.json`

From [package.json:8-16](package.json#L8-L16):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "build:extension": "npm run build:extension:css && npm run build:extension:js",
  "build:extension:css": "npx postcss app/globals.css -o annote-extension/popup.css && node -e \"const fs=require('fs'); const f=fs.readFileSync('annote-extension/extension-fonts.css','utf8'); const m=fs.readFileSync('annote-extension/popup.css','utf8'); fs.writeFileSync('annote-extension/popup.css', f+m);\"",
  "build:extension:js": "node esbuild-extension.mjs"
}
```

**No test script** is defined. Any test runner added during Phase 1 (e.g. for webhook idempotency) would need a new `test` entry. **No `migrate` or `db:*` scripts** — Firestore schema changes happen via deploys and the Firebase Console.

### 5.3 `engines` field

**Not present** in `package.json`. There is no `"engines"` block — Node version is unconstrained by `package.json`. Vercel uses its dashboard-configured Node version. If a minimum Node version is required by the Stripe SDK (typically Node ≥ 18 for recent versions), this is worth pinning in Phase 1 to avoid drift.

---

## End of Report

No source files were modified. The only write performed was this report itself.
