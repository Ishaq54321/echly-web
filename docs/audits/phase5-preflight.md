# Phase 5 Pre-Flight Audit — Paddle Deletion

**Date:** 2026-05-20
**Scope:** Read-only inventory of every remaining Paddle touchpoint in the repo. Phase 4 should have left only intentional residue (paddle.ts, package.json dependencies, env vars, skills folders, comments). This audit confirms no new Paddle dependencies snuck in via Phase 4 and produces an exhaustive deletion checklist for Phase 5.

---

## Section 1 — Every Remaining Paddle Reference

### 1.1 Repo-wide grep (excluding `node_modules`, `.next`, `.git`, generated bundles)

Pattern: `paddle|Paddle|PADDLE_|@paddle/`

Total: **28 files** contain at least one match. One match in `annote-extension/widget/chunks/emoji-picker-react.esm-QDJYYLTX.js` is a generated bundle and a false-positive substring (not a real Paddle reference); ignored.

### 1.2 Matches grouped by category

**Code files (`.ts`, `.tsx`)**
| File | What it references |
|---|---|
| [lib/billing/payments/paddle.ts](lib/billing/payments/paddle.ts) | Full Paddle provider implementation — Paddle SDK, env vars, normalization helpers. |
| [lib/billing/payments/index.ts](lib/billing/payments/index.ts) | Imports `PaddleProvider`, treats `paddle` as the default `PROVIDER_NAME`, instantiates `PaddleProvider` when `PAYMENT_PROVIDER === "paddle"`. |
| [lib/billing/payments/types.ts](lib/billing/payments/types.ts) | Two doc-comments referencing `paddle-signature` / `"paddle"` provider name as examples. |
| [lib/billing/payments/stripe.ts](lib/billing/payments/stripe.ts) | Two comparison comments referencing Paddle ("item-level updates (not full-replace like Paddle)", "Equivalent to Paddle's prorated_immediately"). |
| [app/api/billing/webhook/route.ts](app/api/billing/webhook/route.ts) | One comment: "Stripe and Paddle both retry on non-2xx". |
| [app/(app)/settings/page.tsx](app/%28app%29/settings/page.tsx) | Stale doc-comment block on `UpgradeCheckoutBridge` referencing Paddle's `checkout.completed` and `usePaddle` fan-out. |
| [components/billing/PlansAndPricingView.tsx](components/billing/PlansAndPricingView.tsx) | Stale comment: "Checkout itself stays in BillingTab (it owns the Paddle instance + event wiring)". |
| [components/billing/UpgradeSuccessModal.tsx](components/billing/UpgradeSuccessModal.tsx) | Stale comment: "Post-checkout bridge state. Opens immediately on Paddle's `checkout.completed`...". |

**Config files**
| File | What it declares |
|---|---|
| [package.json](package.json) | `@paddle/paddle-js@^1.6.4` and `@paddle/paddle-node-sdk@^3.8.0` in `dependencies`. No scripts mention paddle. |
| [.env.example](.env.example) | Lines 31–56 — eight commented-out PADDLE_* / NEXT_PUBLIC_PADDLE_* env vars plus the "default: paddle" provider switch note. |
| [skills-lock.json](skills-lock.json) | 9 paddle-* skill entries (lines 4–47). |

**Doc files** (`.md`)
| File | Notes |
|---|---|
| [PADDLE_TESTING.md](PADDLE_TESTING.md) | Full sandbox runbook — replaced by Stripe-equivalent. |
| [docs/audits/paddle-migration-audit.md](docs/audits/paddle-migration-audit.md) | Original migration plan. Historical — likely keep. |
| [docs/audits/phase1-preflight.md](docs/audits/phase1-preflight.md) | Historical audit. |
| [docs/audits/phase3-preflight.md](docs/audits/phase3-preflight.md) | Historical audit. |
| [docs/audits/phase4-preflight.md](docs/audits/phase4-preflight.md) | Historical audit. |
| [docs/migration/stripe/phase1-post-deploy-checklist.md](docs/migration/stripe/phase1-post-deploy-checklist.md) | Mentions Paddle by name — but as the *outgoing* provider in checklist context. Likely keep. |

