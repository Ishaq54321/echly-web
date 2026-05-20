# Paddle → Stripe Migration Audit (READ-ONLY)

Auditor: Claude (read-only)
Date: 2026-05-20
Scope: Complete inventory of every Paddle touchpoint in this codebase.
Method: Static analysis only — no commands executed, no state changed.

> ⚠️ **Idempotency note:** the webhook event payloads include `eventId` and are
> propagated through `WebhookEvent.eventId`, but **no provider-event idempotency
> store** is wired up — duplicate-delivery protection is reconstructed from
> Firestore state (see §6.4 and §9.3).

---

## Section 1 — Environment & Configuration

### 1.1 Paddle env vars referenced in code

| Variable | File(s):line | Purpose | In `.env.example`? |
|---|---|---|---|
| `PADDLE_API_KEY` | [lib/billing/payments/paddle.ts:27,28,37](../../lib/billing/payments/paddle.ts#L27-L37) | Server SDK auth (sandbox vs prod) | Yes ([.env.example:44](../../.env.example#L44)) |
| `PADDLE_ENVIRONMENT` | [lib/billing/payments/paddle.ts:32](../../lib/billing/payments/paddle.ts#L32) | Switches `Environment.production` vs `Environment.sandbox` for the SDK | Yes ([.env.example:36](../../.env.example#L36)) |
| `PADDLE_WEBHOOK_SECRET` | [lib/billing/payments/paddle.ts:91,92,99](../../lib/billing/payments/paddle.ts#L91-L99) | HMAC verification of incoming webhook (via `webhooks.unmarshal`) | Yes ([.env.example:48](../../.env.example#L48)) |
| `PADDLE_BUSINESS_PRICE_MONTHLY_ID` | [lib/billing/payments/paddle.ts:46](../../lib/billing/payments/paddle.ts#L46) | Monthly Business price ID used at checkout | Yes ([.env.example:51](../../.env.example#L51)) |
| `PADDLE_BUSINESS_PRICE_ANNUAL_ID` | [lib/billing/payments/paddle.ts:45,221](../../lib/billing/payments/paddle.ts#L45) | Annual Business price ID + cycle detection in `mapPaddleSubscriptionToDTO` | Yes ([.env.example:52](../../.env.example#L52)) |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | [lib/hooks/usePaddle.ts:31,38](../../lib/hooks/usePaddle.ts#L31) | Client-side Paddle.js initialization token | Yes ([.env.example:56](../../.env.example#L56)) |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | [lib/hooks/usePaddle.ts:33](../../lib/hooks/usePaddle.ts#L33), [app/admin/customers/page.tsx:19](../../app/admin/customers/page.tsx#L19) | Client-side env switch + admin dashboard deep-link host (`vendors.paddle.com` vs `sandbox-vendors.paddle.com`) | Yes ([.env.example:40](../../.env.example#L40)) |

Not present in `vercel.json`, `next.config.ts`, `tsconfig.json`, or any other config file.

### 1.2 `PAYMENT_PROVIDER` env var

Only one read site:

- [lib/billing/payments/index.ts:6](../../lib/billing/payments/index.ts#L6) — `const PROVIDER_NAME = process.env.PAYMENT_PROVIDER ?? "paddle";`
- [lib/billing/payments/index.ts:13](../../lib/billing/payments/index.ts#L13) — single `if (PROVIDER_NAME === "paddle")` branch that constructs `PaddleProvider`.
- Falls through to `throw new Error("[billing] Unknown payment provider: …")` for any other value.

In effect: **the abstraction exists, but only the Paddle implementation is registered.** Adding `"stripe"` requires a new arm here plus a `StripeProvider` class.

### 1.3 Paddle-related entries in config

- [package.json:19-20](../../package.json#L19-L20):
  - `"@paddle/paddle-js": "^1.6.4"` (client-side overlay SDK)
  - `"@paddle/paddle-node-sdk": "^3.8.0"` (server-side SDK)
- `package-lock.json`: both packages locked (lines confirmed present, contents not transcribed).
- `pnpm-lock.yaml`: both packages present (lines 14, 17, 1193, 1196, 4941).
- `vercel.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `cors.json`: **no Paddle references.**

---

## Section 2 — Backend Code Inventory

### 2.1 `lib/billing/payments/paddle.ts` — full audit

File: [lib/billing/payments/paddle.ts](../../lib/billing/payments/paddle.ts) (390 lines).

Imports from `@paddle/paddle-node-sdk`: `Environment`, `EventName`, `LogLevel`, `Paddle`, type-only `EventEntity`, `PaddleOptions`, `Subscription`.

Module-level helper:
- `getPaddle(): Paddle` — memoized SDK client. Reads `PADDLE_API_KEY`, `PADDLE_ENVIRONMENT`. Throws if API key missing.

Exported class `PaddleProvider implements PaymentProvider`:

| Method (signature) | Calls / what it does |
|---|---|
| `resolveBusinessPriceId(billingCycle: "monthly" \| "annual"): string` | Pure env-var lookup; returns `PADDLE_BUSINESS_PRICE_{ANNUAL,MONTHLY}_ID`. No SDK call. |
| `createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>` | **No server SDK call.** Returns the priceId + `customData: { workspaceId }` + email/customerId for the client overlay to consume. The actual checkout happens in the browser via Paddle.js. |
| `createPortalSession(params: PortalParams): Promise<PortalResult>` | `paddle.customerPortalSessions.create(customerId, [])` → returns `session.urls.general.overview`. Note: `returnUrl` from `PortalParams` is accepted-but-ignored. |
| `parseWebhookEvent(body, signature): Promise<WebhookEvent>` | `paddle.webhooks.unmarshal(rawBody, PADDLE_WEBHOOK_SECRET, signature)` → throws on bad sig/expired/malformed → calls local `normalizePaddleEvent`. |
| `getSubscriptionData(subscriptionId): Promise<SubscriptionData>` | `paddle.subscriptions.get(id)` + `fetchLatestCardForCustomer(customerId)` (1+ extra reads). |
| `listTransactions(customerId): Promise<TransactionSummary[]>` | `paddle.transactions.list({ customerId: [id], orderBy: "billed_at[DESC]", perPage: 50 })`, async-iterated, capped at 50. |
| `getInvoicePdfUrl(transactionId): Promise<string \| null>` | `paddle.transactions.getInvoicePDF(transactionId)` → `invoice.url ?? null`. Swallows errors as null (draft txns). |
| `getTransactionCustomerId(transactionId): Promise<string \| null>` | `paddle.transactions.get(id)` → `tx.customerId ?? null`. Used for ownership check on invoice download. |
| `updateSubscriptionSeats(subscriptionId, newSeatCount): Promise<void>` | `subscriptions.get(id)` (to read existing priceId — items[] is FULL REPLACE not patch) + `subscriptions.update(id, { items: [{priceId, quantity}], prorationBillingMode: "prorated_immediately" })`. |
| `updateSubscriptionPlan(subscriptionId, newPriceId, prorationMode?): Promise<void>` | `subscriptions.get(id)` (preserve quantity) + `subscriptions.update(id, { items, prorationBillingMode })`. |
| `cancelSubscription(subscriptionId, atPeriodEnd): Promise<void>` | `subscriptions.cancel(id, { effectiveFrom: atPeriodEnd ? "next_billing_period" : "immediately" })`. |
| `resumeSubscription(subscriptionId): Promise<void>` | Branchy: `subscriptions.resume({ effectiveFrom: "immediately" })` if paused; else `subscriptions.update(id, { scheduledChange: null })` if there is a scheduled cancel/pause; else no-op. |

Internal helpers:
- `mapPaddleSubscriptionToDTO(sub: Subscription): SubscriptionData` — maps Paddle states (trialing/active/past_due/paused/canceled) into our 4-state union; identifies cycle by comparing `items[0].price.id` against `PADDLE_BUSINESS_PRICE_ANNUAL_ID`; reads `currentBillingPeriod?.endsAt ?? nextBilledAt`; `cancelAtPeriodEnd = sub.scheduledChange?.action === "cancel"`.
- `fetchLatestCardForCustomer(customerId)` — scans last 10 transactions for a `payments[*].methodDetails.card.last4`; best-effort, swallows errors.
- `formatMoney(amount, currencyCode)` — Paddle returns minor units as strings; converts to `Intl.NumberFormat` major.
- `mapTransactionStatus(paddleStatus)` — `completed/paid` pass through; `billed/ready/draft → pending`; `past_due → failed`; `canceled → refunded`.
- `normalizePaddleEvent(event: EventEntity): WebhookEvent` — the switch on `event.eventType` (see §6.3).

**Paddle-specific shapes leaked to callers (via DTO):** none directly — the file fully translates SDK shapes into the `SubscriptionData` / `WebhookEvent` / `TransactionSummary` DTOs declared in `types.ts`. Note however that proration modes (`ProrationMode`) and the `last4`/`brand` payment-method shape are inherited from Paddle's vocabulary verbatim (see §9.1).

### 2.2 `lib/billing/payments/types.ts`

File: [lib/billing/payments/types.ts](../../lib/billing/payments/types.ts) (118 lines).

`PaymentProvider` interface (full):

```ts
export interface PaymentProvider {
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  createPortalSession(params: PortalParams): Promise<PortalResult>;
  parseWebhookEvent(body: string | Buffer, signature: string): Promise<WebhookEvent>;
  getSubscriptionData(subscriptionId: string): Promise<SubscriptionData>;
  updateSubscriptionSeats(subscriptionId: string, newSeatCount: number): Promise<void>;
  updateSubscriptionPlan(subscriptionId: string, newPriceId: string, prorationMode?: ProrationMode): Promise<void>;
  cancelSubscription(subscriptionId: string, atPeriodEnd: boolean): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
  listTransactions(customerId: string): Promise<TransactionSummary[]>;
  getInvoicePdfUrl(transactionId: string): Promise<string | null>;
  getTransactionCustomerId(transactionId: string): Promise<string | null>;
  resolveBusinessPriceId(billingCycle: "monthly" | "annual"): string;
}
```

Provider implementations: **only `PaddleProvider`** (in `paddle.ts`). The registry [lib/billing/payments/index.ts](../../lib/billing/payments/index.ts) has a single `if (PROVIDER_NAME === "paddle")` branch and `_setPaymentProvider` test-injection seam.

Types that **leak Paddle-shaped vocabulary** (see §9.1 for elaboration):
- `ProrationMode` union — values `"prorated_immediately"`, `"prorated_next_billing_period"`, `"full_immediately"`, `"full_next_billing_period"`, `"do_not_bill"` are Paddle's literal strings. Stripe uses different proration knobs (`proration_behavior: always_invoice | create_prorations | none`).
- `TransactionSummary.status` — `"completed" | "paid" | "failed" | "refunded" | "pending"`. The `"paid"` vs `"completed"` distinction is Paddle's transaction-state language; Stripe's Invoice has `draft/open/paid/uncollectible/void`.
- `CheckoutResult` returns `{ priceId, customData, customerEmail, customerId }` for the client overlay to consume — this matches Paddle.js's `Checkout.open` signature, not Stripe's redirect-to-Checkout-Session pattern.
- `CheckoutResult.customData` — Paddle calls this `custom_data` on the subscription. Stripe's equivalent is `metadata`.

### 2.3 `app/api/billing/webhook/route.ts` — full audit

File: [app/api/billing/webhook/route.ts](../../app/api/billing/webhook/route.ts) (465 lines).

**Signature verification:**
- Reads `paddle-signature` header ([line 44](../../app/api/billing/webhook/route.ts#L44)).
- Reads raw body via `req.text()` ([line 45](../../app/api/billing/webhook/route.ts#L45)).
- DEV-ONLY bypass at [lines 49-53, 69-74](../../app/api/billing/webhook/route.ts#L49-L74): if `NODE_ENV !== "production"` AND `x-echly-webhook-test === CRON_SECRET`, the body is parsed as an already-normalized `WebhookEvent` JSON (skips `parseWebhookEvent`).
- Otherwise: `getPaymentProvider().parseWebhookEvent(rawBody, signature)`.

**Event types handled (switch in POST):**

| Event type (normalized) | Lines | Side effects |
|---|---|---|
| `subscription_started` | [78-79](../../app/api/billing/webhook/route.ts#L78), handler [110-236](../../app/api/billing/webhook/route.ts#L110-L236) | Resolve workspaceId from `customData` then fallback query `billing.customerId`. Idempotency check (already on paid plan + sub id + no comp → skip). Fetches `getSubscriptionData(subscriptionId)`. Writes `billing.plan = "business"`, `billing.customerId`, `billing.subscriptionId`, `billing.seats`, `billing.billingCycle`, `billing.suspended = false`, `billing.manualOverride = false`, `billing.cancelAt = null`, `billing.nextBilledAt = subData.currentPeriodEnd`, `billing.paymentMethod` (only if non-null), `updatedAt`. Logs `subscription_activated` admin action; logs `webhook_cleared_manual_override` if it was a comp. **Sends `sendSubscriptionConfirmationEmail` to the workspace owner.** |
| `subscription_updated` | [81-82](../../app/api/billing/webhook/route.ts#L81), handler [238-311](../../app/api/billing/webhook/route.ts#L238-L311) | Look up workspace by `billing.subscriptionId`. Re-fetches `getSubscriptionData` (convergent — does NOT trust delta in the event). Writes `billing.seats`, `billing.billingCycle`, `billing.nextBilledAt`, `billing.cancelAt` (set when `cancelAtPeriodEnd` is true, else null), `billing.paymentMethod` (if non-null). `billing.suspended = subData.status === "past_due"` UNLESS `manualOverride === true` (then skipped + logged as `webhook_skip_suspend_manual_override`). **No email sent.** |
| `subscription_canceled` | [84-85](../../app/api/billing/webhook/route.ts#L84), handler [313-391](../../app/api/billing/webhook/route.ts#L313-L391) | Look up workspace by `billing.subscriptionId`. If `manualOverride === true` → skip + log `webhook_skip_downgrade_manual_override`. Else: downgrade to starter — writes `billing.plan = "starter"`, `billing.seats = 1`, `billing.subscriptionId = null`, `billing.billingCycle = "monthly"`, `billing.cancelAt = null`, `billing.nextBilledAt = null`, `billing.suspended = false`. Logs `subscription_cancelled` admin action. **Sends `sendSubscriptionCancelledEmail`** but only if the workspace was on a paid plan (idempotency guard against duplicate deliveries). |
| `payment_failed` | [87-88](../../app/api/billing/webhook/route.ts#L87), handler [393-464](../../app/api/billing/webhook/route.ts#L393-L464) | Look up workspace by `billing.subscriptionId`. If `manualOverride === true` → skip + log `webhook_skip_suspend_manual_override`. Else writes `billing.suspended = true`. Idempotency guard: **only sends `sendPaymentFailedEmail` + logs `payment_failed` admin action on the FIRST delivery** (i.e. when `!wasSuspended`). |
| `unknown` (catch-all) | [90-95](../../app/api/billing/webhook/route.ts#L90) | No-op. Logs `[webhook] Unhandled event type (no-op), eventId=…`. Per `paddle.ts` this includes `EventName.TransactionCompleted` (intentionally dropped to avoid double-write with `subscription.activated` / `subscription.updated`). |

Error path: handler returns 500 (not 400) on any thrown error — comment notes "Paddle has no 'stop retrying' status, and a 400 on a rotated/expired secret would silently drop events."

**Paddle-specific payload assumptions** in this file: none directly — the file consumes only the normalized `WebhookEvent` union. All Paddle-shape parsing is isolated in `normalizePaddleEvent` (see §6.3). The only Paddle-specific surface inside the route is the `paddle-signature` header name at line 44.

### 2.4 `app/api/billing/checkout/route.ts`

File: [app/api/billing/checkout/route.ts](../../app/api/billing/checkout/route.ts) (103 lines).

**Inputs:** authenticated POST; body `{ billingCycle?: "monthly" | "annual", seatCount?: number | string }`.

**Auth + invariants:**
- Requires `requireAuth`; resolves workspaceId via `getUserWorkspaceIdRepo(user.uid)`.
- Loads workspace; `assertWorkspaceActive({ allowSuspended: true })`.
- Only owner (`workspace.ownerId === user.uid`) can upgrade.
- Rejects if already on `business` or `enterprise` (400 `INVALID_INPUT` "Already on a paid plan").
- Server enforces seat floor = `max(workspace.usage.members, 1)` (client cannot go below).

**Provider call:** `getPaymentProvider().createCheckoutSession({...})` — the only Paddle interaction is *indirect* via the provider. As noted in §2.1, `createCheckoutSession` makes **no Paddle SDK call** — it returns the data needed for the browser overlay.

**Return shape (to client):**
```ts
{ priceId, customData, customerEmail, customerId, seatCount }
```
This shape is shaped for Paddle.js's `Checkout.open` consumer in `openUpgradeCheckout.ts` — see §9.1.

### 2.5 Codebase-wide Paddle pattern search (excluding node_modules, .next, .git)

Files matching `paddle` (case-insensitive):

**Code (TS/TSX/JS):**
1. [lib/billing/payments/paddle.ts](../../lib/billing/payments/paddle.ts) — the provider implementation.
2. [lib/billing/payments/types.ts](../../lib/billing/payments/types.ts) — Paddle-flavored ProrationMode + customData.
3. [lib/billing/payments/index.ts](../../lib/billing/payments/index.ts) — registry, `if (PROVIDER_NAME === "paddle")`.
4. [lib/billing/openUpgradeCheckout.ts](../../lib/billing/openUpgradeCheckout.ts) — `import type { Paddle } from "@paddle/paddle-js"`; calls `paddle.Checkout.open(...)`.
5. [lib/hooks/usePaddle.ts](../../lib/hooks/usePaddle.ts) — `initializePaddle`, `Paddle`, `PaddleEventData` from `@paddle/paddle-js`.
6. [components/billing/UpgradeModal.tsx](../../components/billing/UpgradeModal.tsx) — `import { CheckoutEventNames } from "@paddle/paddle-js"`; uses `CHECKOUT_COMPLETED/ERROR/PAYMENT_ERROR/FAILED/CLOSED`.
7. [components/billing/PlansAndPricingView.tsx](../../components/billing/PlansAndPricingView.tsx) — comment-only reference ("Checkout itself stays in BillingTab (it owns the Paddle instance…)"). No imports.
8. [components/billing/UpgradeSuccessModal.tsx](../../components/billing/UpgradeSuccessModal.tsx) — comment-only reference ("opens immediately on Paddle's `checkout.completed`").
9. [app/api/billing/webhook/route.ts](../../app/api/billing/webhook/route.ts) — `paddle-signature` header, comments referring to Paddle retries.
10. [app/api/billing/checkout/route.ts](../../app/api/billing/checkout/route.ts) — comment "Paddle.Checkout opens at the right seat quantity".
11. [app/api/admin/workspaces/actions/route.ts](../../app/api/admin/workspaces/actions/route.ts) — error string `"Enterprise plan has no Paddle price..."` ([line 130](../../app/api/admin/workspaces/actions/route.ts#L130)).
12. [app/admin/customers/page.tsx](../../app/admin/customers/page.tsx) — `paddleDashboardUrl(path)` builder for sandbox vs prod vendors host ([lines 17-23](../../app/admin/customers/page.tsx#L17-L23)); used for customer / subscription deep-links rendered in the admin detail drawer.
13. [app/(app)/settings/page.tsx](../../app/(app)/settings/page.tsx) — `import { usePaddle }`, `import { CheckoutEventNames }`; comments ("Paddle instance", "Paddle's `checkout.completed`").
14. [annote-extension/widget/chunks/emoji-picker-react.esm-56O3NH5S.js](../../annote-extension/widget/chunks/emoji-picker-react.esm-56O3NH5S.js) — **false positive.** This is a bundled emoji-picker chunk; "paddle" appears inside the bundled JS as part of an unrelated symbol/string (e.g. emoji name or vendor identifier). Verified by file name + path. **Not Paddle-related.**

**Config / lockfiles:**
- [package.json:19-20](../../package.json#L19-L20)
- [package-lock.json](../../package-lock.json) (4 hits)
- [pnpm-lock.yaml](../../pnpm-lock.yaml) (5 hits)
- [skills-lock.json](../../skills-lock.json) (8 entries — skills metadata, no runtime impact)

**Env + docs:**
- [.env.example](../../.env.example) (8 references on lines 31-56)

**Documentation:**
- [PADDLE_TESTING.md](../../PADDLE_TESTING.md)
- [.agents/skills/paddle-*/SKILL.md](../../.agents/skills/) (9 skill folders — see §8.1)

**Function names containing "paddle":**
- `getPaddle()` ([lib/billing/payments/paddle.ts:25](../../lib/billing/payments/paddle.ts#L25)) — singleton accessor.
- `PaddleProvider` class ([lib/billing/payments/paddle.ts:41](../../lib/billing/payments/paddle.ts#L41)) — the only `PaymentProvider` impl.
- `mapPaddleSubscriptionToDTO` ([lib/billing/payments/paddle.ts:220](../../lib/billing/payments/paddle.ts#L220)) — SDK → DTO normalizer.
- `normalizePaddleEvent` ([lib/billing/payments/paddle.ts:322](../../lib/billing/payments/paddle.ts#L322)) — SDK event → `WebhookEvent`.
- `usePaddle` hook ([lib/hooks/usePaddle.ts:56](../../lib/hooks/usePaddle.ts#L56)) — and its consumers in `UpgradeModal`, `(app)/settings/page.tsx`.
- `paddleDashboardUrl` ([app/admin/customers/page.tsx:17](../../app/admin/customers/page.tsx#L17)).
- `getPaddleSingleton` ([lib/hooks/usePaddle.ts:28](../../lib/hooks/usePaddle.ts#L28)).

### 2.6 API routes touching billing/subscriptions

| Route | Method | Paddle relationship | Reads/writes Firestore billing state? |
|---|---|---|---|
| `/api/billing/checkout` | POST | Indirect (via `getPaymentProvider().createCheckoutSession` — no SDK call) | Reads workspace |
| `/api/billing/portal` | POST | Indirect (via provider; SDK call) | Reads workspace |
| `/api/billing/webhook` | POST | Indirect (`parseWebhookEvent`), but the `paddle-signature` header name leaks at line 44 | **The single canonical writer for `billing.{plan,seats,billingCycle,customerId,subscriptionId,cancelAt,nextBilledAt,suspended,paymentMethod,manualOverride}`** |
| `/api/billing/history` | GET | Indirect (`listTransactions`) | Reads workspace only |
| `/api/billing/invoice/[id]` | GET | Indirect (`getTransactionCustomerId`, `getInvoicePdfUrl`) | Reads workspace only |
| `/api/billing/usage` | GET | None | Reads workspace |
| `/api/workspace` | DELETE | Indirect — calls `cancelSubscription(subId, false)` on delete ([line 52](../../app/api/workspace/route.ts#L52)) | Reads workspace; webhook handles the cancellation write |
| `/api/workspace/members/[uid]` | DELETE | Indirect — `updateSubscriptionSeats(subId, newSeatCount)` ([line 74](../../app/api/workspace/members/[uid]/route.ts#L74)) | Reads + writes `billing.seats` directly (see §2.7 caveat) |
| `/api/workspace/invitations/accept/[token]` | POST | Indirect — `updateSubscriptionSeats(subId, newSeatCount)` ([line 209](../../app/api/workspace/invitations/accept/[token]/route.ts#L209)) | Reads + writes `billing.seats` directly (see §2.7) |
| `/api/admin/workspaces/actions` | POST | Indirect — `updateSubscriptionPlan`, `cancelSubscription`, `resolveBusinessPriceId` | For paid-sub plan changes the route deliberately does NOT write Firestore (webhook is single writer). The `set_manual_override`, `set_plan` on comp, `suspend/resume`, feedback-override actions write Firestore directly. |
| `/api/admin/update-plan` | POST | None directly | Writes `billing.plan` via `updateWorkspacePlanRepo` (admin-only) — does NOT sync to the provider |

### 2.7 `app/api/workspace/invitations/accept/[token]/route.ts` lines 200-219

```ts
// [lines 200-219]
const updatedWorkspace = await getWorkspace(invitation.workspaceId);
const actualMemberCount = updatedWorkspace?.usage?.members ?? 1;

if (
  updatedWorkspace?.billing?.plan === "business" &&
  updatedWorkspace.billing.subscriptionId
) {
  try {
    const newSeatCount = Math.max(actualMemberCount, 1);
    await getPaymentProvider().updateSubscriptionSeats(
      updatedWorkspace.billing.subscriptionId,
      newSeatCount
    );
    await adminDb.doc(`workspaces/${invitation.workspaceId}`).update({
      "billing.seats": newSeatCount,
    });
  } catch (providerErr) {
    console.error("[invite accept] failed to sync subscription seats:", providerErr);
  }
}
```

**Provider call:** `updateSubscriptionSeats(subscriptionId, newSeatCount)` — under the hood does `subscriptions.get` then `subscriptions.update({ items: [{priceId, quantity: newSeatCount}], prorationBillingMode: "prorated_immediately" })`.

**Error handling:** `try/catch` that only `console.error`s — the invitation accept still succeeds even if Paddle fails. **No retry, no compensating action, no admin alert.**

**Race conditions / assumptions:**
- The function reads `updatedWorkspace.usage.members` *after* the atomic increment, but the increment may still be in-flight on a busy doc — though `getWorkspace` is a fresh read so usually safe.
- **Mid-write inconsistency window:** the code calls Paddle first, then writes Firestore `billing.seats`. If Paddle succeeds and Firestore fails (Firestore quotas, network, etc.), Paddle has the new seat count but Firestore still shows the old one. The convergent `subscription.updated` webhook will eventually correct it.
- The reverse-symmetric path is in [app/api/workspace/members/[uid]/route.ts:62-84](../../app/api/workspace/members/[uid]/route.ts#L62-L84) (DELETE member → decrement seats).
- The local `billing.seats` write here **duplicates** what the `subscription.updated` webhook also writes (§2.3). Two writers for the same field — the webhook is convergent, so the last-writer-wins behavior is benign in practice, but violates the "webhook is the single writer" invariant claimed by the admin set_plan route ([app/api/admin/workspaces/actions/route.ts:169-170](../../app/api/admin/workspaces/actions/route.ts#L169-L170): "DON'T write Firestore here — the subscription.updated webhook is the single writer for paid subscriptions"). See §9.3.

---

## Section 3 — Frontend Code Inventory

### 3.1 `lib/billing/openUpgradeCheckout.ts`

File: [lib/billing/openUpgradeCheckout.ts](../../lib/billing/openUpgradeCheckout.ts) (79 lines).

- Imports `Paddle` type-only from `@paddle/paddle-js`.
- Takes a `Paddle` instance (provided by `usePaddle`), `billingCycle`, optional `seatCount`.
- Calls `authFetch("/api/billing/checkout", { method: "POST", body: { billingCycle, seatCount } })`.
- Calls `paddle.Checkout.open({ items: [{ priceId, quantity }], customData, customer: { id } | { email }, settings: { variant: "one-page", successUrl } })`.
- **No callback/redirect handling here** — comment notes that `checkout.completed/closed/error` events are dispatched via the global `eventCallback` wired in `usePaddle`. Each surface subscribes via `usePaddle({ onEvent })`.

### 3.2 Paddle SDK loading + frontend Paddle references (excluding `lib/billing/payments/`)

| File | Paddle reference | Purpose |
|---|---|---|
| [lib/hooks/usePaddle.ts](../../lib/hooks/usePaddle.ts) | `initializePaddle({ environment, token, eventCallback })` from `@paddle/paddle-js` ([lines 3-7, 43-47](../../lib/hooks/usePaddle.ts#L3)) | Module-level singleton Promise; global `eventCallback` fans out to all hook instances. |
| [lib/billing/openUpgradeCheckout.ts](../../lib/billing/openUpgradeCheckout.ts) | `Paddle` type import; `paddle.Checkout.open` | The only `Paddle.Checkout.open` callsite. |
| [components/billing/UpgradeModal.tsx](../../components/billing/UpgradeModal.tsx) | `CheckoutEventNames` enum; calls `usePaddle({ onEvent })`; handles `CHECKOUT_COMPLETED/ERROR/PAYMENT_ERROR/FAILED/CLOSED` ([lines 13, 64-87](../../components/billing/UpgradeModal.tsx#L13)) | Loading-state + error-banner UX |
| [app/(app)/settings/page.tsx](../../app/(app)/settings/page.tsx) | `usePaddle`, `CheckoutEventNames` ([lines 48, 55, 239-249, 3217-3230](../../app/(app)/settings/page.tsx#L48)); `openUpgradeCheckout({ paddle, billingCycle, seatCount })` ([line 3256](../../app/(app)/settings/page.tsx#L3256)) | Two surfaces: `UpgradeCheckoutBridge` (success-modal trigger on `CHECKOUT_COMPLETED`) AND `BillingTab` (button spinner + error banner via `usePaddle`) |
| [components/billing/UpgradeSuccessModal.tsx](../../components/billing/UpgradeSuccessModal.tsx) | Comments only ("opens immediately on Paddle's `checkout.completed`") | No SDK import |

**No `window.Paddle` references anywhere** — everything goes through the typed Paddle.js npm package.

**Paddle JS SDK loaded from:** the `@paddle/paddle-js` npm package's `initializePaddle()`, which under the hood injects Paddle's CDN script. There is **no manual `<script src="https://cdn.paddle.com/...">` tag** in the codebase.

**User-visible "Paddle" strings:** none. The word "Paddle" never appears in user-rendered UI copy — confirmed by reading `PlansAndPricingView`, `UpgradeModal`, `UpgradeSuccessModal`, settings page billing tab, and admin customers page. The one "Paddle" mention in an error string is the admin-only `/api/admin/workspaces/actions` 400 message: *"Enterprise plan has no Paddle price. Use set_manual_override to grant Enterprise access."* — admin-facing only.

### 3.3 Billing/subscription UI components

| Component | Path | Data inputs | Paddle-specific assumptions |
|---|---|---|---|
| `PlansAndPricingView` | [components/billing/PlansAndPricingView.tsx](../../components/billing/PlansAndPricingView.tsx) | `starter, business, enterprise: PlanCatalogItem`, `memberFloor`, `checkoutLoading`, `onUpgrade(cycle, seatCount)` | None — uses workspace plan catalog. |
| `UpgradeModal` | [components/billing/UpgradeModal.tsx](../../components/billing/UpgradeModal.tsx) | `open, onClose, message?, upgradePlan, seatCount?` | Calls `usePaddle({ onEvent })`; consumes `CheckoutEventNames`. Tightly coupled to Paddle.js event vocabulary. |
| `UpgradeSuccessModal` | [components/billing/UpgradeSuccessModal.tsx](../../components/billing/UpgradeSuccessModal.tsx) | `isOpen, onClose, planName?` | Reads `workspace.billing.plan` from realtime store; agnostic to provider. |
| Settings → Billing tab | [app/(app)/settings/page.tsx](../../app/(app)/settings/page.tsx) | Reads workspace doc + `useBillingUsageContext` | Owns the `Paddle` instance + dispatch wiring for both the success bridge and the upgrade button. |
| Admin → Customers | [app/admin/customers/page.tsx](../../app/admin/customers/page.tsx) | `/api/admin/workspaces` | Renders `paddleDashboardUrl(/customers/{id})` and `/subscriptions/{id}` deep links into Paddle's hosted vendor dashboard. |

---

## Section 4 — Data Model (Firestore)

### 4.1 Paddle-flavored fields

Notably: **no Firestore field is literally named `paddleXxx`.** The codebase uses provider-agnostic field names — IDs are stored as-is, but the names don't carry the vendor prefix:

| Field (Firestore path) | Stores | Reads (file:line) | Writes (file:line) |
|---|---|---|---|
| `workspaces/{id}.billing.customerId` | Paddle customer ID (`ctm_...` in production) | [admin/customers/page.tsx](../../app/admin/customers/page.tsx) (link), [api/billing/portal/route.ts:36](../../app/api/billing/portal/route.ts#L36), [api/billing/history/route.ts:40](../../app/api/billing/history/route.ts#L40), [api/billing/invoice/[id]/route.ts:47](../../app/api/billing/invoice/[id]/route.ts#L47), [api/billing/checkout/route.ts:84](../../app/api/billing/checkout/route.ts#L84) (passed to `createCheckoutSession`), webhook fallback lookup ([api/billing/webhook/route.ts:120](../../app/api/billing/webhook/route.ts#L120)) | webhook `subscription_started` ([api/billing/webhook/route.ts:181](../../app/api/billing/webhook/route.ts#L181)) |
| `workspaces/{id}.billing.subscriptionId` | Paddle subscription ID (`sub_...`) | All seat-sync sites (`/api/workspace/route.ts:50`, `members/[uid]/route.ts:70`, `invitations/accept/[token]/route.ts:205`), admin actions cancel/set_plan ([admin/workspaces/actions/route.ts:124,147,321](../../app/api/admin/workspaces/actions/route.ts#L124)), webhook lookups (`subscription_updated/canceled/payment_failed` filter by this field) | webhook `subscription_started` (set), `subscription_canceled` (null), `set_manual_override` admin action (null) |
| `workspaces/{id}.billing.plan` | Plan slug `"starter" \| "business" \| "enterprise"` (provider-agnostic) | many | webhook (all 4 handlers), `set_plan` admin, `set_manual_override`, [api/admin/update-plan/route.ts](../../app/api/admin/update-plan/route.ts) |
| `workspaces/{id}.billing.seats` | Integer seat count | many | webhook, `set_manual_override`, member add/remove (DIRECT WRITE — see §2.7), invitation accept (DIRECT WRITE — see §2.7) |
| `workspaces/{id}.billing.billingCycle` | `"monthly" \| "annual"` | admin set_plan (passes through `resolveBusinessPriceId`), settings UI | webhook `subscription_started` + `subscription_updated` |
| `workspaces/{id}.billing.suspended` | boolean | settings/admin UI | webhook `subscription_updated` (gated by manualOverride), webhook `payment_failed`, admin `suspend/resume`, webhook `subscription_started` (clears) |
| `workspaces/{id}.billing.manualOverride` | boolean | webhook (all branches gate on this), admin set_plan | admin `set_manual_override` / `remove_manual_override`, webhook `subscription_started` (clears on real payment) |
| `workspaces/{id}.billing.cancelAt` | `Timestamp \| null` — scheduled cancel grace-period end | settings UI (banner) | webhook `subscription_started` (null), `subscription_updated` (set/null based on `cancelAtPeriodEnd`), `subscription_canceled` (null) |
| `workspaces/{id}.billing.nextBilledAt` | `Timestamp \| null` — next renewal date | settings UI | webhook `subscription_started` + `subscription_updated`, nulled on cancel |
| `workspaces/{id}.billing.paymentMethod` | `{ brand: string, last4: string, expiryMonth?, expiryYear? } \| null` (Paddle-shaped, see §9.1) | settings UI ("card on file") | webhook `subscription_started` + `subscription_updated`, only when non-null |
| `workspaces/{id}.billing.pricePerSeat` | Optional cached major-unit price | admin set_plan comp path, defaults | `defaultWorkspaceDoc`, admin `set_plan` (comp branch), `set_manual_override` |
| `workspaces/{id}.usage.members` | seat-count floor | seat-sync sites | member repository |

**Fields explicitly named `paddleXxx`: none.**

**Idempotency / event store:** no Firestore collection stores webhook `eventId`s for de-duplication. Idempotency is reconstructed entirely from current workspace state (see §9.3).

### 4.2 Subscription state machine

**`SubscriptionData.status` (DTO, [types.ts:67](../../lib/billing/payments/types.ts#L67)):**
- `"active" | "past_due" | "canceled" | "unpaid"` — **normalized**, provider-agnostic.

**Paddle SDK → DTO mapping ([paddle.ts:226-232](../../lib/billing/payments/paddle.ts#L226-L232)):**
```ts
const statusMap: Record<string, SubscriptionData["status"]> = {
  trialing: "active",
  active: "active",
  past_due: "past_due",
  paused: "past_due", // paused → past_due preserves "suspend" behavior
  canceled: "canceled",
};
// Default fallback for unknown values: "active"
```

**`workspaces/{id}.billing.plan` (Firestore, persisted state) — values:** `"starter" | "business" | "enterprise"` — provider-agnostic plan vocabulary, declared in [lib/domain/workspace.ts:3](../../lib/domain/workspace.ts#L3).

**Status read-sites for feature gating:**
- `billing.suspended` → drives `assertWorkspaceActive`-style guards across the app.
- `billing.plan` → entitlement gating (member limits, AI improvements, etc.) via `getPlanCatalog`.
- `billing.subscriptionId` → presence checks before admin cancel/set_plan.
- `billing.manualOverride` → admin comp gate; webhook handlers skip suspending/downgrading.
- `billing.cancelAt` → settings UI grace-period banner.

The DTO `status` (`"active"/"past_due"/"canceled"/"unpaid"`) is **only used transiently inside the webhook handler** to compute `shouldSuspend = subData.status === "past_due"` — it is not persisted under that name. Stripe subscription statuses (`active/past_due/unpaid/canceled/incomplete/incomplete_expired/trialing/paused`) map cleanly onto the same normalized set, so this layer is reusable.

### 4.3 `billing` object shape stored in Firestore

Reconstructed from [`defaultWorkspaceDoc`](../../lib/domain/workspace.ts#L196-L205), all webhook writes, and admin writes:

```ts
billing: {
  plan: "starter" | "business" | "enterprise",
  billingCycle: "monthly" | "annual",
  seats: number,
  pricePerSeat?: number,           // optional, used by admin comp & defaults
  customerId?: string | null,      // Paddle ctm_..., set by webhook
  subscriptionId?: string | null,  // Paddle sub_..., set/cleared by webhook
  cancelAt?: Timestamp | null,     // scheduled-cancel grace-period end
  nextBilledAt?: Timestamp | null, // next renewal date
  suspended?: boolean,
  manualOverride?: boolean,
  paymentMethod?: {
    brand: string,                 // "visa", "mastercard", "amex", ... (Paddle's `card.type` lowercased)
    last4: string,                 // "4242"
    expiryMonth?: number,
    expiryYear?: number,
  } | null,
}
```

Schema declared in [lib/domain/workspace.ts:66-102](../../lib/domain/workspace.ts#L66-L102).

---

## Section 5 — Email & Notification Touchpoints

### 5.1 Emails triggered by billing events

| Trigger (event / app action) | Send function | Template | Recipient |
|---|---|---|---|
| `subscription_started` (webhook, first-time activation) | `sendSubscriptionConfirmationEmail` ([lib/email/billingEmails.ts:19](../../lib/email/billingEmails.ts#L19)) | `templates/subscriptionConfirmation.ts` | Workspace owner (resolved via `getWorkspaceContext`) |
| `subscription_canceled` (webhook, only if previously on paid plan) | `sendSubscriptionCancelledEmail` | `templates/subscriptionCancelled.ts` | Workspace owner |
| `payment_failed` (webhook, only on first delivery — guarded by `wasSuspended`) | `sendPaymentFailedEmail` | `templates/paymentFailed.ts` | Workspace owner |
| Plan-limit approaching (app event, not billing-direct) | `sendPlanLimit*` via `lib/email/planLimitDispatch.server.ts` | `planLimitApproaching` / `planLimitHit` | — |

**No emails are sent on:**
- `subscription_updated` (seat changes, billing-cycle changes, card swaps, mid-cycle plan changes, scheduled-cancel toggles)
- Successful renewal payments (which arrive as `TransactionCompleted` → mapped to `unknown` and no-op'd)
- Subscription resumption (provider call exists, no event handler / email)

All three billing email functions live in [lib/email/billingEmails.ts](../../lib/email/billingEmails.ts) and are called **only from the webhook handler** ([app/api/billing/webhook/route.ts](../../app/api/billing/webhook/route.ts)) — verified by grep.

### 5.2 Provider-sent emails to replicate after migration

Paddle (currently) sends these on its own — Stripe will send some equivalents but not all, so anything you rely on must be replicated explicitly:

- **Receipts on successful payment** — Paddle emails the customer a receipt after each successful transaction (initial purchase + renewals). Stripe sends a receipt only when `receipt_email` / `receipt_url` is wired up on the PaymentIntent or Customer.
- **Renewal / upcoming-renewal reminders** — Paddle's default behavior. No equivalent in this codebase. Stripe has no built-in renewal-reminder email; if you want one, send your own via `invoice.upcoming` webhook.
- **Card expiring** — Paddle sends. Stripe sends in some configurations (via Customer Portal), but if you've disabled the portal email, you need `customer.source.expiring` → custom email.
- **Payment-method update prompts** (post-failure) — Paddle handles. Stripe has the Customer Portal flow but not a proactive email.
- **Invoice PDFs** — Paddle's invoice PDFs are fetched on-demand via `getInvoicePdfUrl`. Stripe equivalents are `invoice.hosted_invoice_url` / `invoice.invoice_pdf` (different access pattern; the `/api/billing/invoice/[id]` route will need updating).
- **Subscription paused / resumed notifications** — Paddle sends. The codebase has `resumeSubscription` but no related email.

---

## Section 6 — Webhook Endpoint Inventory

### 6.1 Webhook URL

`POST /api/billing/webhook` — single endpoint, defined in [app/api/billing/webhook/route.ts](../../app/api/billing/webhook/route.ts).

`runtime = "nodejs"`, `dynamic = "force-dynamic"`.

### 6.2 Signature verification

- Header read: `req.headers.get("paddle-signature")` ([line 44](../../app/api/billing/webhook/route.ts#L44)).
- Secret read: `process.env.PADDLE_WEBHOOK_SECRET` ([paddle.ts:91-99](../../lib/billing/payments/paddle.ts#L91-L99)).
- Verification mechanism: `paddle.webhooks.unmarshal(rawBody, secret, signature)` — Paddle SDK does HMAC verification, expiry check, and JSON parsing in one call. Throws on bad sig / expired / malformed.
- Dev-only bypass: `NODE_ENV !== "production"` AND `x-echly-webhook-test` header equals `CRON_SECRET` — body is parsed as a pre-normalized `WebhookEvent` fixture.

### 6.3 Event types branched on

In [`normalizePaddleEvent`](../../lib/billing/payments/paddle.ts#L322-L389), the `switch` covers exactly:

| Paddle SDK `EventName` enum | Normalized `WebhookEvent.type` | Handled? |
|---|---|---|
| `EventName.SubscriptionActivated` | `"subscription_started"` | ✅ |
| `EventName.SubscriptionUpdated` | `"subscription_updated"` | ✅ |
| `EventName.SubscriptionCanceled` | `"subscription_canceled"` | ✅ |
| `EventName.TransactionPaymentFailed` | `"payment_failed"` | ✅ |
| `EventName.TransactionCompleted` | `"unknown"` | ❌ Deliberately no-op'd (comment in `paddle.ts:377-380`: avoids double-write with `subscription.activated/updated`) |
| All others | `"unknown"` | ❌ No-op + console log |

**Notably absent / unhandled** (Paddle emits these but the code does not branch on them):
- `subscription.created` (we use the later `subscription.activated`)
- `subscription.paused` / `subscription.resumed` (Paddle treats paused → past_due via the status field; resume has a provider method but no inbound event handler)
- `subscription.trialing`
- `customer.created` / `customer.updated`
- `transaction.created` / `transaction.ready` / `transaction.billed` / `transaction.past_due`
- `adjustment.created` / `adjustment.updated` (refunds, credit notes)
- `payout.*`, `payment_method.*`

### 6.4 Idempotency strategy

**No Firestore collection stores webhook `eventId`s.** The `WebhookEvent.eventId` field is propagated but is only used in the catch-all `unknown` log message. There is no `seenEvents` / `webhookEventIds` collection that the handler checks before processing.

Duplicate-delivery protection is reconstructed from current state inside each handler:

- `subscription_started`: skips if already on paid plan AND `subscriptionId` is set AND `!manualOverride` ([webhook/route.ts:160-172](../../app/api/billing/webhook/route.ts#L160-L172)).
- `subscription_updated`: convergent — re-fetches state from Paddle and re-writes. Multiple deliveries of the same event produce the same final write.
- `subscription_canceled`: only sends the cancellation email if `wasOnPaidPlan` ([webhook/route.ts:352-353, 382-390](../../app/api/billing/webhook/route.ts#L352)). Firestore write is idempotent (setting `plan = "starter"` etc. on an already-starter doc is a no-op effective state).
- `payment_failed`: only sends email + logs admin action if `!wasSuspended` ([webhook/route.ts:439-463](../../app/api/billing/webhook/route.ts#L439-L463)). Firestore write of `suspended: true` is idempotent.

**Migration implication:** Stripe's webhook redelivery semantics are nearly identical (retries on non-2xx, `Stripe-Signature` header, same event-id model), so the existing state-based idempotency carries over — but adding a `webhookEvents/{eventId}` Firestore doc is **strongly recommended** before swap to defend against the (rare) cases where Stripe redelivers across state transitions, e.g. an `invoice.payment_failed` followed by a redelivery after `subscription.updated` has flipped `suspended` back to false.

---

## Section 7 — Tests & Scripts

### 7.1 Test files referencing Paddle

**None.** Grep for `paddle` (case-insensitive) across `**/*.test.ts` and `**/*.spec.ts` yields zero matches. The codebase has no automated tests for the billing layer — only the manual test runbook in [PADDLE_TESTING.md](../../PADDLE_TESTING.md).

### 7.2 Scripts referencing Paddle

The only script directory is `scripts/`, which contains a single file:

- [scripts/backfillUserProfiles.ts](../../scripts/backfillUserProfiles.ts) — no Paddle reference.

No `tools/` directory exists.

### 7.3 Seed/fixture data with Paddle IDs

**None.** No `fixtures/`, `__fixtures__/`, or `mocks/` folder exists, and no JSON file in the repo (excluding lockfiles + skills metadata) carries Paddle IDs.

---

## Section 8 — Documentation & Comments

### 8.1 Paddle references in `.md` files

| File | Notes |
|---|---|
| [PADDLE_TESTING.md](../../PADDLE_TESTING.md) | Project-level test runbook: sandbox env vars, cloudflared tunnel setup, T1-T14 test table, sandbox test cards (`4242 4242 4242 4242` etc.), webhook simulation, troubleshooting. Migration-critical: this whole file needs Stripe-equivalent rewrite. |
| `.agents/skills/paddle-webhooks/SKILL.md` | Reference skill: webhook handler pattern, `paddle-signature` header, signature verification via `webhooks.unmarshal`. Includes a different env var name `PADDLE_NOTIFICATION_WEBHOOK_SECRET` and `NEXT_PUBLIC_PADDLE_ENV` (note: project code uses `_PADDLE_WEBHOOK_SECRET` and `_PADDLE_ENVIRONMENT` — see §1.1 — so the skill docs and runtime env names **diverge**). |
| `.agents/skills/paddle-subscription-sync/SKILL.md` | Reference: subscription event sync patterns. |
| `.agents/skills/paddle-subscription-update/SKILL.md` | Reference: seat / plan update patterns. |
| `.agents/skills/paddle-subscription-cancel/SKILL.md` | Reference: cancel patterns. |
| `.agents/skills/paddle-customer-portal/SKILL.md` | Reference: portal session pattern. |
| `.agents/skills/paddle-sandbox-testing/SKILL.md` | Reference: sandbox testing patterns. |
| `.agents/skills/paddle-catalog-setup/SKILL.md` | Reference: product / price catalog seed. |
| `.agents/skills/paddle-checkout-web/SKILL.md` | Reference: client overlay setup. |
| `.agents/skills/paddle-billing-history/SKILL.md` | Reference: transactions listing pattern. |
| `skills-lock.json` | Metadata pointer for the 8 skills (no runtime impact). |
| `README.md` | **No Paddle references.** Verified via grep. |
| `docs/counts-architecture-final-lock.md` | **No Paddle references.** |

### 8.2 Paddle-specific code comments worth noting

| File:line | Comment | Why it matters for migration |
|---|---|---|
| [paddle.ts:74-76](../../lib/billing/payments/paddle.ts#L74) | `// subscriptionIds is positional and required; an empty array is valid. // returnUrl from PortalParams is accepted-but-unused — Paddle manages its // own return flow.` | Stripe portal sessions accept a `return_url` and use it. The `returnUrl` param in `PortalParams` is currently dead — Stripe will resurrect it. |
| [paddle.ts:111-114](../../lib/billing/payments/paddle.ts#L111-L114) | `// The subscription entity doesn't carry card metadata. Derive it from the // customer's most recent paid transaction (one extra read, no webhook).` | Stripe puts `default_payment_method` directly on the Subscription, so this scan disappears. |
| [paddle.ts:167](../../lib/billing/payments/paddle.ts#L167) | `// items[] is a FULL REPLACE, not a patch — fetch the existing price first.` | Stripe's subscription items API behaves differently — you patch individual `SubscriptionItem` rows. The `subscriptions.get → update` round-trip can be dropped. |
| [paddle.ts:224-232](../../lib/billing/payments/paddle.ts#L224-L232) | The status map (paused → past_due preserving "suspend" behavior). | Stripe's paused subscriptions behave differently (`pause_collection`); will need re-evaluation. |
| [paddle.ts:292](../../lib/billing/payments/paddle.ts#L292) | `// Paddle returns minor units as a string (e.g. "1900" for $19.00).` | Stripe also returns minor units, but as `number`. The `formatMoney` helper will need a type tweak. |
| [paddle.ts:377-380](../../lib/billing/payments/paddle.ts#L377-L380) | `// transaction.completed is deliberately NOT acted on: first payment is covered by subscription.activated, renewals are covered by subscription.updated. Acting here would double-write.` | Stripe's equivalent dual-event situation: `invoice.paid` vs `customer.subscription.updated` — the same caution applies. |
| [webhook/route.ts:100-104](../../app/api/billing/webhook/route.ts#L100-L104) | `// 500 — Paddle will retry. NOT 400: Paddle has no "stop retrying" status, and a 400 on a rotated/expired secret would silently drop events.` | Stripe also retries on non-2xx but caps after ~3 days. Same logic applies. |
| [admin/workspaces/actions/route.ts:130](../../app/api/admin/workspaces/actions/route.ts#L130) | Error string: `"Enterprise plan has no Paddle price. Use set_manual_override…"` | The word "Paddle" leaks into an admin-facing error message — search and update. |
| [admin/workspaces/actions/route.ts:169-170, 344](../../app/api/admin/workspaces/actions/route.ts#L169) | `// DON'T write Firestore here — the subscription.updated webhook is the single writer for paid subscriptions.` | This invariant must be preserved across providers — Stripe's webhook redelivery semantics make this just as important. |
| [openUpgradeCheckout.ts:27-32](../../lib/billing/openUpgradeCheckout.ts#L27-L32) | `Event handling (checkout.completed / closed / error) is NOT done here — Paddle.js dispatches events through the global eventCallback wired in usePaddle.` | Stripe Checkout uses a hosted page + redirect, not an overlay with event callbacks. **This entire pattern changes shape.** |
| [PADDLE_TESTING.md:32](../../PADDLE_TESTING.md#L32) | `Note the client-side var is NEXT_PUBLIC_PADDLE_ENVIRONMENT (project standard), not NEXT_PUBLIC_PADDLE_ENV.` | The skill docs disagree with the runtime env names — see §8.1. |

---

## Section 9 — Risk Flags

### 9.1 Paddle-specific types/shapes leaked beyond `paddle.ts`

The abstraction is mostly clean — but several Paddle vocabulary items have escaped into shared types and other layers:

1. **`ProrationMode` union** ([types.ts:79-84](../../lib/billing/payments/types.ts#L79-L84)) uses Paddle's exact literal strings (`prorated_immediately`, `do_not_bill`, etc.). Stripe's vocabulary is `proration_behavior: "always_invoice" | "create_prorations" | "none"`. The 5-value Paddle union does not map 1:1 onto the 3-value Stripe enum. The `set_plan` admin route ([admin/workspaces/actions/route.ts:157](../../app/api/admin/workspaces/actions/route.ts#L157)) hard-codes `"prorated_immediately"`.
2. **`CheckoutResult` shape** ([types.ts:13-18](../../lib/billing/payments/types.ts#L13-L18)) returns `{ priceId, customData, customerEmail, customerId }` — designed for Paddle.js's client-side `Checkout.open` overlay. Stripe Checkout uses a server-side `checkout.sessions.create` that returns a redirect `url`. The whole client-server contract for checkout will need re-shaping.
3. **`CheckoutResult.customData`** — Paddle calls it `custom_data`; Stripe calls it `metadata`. The name is leaked through `openUpgradeCheckout.ts` → `paddle.Checkout.open({ customData })`.
4. **`TransactionSummary.status`** ([types.ts:91](../../lib/billing/payments/types.ts#L91)) — `"completed" | "paid" | "failed" | "refunded" | "pending"`. The two-way `completed`/`paid` distinction is Paddle's; consumers in `app/(app)/settings/page.tsx` (the billing history view) will need re-evaluation if Stripe Invoice statuses are mapped differently.
5. **`SubscriptionData.paymentMethod`** ([types.ts:72-77](../../lib/billing/payments/types.ts#L72-L77) + workspace doc [workspace.ts:96-101](../../lib/domain/workspace.ts#L96-L101)) — uses `{ brand, last4, expiryMonth?, expiryYear? }`. The `brand` field is populated from Paddle's `card.type` lowercased (`paddle.ts:273`), which uses brand names like `"visa"`. Stripe's PaymentMethod.card.brand uses the same vocabulary (`visa, mastercard, amex, …`) so this is portable — but only by luck of overlapping vocabularies.
6. **Admin-facing string** ([admin/workspaces/actions/route.ts:130](../../app/api/admin/workspaces/actions/route.ts#L130)) — "Enterprise plan has no Paddle price." — admin sees the vendor name.
7. **`paddle-signature` header name** ([webhook/route.ts:44, 58](../../app/api/billing/webhook/route.ts#L44)) hard-coded inside the API route (not the provider). The provider's `parseWebhookEvent` takes signature as a string, but the route is the one reading the *header name*. Stripe uses `stripe-signature` — this constant moves into provider config.

### 9.2 Direct Paddle SDK bypasses

I searched for direct Paddle SDK imports outside `lib/billing/payments/paddle.ts`. The only external imports of `@paddle/paddle-node-sdk` are inside `paddle.ts` itself. The client-side `@paddle/paddle-js` is imported in three places — but **all three are unavoidable for the overlay UX**, not bypasses of the abstraction:

- `lib/hooks/usePaddle.ts` (loads the SDK)
- `lib/billing/openUpgradeCheckout.ts` (consumes the `Paddle` instance)
- `components/billing/UpgradeModal.tsx` + `app/(app)/settings/page.tsx` (consume `CheckoutEventNames` enum)

**Verdict: no backend bypass; the client-side coupling is structural to Paddle.js's overlay UX and not a true bypass — but it is a port-cost (Stripe Checkout uses a hosted redirect, not an embedded SDK).**

### 9.3 Mixed payload-parsing and business-logic concerns

The webhook handler ([app/api/billing/webhook/route.ts](../../app/api/billing/webhook/route.ts)) is structured correctly — `parseWebhookEvent` returns a normalized `WebhookEvent` and the handler only reads from that DTO. **However**, two issues:

- **The Paddle-specific header name** (`paddle-signature`) is read inside the route, not inside the provider. The provider should own the header-name choice as well as the signature-verification algorithm. This is a small refactor.
- **Two writers exist for `billing.seats`:** the webhook handler ([webhook/route.ts:184](../../app/api/billing/webhook/route.ts#L184), [271](../../app/api/billing/webhook/route.ts#L271)) AND the member add/remove + invitation-accept routes ([invitations/accept/[token]/route.ts:213](../../app/api/workspace/invitations/accept/[token]/route.ts#L213), [members/[uid]/route.ts:78](../../app/api/workspace/members/[uid]/route.ts#L78)). The admin set_plan route comment explicitly says "the webhook is the single writer for paid subscriptions" — that invariant is **violated** by the seat-sync sites, which write `billing.seats` directly after their provider call. The convergent webhook eventually self-heals, but the inconsistency window is real and any migration plan should decide whether to (a) consolidate writes into the webhook, or (b) document the dual-write pattern.
- **No `eventId` deduplication store.** Each handler reconstructs idempotency from current state. This works because every state transition is monotonic in practice (a `subscription_canceled` after a `subscription_started` *should* downgrade), but it could fail under specific redelivery interleavings. Recommend an `webhookEvents/{eventId}` collection with a 30-day TTL.

### 9.4 Magic strings

Paddle-vocabulary strings hard-coded across the codebase:

- **`"paddle"`** — appears in `process.env.PAYMENT_PROVIDER ?? "paddle"` ([index.ts:6](../../lib/billing/payments/index.ts#L6)) and the `if (PROVIDER_NAME === "paddle")` arm.
- **`"prorated_immediately"`** — hard-coded twice: [admin/workspaces/actions/route.ts:157](../../app/api/admin/workspaces/actions/route.ts#L157), and inside `paddle.ts` (`updateSubscriptionSeats`).
- **`"next_billing_period" / "immediately"`** — used both as Paddle SDK arguments and as the API contract for the admin cancel UI ([admin/workspaces/actions/route.ts:302](../../app/api/admin/workspaces/actions/route.ts#L302), [admin/customers/page.tsx:44-46](../../app/admin/customers/page.tsx#L44-L46), [paddle.ts:200](../../lib/billing/payments/paddle.ts#L200)). The string passes from UI → API → provider unchanged. Stripe uses `cancel_at_period_end: boolean` — the boolean already exists in the `PaymentProvider.cancelSubscription(subId, atPeriodEnd: boolean)` contract, but the UI/API layer keeps using the Paddle string.
- **`"paddle-signature"`** — hard-coded webhook header name ([webhook/route.ts:44, 58](../../app/api/billing/webhook/route.ts#L44)).
- **`paddle-signature` error message** — `"Missing paddle-signature header"` ([webhook/route.ts:58](../../app/api/billing/webhook/route.ts#L58)).
- **`paddleDashboardUrl()` host strings** — `"https://vendors.paddle.com"` / `"https://sandbox-vendors.paddle.com"` ([admin/customers/page.tsx:20-21](../../app/admin/customers/page.tsx#L20-L21)).
- **Status mapping table** — Paddle status strings as keys in `mapPaddleSubscriptionToDTO` ([paddle.ts:226-232](../../lib/billing/payments/paddle.ts#L226-L232)) and `mapTransactionStatus` ([paddle.ts:301-320](../../lib/billing/payments/paddle.ts#L301-L320)). Both are inside `paddle.ts` — clean.

### 9.5 Paddle concepts without clean Stripe equivalents

| Paddle concept | Stripe equivalent | Notes |
|---|---|---|
| **Single Transaction object** carrying both the charge and the invoice — `transactions.list`, `transactions.getInvoicePDF`, `transactions.get`. | Split: `Invoice` (the line items + PDF + hosted URL) + `PaymentIntent` (the actual charge attempt). Listing "billing history" requires `invoices.list` (or `charges.list`); the PDF URL is on Invoice (`invoice_pdf` / `hosted_invoice_url`). | `listTransactions` and `getInvoicePdfUrl` need restructuring. `getTransactionCustomerId` also changes target. |
| **`customer.customData` on subscription** — Paddle stores `{ workspaceId }` on the subscription itself; the webhook reads it directly. | Stripe's `metadata` on the Subscription (or Checkout Session). The `subscription_started` handler's primary `workspaceId` resolution path moves to `event.data.metadata.workspaceId`. | The fallback (query by `billing.customerId`) still works. |
| **`subscriptionItems[]` is FULL REPLACE on update** ([paddle.ts:167](../../lib/billing/payments/paddle.ts#L167)) — must fetch existing items first. | Stripe's `subscriptions.update({ items: [{id, quantity}] })` is a partial update keyed by SubscriptionItem.id. | `updateSubscriptionSeats` can drop the `subscriptions.get` round-trip. |
| **`scheduledChange.action === "cancel"`** ([paddle.ts:247](../../lib/billing/payments/paddle.ts#L247)) — Paddle exposes scheduled changes as a separate object on the subscription. | Stripe uses `cancel_at_period_end: boolean` (plus `cancel_at` for date-scheduled). Different shape but equivalent semantics. | `mapPaddleSubscriptionToDTO` already normalizes this to `cancelAtPeriodEnd: boolean` — migration is a 1-line change inside the provider. |
| **Customer Portal session URL is the only `urls.general.overview`** ([paddle.ts:82](../../lib/billing/payments/paddle.ts#L82)). | Stripe's Customer Portal session returns `url` directly. | Trivial. |
| **Paused subscriptions** — Paddle has a first-class "paused" status. Currently mapped to `past_due` for "suspend" behavior. | Stripe uses `pause_collection` (different semantics — pauses *invoicing*, not access). | Worth a product decision: does the new "suspended" state need a Stripe-equivalent provider call? Currently `suspended` is admin-driven only. |
| **`subscriptions.resume`** ([paddle.ts:204-217](../../lib/billing/payments/paddle.ts#L204-L217)) — separate API plus an "un-schedule cancel" branch via `scheduledChange: null`. | Stripe: un-schedule a cancel via `subscriptions.update({ cancel_at_period_end: false })`. There is no separate "resume" verb for non-paused subs. | Simplifies. |
| **Paddle's overlay checkout UX** — `Paddle.Checkout.open({ items, customData, customer, settings })` with event callbacks (`checkout.completed`, `error`, `closed`). | Stripe Checkout = redirect to a hosted page; the server creates a Checkout Session and returns a `url`. Events arrive only via webhook. | **The entire upgrade-button → bridge-modal UX is rebuilt.** `usePaddle`, `openUpgradeCheckout`, `UpgradeModal`'s event subscription, `UpgradeCheckoutBridge`, and the `?upgraded=true` query-string success bridge in `settings?tab=billing` all need restructuring. This is by far the biggest UI work item. |

---

## Section 10 — Summary Table

| Layer | # of Paddle touchpoints | Files affected | Migration complexity (1-5) |
|---|---|---|---|
| Backend lib (`lib/billing/payments/`) | 3 files; ~400 LOC of provider code; 1 type union + 1 DTO shape leaking Paddle vocabulary | `paddle.ts`, `types.ts`, `index.ts` | **4** — rewrite `paddle.ts` as `stripe.ts`; rework `ProrationMode` + `CheckoutResult` to be provider-neutral or Stripe-shaped; update registry. |
| API routes | 10 routes consume the provider (1 webhook, 5 user-facing billing routes, 4 workspace/admin sites); 1 leaked `paddle-signature` header; 1 leaked "Paddle" error string | `app/api/billing/{webhook,checkout,portal,history,invoice/[id],usage}/route.ts`, `app/api/workspace/{route.ts, members/[uid]/route.ts, invitations/accept/[token]/route.ts}`, `app/api/admin/workspaces/actions/route.ts`, `app/api/admin/update-plan/route.ts` | **3** — most are clean (consume `PaymentProvider`); the webhook needs header-name update, idempotency strategy decision, and the `subscription_started` `customData → metadata` resolution change. Invitation-accept and member-removal contain the "dual writer" issue (§9.3). |
| Frontend | 5 files; client-side overlay UX deeply tied to Paddle.js | `lib/hooks/usePaddle.ts`, `lib/billing/openUpgradeCheckout.ts`, `components/billing/{UpgradeModal,UpgradeSuccessModal,PlansAndPricingView}.tsx`, `app/(app)/settings/page.tsx`, `app/admin/customers/page.tsx` | **5** — the overlay vs hosted-redirect model change is the largest single migration cost. `UpgradeCheckoutBridge` + `UpgradeSuccessModal` (the post-checkout bridge UX) all need re-think. |
| Firestore fields | 11 billing.* fields, all provider-agnostic names; values store Paddle IDs (`ctm_…`, `sub_…`) opaquely | `lib/domain/workspace.ts`, all webhook + admin writers, all consumer reads | **2** — no field renames needed; only the *values* change format (`ctm_…` → `cus_…`, `sub_…` → `sub_…` — Stripe coincidentally uses `sub_` too). A backfill is needed only if you keep existing customers; if you re-sign-up via Stripe Checkout from scratch, no backfill. **Decision needed (see Unknowns).** |
| Email/notifications | 3 templates triggered from webhook; 6 provider-sent email categories to replicate | `lib/email/{billingEmails.ts, templates/subscriptionConfirmation.ts, subscriptionCancelled.ts, paymentFailed.ts}`, `app/api/billing/webhook/route.ts` | **2** — the trigger code stays identical; you need to add (or decide not to add) replacements for the receipts + renewal-reminder emails Paddle sent on your behalf. |
| Config/env | 7 Paddle env vars; 2 npm packages; 0 `vercel.json` references | `.env.example`, `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `skills-lock.json` | **1** — rename env vars + swap packages. Mechanical. |
| Tests/scripts | 0 automated tests; 1 manual runbook | `PADDLE_TESTING.md` (whole-file rewrite) | **2** — manual runbook is the main artifact; no automated tests to update. |
| Docs | 1 project-level runbook + 9 `.agents/skills/` reference folders | `PADDLE_TESTING.md` + 9 `SKILL.md` files | **1** — delete or replace skill folders; rewrite testing runbook. No customer-facing docs. |

---

## Biggest Unknowns (architect decisions)

1. **Cutover model — backfill or re-sign-up?** Do we migrate existing paid customers' Paddle subscriptions to Stripe (requires Paddle → Stripe customer mapping, billing.customerId / .subscriptionId backfill, and a portal-driven payment-method re-collection), or do we run both providers in parallel via `PAYMENT_PROVIDER` and force new sign-ups onto Stripe while letting existing subs renew under Paddle until they churn? The data-model is provider-agnostic in field *names* but holds opaque Paddle ID values today. A clean answer determines whether `index.ts` needs to genuinely support runtime multi-provider, or whether it stays a single-provider registry that just flips at deploy time.

2. **Checkout UX — overlay → redirect.** Paddle's overlay (`Paddle.Checkout.open`) is currently called from inside `UpgradeModal` *while the modal is still open*, and the `UpgradeCheckoutBridge` listens for `checkout.completed` to show the spinner-then-success modal. Stripe Checkout is a redirect to a hosted page. The decision: do we use Stripe Checkout (redirect, simpler) and lose the bridge-modal UX, or use Stripe Elements (embedded card form, keeps the modal experience but requires building a payment form ourselves)? This dictates how much of `UpgradeModal` / `UpgradeSuccessModal` / `usePaddle` / `openUpgradeCheckout` survives.

3. **Idempotency store — add now or punt?** The current handler reconstructs idempotency from current state and has no `webhookEvents/{eventId}` collection. Stripe redelivers more aggressively in some failure modes (e.g. across consumer 5xx retries that span minutes). Decide whether to add `webhookEvents/{eventId}` with a 30-day TTL *before* swap (safer) or punt to a post-launch hardening pass (faster).

4. **Renewal / receipt emails — replicate or rely on Stripe?** Paddle currently sends receipts, upcoming-renewal reminders, and card-expiring notices on our behalf. Stripe's defaults are different: receipts via `receipt_email`, no built-in renewal reminders. Does the architect want to (a) enable Stripe's defaults and accept the smaller email footprint, or (b) replicate all of Paddle's emails ourselves via the existing `lib/email/billingEmails.ts` plumbing? This decision adds 0-5 new email templates.

5. **`ProrationMode` vocabulary — collapse or preserve?** `types.ts` declares a 5-value union (`prorated_immediately`, `prorated_next_billing_period`, `full_immediately`, `full_next_billing_period`, `do_not_bill`) but only `prorated_immediately` is actually used anywhere in the codebase (admin set_plan + the internal `updateSubscriptionSeats`). Stripe has a 3-value `proration_behavior` (`always_invoice`, `create_prorations`, `none`). Architect needs to decide: (a) collapse the union to the 3 Stripe values and map at the call sites, (b) keep the Paddle vocabulary and translate inside `StripeProvider`, or (c) shrink the union to just the single value we actually use. Option (c) is cheapest and matches the current behavior.

---

End of report.
