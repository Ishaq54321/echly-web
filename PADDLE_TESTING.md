# Paddle Sandbox Testing Runbook

This document describes how to run end-to-end Paddle sandbox tests for the billing integration (Phase C3 and beyond).

## One-time setup

### Install cloudflared (Windows)

```powershell
winget install --id Cloudflare.cloudflared
```

Or via Scoop:

```powershell
scoop install cloudflared
```

### Verify `.env.local`

The following Paddle env vars must be set:

- `PAYMENT_PROVIDER=paddle`
- `PADDLE_ENVIRONMENT=sandbox`
- `PADDLE_API_KEY=pdl_sdbx_apikey_...`
- `PADDLE_WEBHOOK_SECRET=pdl_ntfset_...` (the destination's **secret key**, NOT its ID — see Paddle dashboard → Edit destination → Secret key)
- `PADDLE_BUSINESS_PRICE_MONTHLY_ID=pri_...`
- `PADDLE_BUSINESS_PRICE_ANNUAL_ID=pri_...`
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...`
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox`

> Note the client-side var is `NEXT_PUBLIC_PADDLE_ENVIRONMENT` (project standard), not `NEXT_PUBLIC_PADDLE_ENV`.

## Per-test-session setup

### 1. Start dev server

```bash
npm run dev
```

### 2. Start cloudflared tunnel (separate terminal)

```bash
cloudflared tunnel --url http://localhost:3000
```

Output will include a line like:

```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://random-words-xyz.trycloudflare.com
```

Copy this URL.

### 3. Update Paddle notification destination

1. Open Paddle sandbox: https://sandbox-vendors.paddle.com
2. Developer Tools → Notifications
3. Find your destination, click the overflow menu (⋮) → Edit destination
4. Update URL to: `https://<your-tunnel>.trycloudflare.com/api/billing/webhook`
5. Save
6. (If events don't arrive) toggle Disable → Enable to flush cache

### 4. Verify tunnel reachability

```bash
curl -X GET https://<your-tunnel>.trycloudflare.com/api/billing/webhook
```

Expect: **405 Method Not Allowed** (route is POST-only). Both the cloudflared terminal AND the `npm run dev` terminal should show the request.

## Test plan

(See `phase-28-X-phase-C3-audit.md` for the full T1–T14 table.)

### Quick reference

| Test | Action |
|------|--------|
| T1  | Click "Upgrade to Business" (modal + settings tab) → Paddle overlay opens |
| T2  | Complete sandbox checkout with card `4242 4242 4242 4242` |
| T3  | Verify `subscription.activated` has `custom_data.workspaceId` |
| T4  | Add member → seats sync |
| T5  | Remove member → seats decrement |
| T6  | Trigger payment_failed simulator → suspend + email once |
| T7  | Re-fire payment_failed → no second email |
| T8  | Delete workspace → cancel |
| T9  | Admin set_plan paid → Paddle update (`mode: paid_synced`) |
| T10 | Admin set_plan on never-paid → 400 `NEVER_PAID_REQUIRES_MANUAL_OVERRIDE` |
| T11 | set_manual_override + fake cancel → no downgrade |
| T12 | Admin set_plan on comp → Firestore-only (`mode: comp`) |
| T13 | Admin set_plan → enterprise on paid → 400 `ENTERPRISE_REQUIRES_MANUAL_OVERRIDE` |
| T14 | Verify billing surfaces update after upgrade (UpgradeModal badge, banners) |

### Test cards (sandbox)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- (Any future expiry, any CVC, any postal code)

### Simulating webhooks without checkout

For tests that don't require a real checkout flow, use Paddle's Simulator:

- Sandbox dashboard → Developer Tools → Simulations → New simulation
- Pick the event type (e.g. `subscription.canceled`)
- Target: your tunnel URL
- Run

For dev-only fixture testing without Paddle entirely, use the webhook handler's `x-echly-webhook-test: <CRON_SECRET>` header (only works in non-production).

## Troubleshooting

### Webhook signature verification fails

- Verify `PADDLE_WEBHOOK_SECRET` matches the destination's **secret key** (NOT the destination ID — Paddle dashboard → Edit destination → Secret key)
- Confirm `PADDLE_ENVIRONMENT=sandbox` matches your Paddle dashboard environment

### Workspace not resolving on `subscription.activated`

- Check the dev console for `webhook_unresolved_workspace` log entries
- Verify `customData.workspaceId` was passed in the `Paddle.Checkout.open()` call (check the browser console for the `[paddle event]` logs from `usePaddle`)
- Fallback: the webhook will query `billing.customerId` — only fails if both fail

### Overlay doesn't open / "Checkout is still loading"

- Check the browser console for `[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set`
- Confirm Paddle.js loaded from `cdn.paddle.com` (Network tab)
- `usePaddle` initializes asynchronously — clicking before it's ready surfaces a transient "Checkout is still loading" message; retry after ~500ms

### Admin set_plan returns 400 unexpectedly

- `NEVER_PAID_REQUIRES_MANUAL_OVERRIDE`: workspace has no `subscriptionId` and no `manualOverride` → use `set_manual_override` instead
- `ENTERPRISE_REQUIRES_MANUAL_OVERRIDE`: Enterprise has no Paddle price → use `set_manual_override`
- `CANNOT_DOWNGRADE_PAID_TO_STARTER`: cancel the subscription instead of downgrading via set_plan

### Tunnel URL changed

- Restart cloudflared → get new URL → update Paddle notification destination URL → repeat step 4 verification