**Skill folders** ([.agents/skills/](/.agents/skills/) — 1 file each, all `SKILL.md`)
- `paddle-billing-history/`
- `paddle-catalog-setup/`
- `paddle-checkout-web/`
- `paddle-customer-portal/`
- `paddle-sandbox-testing/`
- `paddle-subscription-cancel/`
- `paddle-subscription-sync/`
- `paddle-subscription-update/`
- `paddle-webhooks/`

**Lockfiles**
- [pnpm-lock.yaml](pnpm-lock.yaml): 6 mentions of `@paddle/*` (lines 14, 17, 1196, 1199, 4953, 4955) — auto-cleaned by `pnpm remove @paddle/paddle-js @paddle/paddle-node-sdk`.
- No `package-lock.json` present (deleted in working tree per git status).

### 1.3 Code-file match classification

| File:Line | Category | Notes |
|---|---|---|
| [lib/billing/payments/paddle.ts](lib/billing/payments/paddle.ts):* | **Active code** | Whole file is the provider impl — dead now (PAYMENT_PROVIDER=stripe in prod) but still wired into the registry's `paddle` branch. |
| [lib/billing/payments/index.ts](lib/billing/payments/index.ts):2,6,11,13–15,19,29 | **Active code** | Default fallback (`?? "paddle"`), registry branch, eager import of `PaddleProvider` at module load. |
| [lib/billing/payments/types.ts](lib/billing/payments/types.ts):95,97 | **Stale comment** | Doc-comment examples in `PaymentProvider` interface mention "paddle-signature" / "paddle" as one of two valid examples. Not wrong, just no longer needed once Paddle is gone. |
| [lib/billing/payments/stripe.ts](lib/billing/payments/stripe.ts):158,186 | **Stale comment** | "(not full-replace like Paddle)" and "Equivalent to Paddle's prorated_immediately" — comparisons to a provider that no longer exists. |
| [app/api/billing/webhook/route.ts](app/api/billing/webhook/route.ts):83 | **Stale comment** | "Stripe and Paddle both retry on non-2xx" — narrow to Stripe only. |
| [app/(app)/settings/page.tsx](app/%28app%29/settings/page.tsx):222,229 | **Stale comment** | Phase-3-flagged JSDoc block describing the `usePaddle` event-fan-out invariant — `usePaddle` was deleted in Phase 3. |
| [components/billing/PlansAndPricingView.tsx](components/billing/PlansAndPricingView.tsx):24 | **Stale comment** | "(it owns the Paddle instance + event wiring)" — no Paddle instance exists anywhere now. |
| [components/billing/UpgradeSuccessModal.tsx](components/billing/UpgradeSuccessModal.tsx):27 | **Stale comment** | "Opens immediately on Paddle's `checkout.completed`" — bridge now opens on `?upgraded=true` from Stripe success redirect. |

**Variable-name leakage**: The only function/class identifiers containing "paddle" are inside `lib/billing/payments/paddle.ts` itself (`PaddleProvider`, `getPaddle`, `_paddle`, `mapPaddleSubscriptionToDTO`, `normalizePaddleEvent`, `paddleStatus` arg). All disappear when the file is deleted. **No other code file declares a paddle-named symbol.**

---

## Section 2 — Provider Registry State

