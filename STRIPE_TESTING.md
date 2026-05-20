# Stripe Testing Runbook

Manual test plan for the Stripe integration. Run through these scenarios after any change to the billing layer.

## One-Time Setup

### 1. Install Stripe CLI (one-time per machine)

Download from https://github.com/stripe/stripe-cli/releases/latest. Extract `stripe.exe` and add to your PATH.

### 2. Stripe Dashboard configuration

In Stripe test mode (https://dashboard.stripe.com/test):
- Create product "Annote Business" with two prices: monthly and annual
- Configure Customer Portal (Settings → Billing → Customer portal)
- Get API keys from Developers → API keys
- Get webhook signing secret from Developers → Webhooks (create endpoint at https://annote.ai/api/billing/webhook for production)

### 3. Local environment variables

In `.env.local`:
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_BUSINESS_PRICE_MONTHLY_ID=price_...
STRIPE_BUSINESS_PRICE_ANNUAL_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe CLI listen command)
NEXT_PUBLIC_STRIPE_MODE=test
```

## Per-Session Startup

In separate terminals:

**Terminal 1 — Stripe CLI listener:**
```
stripe listen --forward-to localhost:3000/api/billing/webhook
```
Keep this running. It forwards all Stripe test events to your local app.

**Terminal 2 — Dev server:**
```
pnpm dev
```

**Terminal 3 — For triggering test events (optional):**
```
stripe trigger <event-name>
```

## Test Plan

| # | Scenario | Steps | Expected |
|---|---|---|---|
| T1 | Upgrade flow opens | Sign in, go to `/settings?tab=billing`, click Upgrade to Business | Redirects to checkout.stripe.com |
| T2 | Checkout with test card | Use `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP | Returns to `/settings?tab=billing&upgraded=true`; success modal appears |
| T3 | Webhook updates workspace | After T2, check Firestore: workspace doc | `billing.plan = "business"`, `billing.subscriptionId` set, `billing.customerId` set |
| T4 | Confirmation email | After T2 | `Subscription confirmation` email arrives at owner's address |
| T5 | Idempotency: re-trigger same event | Use Stripe Dashboard to redeliver the `customer.subscription.created` event | Webhook logs "Duplicate delivery detected"; no second email |
| T6 | Seat sync on invite | Invite a new member to a Business workspace | `billing.seats` increments; Stripe subscription quantity matches |
| T7 | Seat sync on removal | Remove a member | `billing.seats` decrements; Stripe subscription updates |
| T8 | Payment failed | `stripe trigger invoice.payment_failed` | `billing.suspended = true`; payment failed email sent |
| T9 | Card update | Update card via Customer Portal | New `billing.paymentMethod` reflected; `Payment method updated` email sent |
| T10 | Cancel subscription | Via Customer Portal: cancel | `billing.cancelAt` set to period end; `billing.plan` still business until period ends |
| T11 | Cancellation lands | `stripe trigger customer.subscription.deleted` | Workspace downgrades to starter; cancellation email sent |
| T12 | Admin set_plan | Admin action `set_plan` to business on a paid sub | Stripe subscription plan updates; webhook syncs Firestore |
| T13 | Admin set_manual_override | Grant comp via `set_manual_override` | `billing.manualOverride = true`; subsequent webhooks skip downgrade |
| T14 | Billing history | View `/settings?tab=billing` invoice list | All invoices visible; PDF download works |

## Test Cards (Stripe test mode)

| Scenario | Card |
|---|---|
| Successful payment | 4242 4242 4242 4242 |
| Declined (generic) | 4000 0000 0000 0002 |
| Insufficient funds | 4000 0000 0000 9995 |
| 3D Secure required | 4000 0027 6000 3184 |
| Expired card | 4000 0000 0000 0069 |

Full list: https://docs.stripe.com/testing#cards

## Trigger Events Without Real Checkout

Stripe CLI can fire any webhook event for testing:

```
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger invoice.upcoming
```

## Troubleshooting

### Webhook signature verification failed
- Confirm `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the secret printed by `stripe listen`
- The CLI's secret is stable per-account; you only need to update if you ran `stripe login` again

### Workspace not updating after checkout
- Check the Stripe CLI terminal — did events forward?
- Check `pnpm dev` logs for webhook handler errors
- Check Firestore directly — is the workspace doc updating?
- Verify subscription metadata includes `workspaceId` (Stripe Dashboard → Subscriptions → click sub → metadata section)

### Confirmation email not sent
- Verify `RESEND_API_KEY` is set in `.env.local`
- Check Resend dashboard for failed deliveries
- Confirm owner's email is set on the user doc in Firestore

### Production webhook setup
For production deploy, see `docs/migration/stripe/phase1-post-deploy-checklist.md` and add Stripe live mode env vars to Vercel.