### 2.1 `lib/billing/payments/index.ts` (full contents)

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
18    if (PROVIDER_NAME === "stripe") {
19      // Dynamic import keeps Stripe SDK out of the bundle when running on Paddle.
20      // eslint-disable-next-line @typescript-eslint/no-require-imports
21      const { StripeProvider } = require("./stripe") as typeof import("./stripe");
22      _provider = new StripeProvider();
23      return _provider;
24    }
25
26    throw new Error(`[billing] Unknown payment provider: ${PROVIDER_NAME}`);
27  }
28
29  // Test/dev helper — Phase C2 will register the real PaddleProvider here.
30  export function _setPaymentProvider(provider: PaymentProvider | null): void {
31    _provider = provider;
32  }
33
34  export * from "./types";
```

**Phase 5 collapse plan**: drop the `import { PaddleProvider }`, drop the default-to-paddle fallback, drop the `paddle` branch, drop the dynamic `require` (no longer needed since Stripe becomes the only branch — can become a static import again), and fix the line-19 + line-29 comments. After collapse this file should be ~12 lines.

### 2.2 `lib/billing/payments/types.ts` (full contents)

```ts
  1  export interface CheckoutParams {
  2    workspaceId: string;
  3    workspaceName: string;
  4    ownerEmail: string;
  5    ownerUid: string;
  6    seatCount: number;
  7    billingCycle: "monthly" | "annual";
  8    successUrl: string;
  9    cancelUrl: string;
 10    existingCustomerId?: string | null;
 11  }
 12
 13  export interface CheckoutResult {
 14    /** Hosted Checkout URL the client should redirect to. */
 15    url: string;
 16  }
 17
 18  export interface PortalParams {
 19    customerId: string;
 20    returnUrl: string;
 21  }
 22
 23  export interface PortalResult {
 24    portalUrl: string;
 25  }
 26
 27  export type WebhookEvent =
 28    | { type: "subscription_started"; eventId: string; data: { subscriptionId: string; customerId: string; workspaceId: string | null; }; }
 29    | { type: "subscription_updated"; eventId: string; data: { subscriptionId: string }; }
 30    | { type: "subscription_canceled"; eventId: string; data: { subscriptionId: string }; }
 31    | { type: "payment_failed"; eventId: string; data: { subscriptionId: string | null; customerId: string | null; customerEmail?: string; }; }
 32    | { type: "unknown"; eventId: string; data: Record<string, unknown>; };
 33
 34  export interface SubscriptionData { … }   // unchanged, no paddle refs
 35
 36  export type ProrationMode =
 37    | "prorated_immediately"
 38    | "prorated_next_billing_period"
 39    | "full_immediately"
 40    | "full_next_billing_period"
 41    | "do_not_bill";
 42
 43  export interface TransactionSummary { … }  // unchanged
 44
 45  export interface PaymentProvider {
 46    createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
 47    /** The HTTP header name where this provider sends its webhook signature. e.g. "paddle-signature" or "stripe-signature". */
 48    readonly signatureHeaderName: string;
 49    /** Provider name for logging and idempotency keys. e.g. "paddle" or "stripe". */
 50    readonly name: string;
 51    …
 52  }
```

(Full file is 119 lines — see [lib/billing/payments/types.ts](lib/billing/payments/types.ts:1). Reproduced here in summary form; only the Paddle-relevant lines are exact.)

### 2.3 Paddle-shaped types

| Type name | Values | In-use? |
|---|---|---|
| `ProrationMode` | `prorated_immediately`, `prorated_next_billing_period`, `full_immediately`, `full_next_billing_period`, `do_not_bill` | The string union is Paddle's exact `prorationBillingMode` vocabulary. Stripe maps `prorated_immediately` → `proration_behavior: "always_invoice"` (see [stripe.ts:186](lib/billing/payments/stripe.ts#L186)). Only `prorated_immediately` is actually consumed by callers — verify before deleting. The other four values appear to be defined-but-unused (no Phase-4 caller passes them); confirm with a targeted grep in Phase 5. |

No other union/enum in `types.ts` carries Paddle-shaped values. Comments on `signatureHeaderName` and `name` (lines 95, 97) reference Paddle as one of two examples but are easy single-word edits.

---

## Section 3 — Active `PaddleProvider` Method Calls

### 3.1 Direct `PaddleProvider` references

Only [lib/billing/payments/index.ts:2](lib/billing/payments/index.ts#L2) imports `PaddleProvider`, and only line 14 instantiates it. **No other file touches the concrete class.** Every other consumer of billing goes through the abstract `PaymentProvider` interface via `getPaymentProvider()`. Clean.

### 3.2 Tests/scripts/fixtures referencing `paddle.ts` directly

Grep `from ["'].*paddle["']|require\(["'].*paddle["']\)` across all `.ts`/`.tsx`/`.js`/`.jsx`/`.mjs`:

- [lib/billing/payments/index.ts:2](lib/billing/payments/index.ts#L2) — registry import (covered above).

No test fixtures, no scripts. Clean.

---

## Section 4 — Package Dependencies

### 4.1 `@paddle/*` in `package.json`

```
dependencies:
  "@paddle/paddle-js": "^1.6.4",         // line 22
  "@paddle/paddle-node-sdk": "^3.8.0",   // line 23
```

`devDependencies`: none.

### 4.2 Scripts mentioning paddle

None. The `scripts` section ([package.json:11-19](package.json#L11-L19)) has `dev`, `build`, `start`, `lint`, and the two `build:extension*` entries — no paddle references.

### 4.3 `pnpm-lock.yaml` `@paddle/*` mentions (first-level)

```
line 14:    '@paddle/paddle-js':
line 17:    '@paddle/paddle-node-sdk':
line 1196:  '@paddle/paddle-js@1.6.4':
line 1199:  '@paddle/paddle-node-sdk@3.8.0':
line 4953:  '@paddle/paddle-js@1.6.4': {}
line 4955:  '@paddle/paddle-node-sdk@3.8.0': {}
```

All auto-cleaned by `pnpm remove @paddle/paddle-js @paddle/paddle-node-sdk`.

---

## Section 5 — Env Var Inventory

### 5.1 `.env.example` Paddle lines (lines 31–56, verbatim)

```
31  # Paddle — payment processing (per-seat billing).
32  # Switch providers (default: paddle). Currently only 'paddle' is supported.
33  # PAYMENT_PROVIDER=paddle
34
35  # Paddle environment: 'sandbox' or 'production'.
36  # PADDLE_ENVIRONMENT=sandbox
37
38  # Client-side: which Paddle dashboard environment (sandbox vs production).
39  # Used to build admin UI deep links. Mirror this with PADDLE_ENVIRONMENT.
40  # NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
41
42  # Server API key — Paddle Dashboard → Developer Tools → Authentication.
43  # Format: pdl_sdbx_apikey_... (sandbox) or pdl_live_apikey_... (production).
44  # PADDLE_API_KEY=
45
46  # Notification webhook secret — Paddle Dashboard → Notifications → your destination.
47  # Format: pdl_ntfset_...
48  # PADDLE_WEBHOOK_SECRET=
49
50  # Paddle price IDs — Paddle Dashboard → Catalog → Prices (format: pri_...).
51  # PADDLE_BUSINESS_PRICE_MONTHLY_ID=pri_...
52  # PADDLE_BUSINESS_PRICE_ANNUAL_ID=pri_...
53
54  # Client-side Paddle.js token — required for the overlay checkout to load.
55  # Format: live_... or test_...
56  # NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
```

Delete lines 31–56 entirely. The Stripe block at lines 58–73 already replaces them. Also re-word line 32's "(default: paddle). Currently only 'paddle' is supported" — but since the whole block goes away, this is moot.

### 5.2 Reads of `process.env.PADDLE_*` / `process.env.NEXT_PUBLIC_PADDLE_*`

Confined to a single file:

| File:Line | Var |
|---|---|
| [lib/billing/payments/paddle.ts:27](lib/billing/payments/paddle.ts#L27) | `PADDLE_API_KEY` |
| [lib/billing/payments/paddle.ts:32](lib/billing/payments/paddle.ts#L32) | `PADDLE_ENVIRONMENT` |
| [lib/billing/payments/paddle.ts:37](lib/billing/payments/paddle.ts#L37) | `PADDLE_API_KEY` |
| [lib/billing/payments/paddle.ts:48](lib/billing/payments/paddle.ts#L48) | `PADDLE_BUSINESS_PRICE_ANNUAL_ID` |
| [lib/billing/payments/paddle.ts:49](lib/billing/payments/paddle.ts#L49) | `PADDLE_BUSINESS_PRICE_MONTHLY_ID` |
| [lib/billing/payments/paddle.ts:84](lib/billing/payments/paddle.ts#L84) | `PADDLE_WEBHOOK_SECRET` |
| [lib/billing/payments/paddle.ts:92](lib/billing/payments/paddle.ts#L92) | `PADDLE_WEBHOOK_SECRET` |
| [lib/billing/payments/paddle.ts:214](lib/billing/payments/paddle.ts#L214) | `PADDLE_BUSINESS_PRICE_ANNUAL_ID` |

`NEXT_PUBLIC_PADDLE_*` is not read anywhere in the code — the deleted `usePaddle` hook held the only client-side reads. All `PADDLE_*` reads live in `paddle.ts` and vanish when the file is deleted.

---

## Section 6 — Skill & Doc Files

### 6.1 `.agents/skills/` contents

| Folder | File count | Files |
|---|---|---|
| `paddle-billing-history/` | 1 | `SKILL.md` |
| `paddle-catalog-setup/` | 1 | `SKILL.md` |
| `paddle-checkout-web/` | 1 | `SKILL.md` |
| `paddle-customer-portal/` | 1 | `SKILL.md` |
| `paddle-sandbox-testing/` | 1 | `SKILL.md` |
| `paddle-subscription-cancel/` | 1 | `SKILL.md` |
| `paddle-subscription-sync/` | 1 | `SKILL.md` |
| `paddle-subscription-update/` | 1 | `SKILL.md` |
| `paddle-webhooks/` | 1 | `SKILL.md` |

### 6.2 Paddle vs. non-paddle skill folders

Every folder under `.agents/skills/` is a `paddle-*` folder. There are no non-paddle skills to preserve. The 9 paddle folders **and** the matching 9 entries in [skills-lock.json](skills-lock.json) (lines 4–47) are deletion targets in toto.

### 6.3 `.md` files at repo root and under `docs/` — Paddle mentions

**Repo-root `.md` files** (full list):
- [README.md](README.md) — no Paddle match
- [DESIGN_AUDIT.md](DESIGN_AUDIT.md) — no Paddle match
- [PADDLE_TESTING.md](PADDLE_TESTING.md) — matches (whole file is Paddle)
- [ui-architecture-map.md](ui-architecture-map.md) — no Paddle match

**`docs/` `.md` files** (full list):
- [docs/audits/counts-architecture-final-lock.md](docs/audits/counts-architecture-final-lock.md) — no Paddle match
- [docs/audits/paddle-migration-audit.md](docs/audits/paddle-migration-audit.md) — matches
- [docs/audits/phase1-preflight.md](docs/audits/phase1-preflight.md) — matches
- [docs/audits/phase3-preflight.md](docs/audits/phase3-preflight.md) — matches
- [docs/audits/phase4-preflight.md](docs/audits/phase4-preflight.md) — matches
- [docs/migration/stripe/phase1-post-deploy-checklist.md](docs/migration/stripe/phase1-post-deploy-checklist.md) — matches

**Recommendation**: keep all the audit / migration-history `.md` files (they are the migration's paper trail) and delete only [PADDLE_TESTING.md](PADDLE_TESTING.md). A Stripe-equivalent should replace it.

### 6.4 `PADDLE_TESTING.md` (full contents — preserved for Stripe-equivalent reference)

The full 142-line runbook covers:

- **One-time setup**: install `cloudflared`, populate `.env.local` with 8 PADDLE_* vars.
- **Per-session steps**: start `npm run dev`, start a `cloudflared` tunnel, copy the tunnel URL, update the Paddle notification destination URL in the sandbox dashboard (Developer Tools → Notifications → Edit destination), and verify reachability with `curl … /api/billing/webhook` (expect 405 from the POST-only route).
- **Test plan**: a 14-row table (T1–T14) covering upgrade overlay, sandbox card `4242 4242 4242 4242`, `subscription.activated` workspaceId in custom_data, member-add/remove seat sync, payment_failed simulation + suspend + email-once, delete-workspace cancel, admin `set_plan`, `set_manual_override`, `ENTERPRISE_REQUIRES_MANUAL_OVERRIDE` / `NEVER_PAID_REQUIRES_MANUAL_OVERRIDE` / `CANNOT_DOWNGRADE_PAID_TO_STARTER` 400s, comp mode, billing-surface refresh.
- **Sandbox test cards**: success / decline / insufficient-funds.
- **Webhook simulation without checkout**: Paddle Simulator + the dev-only `x-echly-webhook-test: <CRON_SECRET>` header bypass.
- **Troubleshooting**: signature verification failure, workspace not resolving on `subscription.activated`, overlay-load failures, admin `set_plan` 400s, tunnel-URL change.

For the Stripe-equivalent (`STRIPE_TESTING.md` or rename): replace cloudflared+Paddle-destination flow with the Stripe CLI (`stripe listen --forward-to localhost:3000/api/billing/webhook`), keep the T1–T14 matrix structure, swap sandbox cards for Stripe test cards (`4242 4242 4242 4242` happens to be Stripe's primary success card too), swap the simulator step for `stripe trigger <event>`, and update env-var list to match the `STRIPE_*` block already in `.env.example`.

---

## Section 7 — Default Provider Fallback

### 7.1 `?? "paddle"` fallbacks

| File:Line | Code |
|---|---|
| [lib/billing/payments/index.ts:6](lib/billing/payments/index.ts#L6) | `const PROVIDER_NAME = process.env.PAYMENT_PROVIDER ?? "paddle";` |

Single occurrence. Phase 5: change the fallback (or remove it once Stripe is the only provider — the env var becomes unnecessary).

### 7.2 Stale "Paddle is the only supported provider" comments

| File:Line | Comment |
|---|---|
| [lib/billing/payments/index.ts:11](lib/billing/payments/index.ts#L11) | `// Paddle provider is the only supported provider going forward.` |
| [.env.example:32](.env.example#L32) | `# Switch providers (default: paddle). Currently only 'paddle' is supported.` |

Both go away when their containing blocks are deleted/rewritten in Phase 5.

---

## Section 8 — Still-Used Stale Comments

### 8.1 Webhook/admin/provider files mentioning Paddle by name

| File:Line | Comment (provider-neutralize or replace with "Stripe") |
|---|---|
| [app/api/billing/webhook/route.ts:83](app/api/billing/webhook/route.ts#L83) | "Stripe and Paddle both retry on non-2xx" → "Stripe retries on non-2xx" |
| [lib/billing/payments/stripe.ts:158](lib/billing/payments/stripe.ts#L158) | "Stripe uses item-level updates (not full-replace like Paddle)" → drop the Paddle comparison |
| [lib/billing/payments/stripe.ts:186](lib/billing/payments/stripe.ts#L186) | "Equivalent to Paddle's prorated_immediately" → drop the comparison |
| [lib/billing/payments/types.ts:95](lib/billing/payments/types.ts#L95) | "e.g. \"paddle-signature\" or \"stripe-signature\"" → "e.g. \"stripe-signature\"" |
| [lib/billing/payments/types.ts:97](lib/billing/payments/types.ts#L97) | "e.g. \"paddle\" or \"stripe\"" → "e.g. \"stripe\"" |
| [components/billing/PlansAndPricingView.tsx:24](components/billing/PlansAndPricingView.tsx#L24) | "Checkout itself stays in BillingTab (it owns the Paddle instance + event wiring)" → reword: BillingTab posts to `/api/billing/checkout` and redirects to Stripe-hosted checkout (no client SDK instance to own). |
| [components/billing/UpgradeSuccessModal.tsx:27](components/billing/UpgradeSuccessModal.tsx#L27) | "Post-checkout bridge state. Opens immediately on Paddle's `checkout.completed`…" → reword: opens on `?upgraded=true` after Stripe success-URL redirect. |

### 8.2 Section-8 file enumeration (full per-file grep results)

| File | Paddle hits | Status |
|---|---|---|
| [app/api/billing/webhook/route.ts](app/api/billing/webhook/route.ts) | 1 (line 83 comment) | Trivial edit |
| [app/api/admin/workspaces/actions/route.ts](app/api/admin/workspaces/actions/route.ts) | 0 | Clean |
| [app/api/billing/checkout/route.ts](app/api/billing/checkout/route.ts) | 0 | Clean |
| `app/api/billing/portal/route.ts` | 0 | (Note: route does not exist — `Glob` returned no file under `app/api/billing/portal/`. Likely either never built or removed in an earlier phase.) |
| `app/api/billing/history/route.ts` | 0 | (Similar — not present.) |
| `app/api/billing/invoice/[id]/route.ts` | 0 | (Similar — not present.) |
| `app/api/workspace/route.ts` | 0 | (Similar — not present.) |
| `app/api/workspace/members/[uid]/route.ts` | 0 | (Similar — not present.) |
| `app/api/workspace/invitations/accept/[token]/route.ts` | 0 | (Similar — not present.) |
| [app/admin/customers/page.tsx](app/admin/customers/page.tsx) | 0 | Clean |
| [components/billing/PlansAndPricingView.tsx](components/billing/PlansAndPricingView.tsx) | 1 (line 24 comment) | Trivial edit |
| [components/billing/UpgradeSuccessModal.tsx](components/billing/UpgradeSuccessModal.tsx) | 1 (line 27 comment) | Trivial edit |
| `components/billing/BillingManagementView.tsx` | 0 | (Not present at that path — no match returned.) |

A full repo-wide grep across `app/` confirms only **2** files under `app/` reference Paddle: `app/api/billing/webhook/route.ts` and `app/(app)/settings/page.tsx`. Across `components/`: only `UpgradeSuccessModal.tsx` and `PlansAndPricingView.tsx`. Anything else listed in Section 8 of the audit prompt is already clean (or never existed at that path in this branch).

---

## Section 9 — Stale Doc Comment in `app/(app)/settings/page.tsx`

The Phase-3 audit flagged a JSDoc block describing `usePaddle` event fan-out. Current content (lines 221–232):

```tsx
221  /**
222   * Post-checkout bridge owner. Holds the success-modal state, the Paddle
223   * `checkout.completed` subscription, and the post-upgrade usage refetch.
224   *
225   * Hoisted out of BillingTab: BillingTab has loading/error early returns that
226   * unmount its whole subtree on a Firestore snapshot re-entry, which used to
227   * tear down the modal mid-bridge (skeleton flash → modal reappears). Mounted
228   * here it is unconditional and stable, so the modal survives ANY BillingTab
229   * re-render, remount, loading, or error transition. usePaddle fans every
230   * event out to all listeners, so BillingTab's own subscription (for its
231   * checkout button spinner / error banner) keeps working independently.
232   */
```

Lines 240–242 already reference Stripe correctly:

```tsx
240    // Watch for `?upgraded=true` after returning from Stripe Checkout.
241    // Consumed-once semantics: open the modal, refresh usage, then strip the
242    // query param so a refresh doesn't re-trigger.
```

The 221–232 block needs a rewrite: drop the `checkout.completed` / `usePaddle` event-fan-out narrative entirely. The bridge now just watches `?upgraded=true` from Stripe's success-URL redirect — no subscription, no listener fan-out, no event timing concern. Simplify aggressively.

---

## Section 10 — Proposed Deletion Checklist

| Path | Type | Action |
|---|---|---|
| [lib/billing/payments/paddle.ts](lib/billing/payments/paddle.ts) | code file | **Delete** entirely (~325 lines). |
| [lib/billing/payments/index.ts](lib/billing/payments/index.ts) | code file | **Rewrite** — drop `PaddleProvider` import, drop default-to-paddle fallback, drop `paddle` branch and the `eslint-disable require` dynamic import (Stripe becomes a static import), update comments on lines 11, 19, 29. Collapse to ~12 lines. |
| [lib/billing/payments/types.ts](lib/billing/payments/types.ts) | code file | **Modify** — reword JSDoc on lines 95 and 97 to drop "paddle" example; review `ProrationMode` union — keep `prorated_immediately` (used by Stripe path) and confirm whether the other four values have any callers (likely dead; safe to delete in Phase 5 once verified). |
| [lib/billing/payments/stripe.ts](lib/billing/payments/stripe.ts) | code file | **Modify** — delete Paddle-comparison phrasing on lines 158 and 186. |
| [app/api/billing/webhook/route.ts](app/api/billing/webhook/route.ts) | code file | **Modify** — line 83 comment: drop "Paddle" mention. |
| [app/(app)/settings/page.tsx](app/%28app%29/settings/page.tsx) | code file | **Modify** — rewrite JSDoc block at lines 221–232 to describe the Stripe `?upgraded=true` flow; remove `usePaddle` / `checkout.completed` narrative. |
| [components/billing/PlansAndPricingView.tsx](components/billing/PlansAndPricingView.tsx) | code file | **Modify** — reword line 24 comment to drop Paddle reference. |
| [components/billing/UpgradeSuccessModal.tsx](components/billing/UpgradeSuccessModal.tsx) | code file | **Modify** — reword line 27 comment to drop `checkout.completed` reference. |
| [package.json](package.json) | config | **Modify** — remove `@paddle/paddle-js` (line 22) and `@paddle/paddle-node-sdk` (line 23) from `dependencies`. Use `pnpm remove @paddle/paddle-js @paddle/paddle-node-sdk` so the lockfile updates automatically. |
| [pnpm-lock.yaml](pnpm-lock.yaml) | lockfile | **Auto** — cleaned by `pnpm remove`; no manual edit. |
| [.env.example](.env.example) | config | **Modify** — delete lines 31–56 (entire Paddle block). |
| [PADDLE_TESTING.md](PADDLE_TESTING.md) | doc | **Delete** (replace with Stripe-equivalent runbook — see §6.4 for content to preserve). |
| [.agents/skills/paddle-billing-history/](/.agents/skills/paddle-billing-history/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-catalog-setup/](/.agents/skills/paddle-catalog-setup/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-checkout-web/](/.agents/skills/paddle-checkout-web/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-customer-portal/](/.agents/skills/paddle-customer-portal/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-sandbox-testing/](/.agents/skills/paddle-sandbox-testing/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-subscription-cancel/](/.agents/skills/paddle-subscription-cancel/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-subscription-sync/](/.agents/skills/paddle-subscription-sync/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-subscription-update/](/.agents/skills/paddle-subscription-update/) | skill folder | **Delete** entirely. |
| [.agents/skills/paddle-webhooks/](/.agents/skills/paddle-webhooks/) | skill folder | **Delete** entirely. |
| [skills-lock.json](skills-lock.json) | config | **Modify** — delete the 9 `paddle-*` entries (lines 4–47); if the `skills` object becomes empty, leave it as `{}` or delete the file (verify whether the skills manifest tool requires the file to exist). |
| `docs/audits/paddle-migration-audit.md` | doc | **Keep** — historical record of the migration. |
| `docs/audits/phase{1,3,4}-preflight.md` | doc | **Keep** — historical audits. |
| `docs/migration/stripe/phase1-post-deploy-checklist.md` | doc | **Keep** — references Paddle as the *outgoing* provider in checklist context; substantively about Stripe. |

---

## Unknowns or Surprises

- **`ProrationMode` union has 5 members but only `prorated_immediately` is observably used in the Stripe path.** Phase 5 should grep all callers (`updateSubscriptionPlan(`) and confirm the four other modes (`prorated_next_billing_period`, `full_immediately`, `full_next_billing_period`, `do_not_bill`) really have no consumers before deleting them. If unsure, keep the union as-is — it costs nothing and matches a Stripe behavior we may want later.
- **Several files listed in Section 8 of the audit prompt (`portal/route.ts`, `history/route.ts`, `invoice/[id]/route.ts`, `workspace/*`, `BillingManagementView.tsx`) don't exist at the given paths in this branch.** Either they were never created, were removed in an earlier phase, or live elsewhere. Worth confirming with the architect that this isn't a missed migration surface — if portal/history/invoice routes are expected to exist, Phase 5 should not just clean up Paddle, it should verify they're built on Stripe.
- **`skills-lock.json` becomes empty (or near-empty) after Phase 5.** Decide whether the file should remain as `{"skills": {}}` or be deleted entirely — depends on whether the skills loader tolerates an absent file. Same question applies to the `.agents/skills/` directory itself: keep an empty parent folder for future skills, or delete it too.
