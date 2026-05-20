# Phase 1 — Post-Deploy Checklist

After deploying Phase 1, the following one-time manual steps must be completed in the Firebase Console.

## 1. Set up TTL policy on `webhookEvents` collection

The idempotency store auto-expires entries 30 days after creation via the `expiresAt` field. Firestore requires a one-time TTL policy setup that cannot be configured from code.

**Steps:**

1. Open the [Firebase Console](https://console.firebase.google.com) → project `echly-b74cc`
2. Navigate to **Firestore Database** → **Time-to-live (TTL)** tab
3. Click **Create policy**
4. Collection group: `webhookEvents`
5. Timestamp field: `expiresAt`
6. Click **Create**

After creation, Firestore will automatically delete `webhookEvents` documents 30 days after their `expiresAt` timestamp passes. There may be a delay of up to 24 hours after the TTL is reached before deletion.

**Verification:** the TTL panel will show the policy as "Active" or "Enabled" once it's been set up.

## 2. Deploy updated Firestore rules

After confirming the rules in `firestore.rules` are correct (look for the new `match /webhookEvents/{eventId}` block):

```bash
firebase deploy --only firestore:rules
```

## 3. Smoke test (still on Paddle)

Confirm the existing Paddle flow still works:

1. `pnpm dev`
2. Verify `PAYMENT_PROVIDER` in `.env.local` is unset or `paddle`
3. Open `/settings?tab=billing`
4. Verify no console errors related to Stripe (since `STRIPE_*` env vars aren't set, the dynamic require for Stripe should never execute)
5. Trigger a fake Paddle webhook via `PADDLE_TESTING.md` instructions → verify the event is processed AND a `webhookEvents/{eventId}` doc appears in Firestore
6. Replay the same webhook → verify the second delivery is skipped (look for "Duplicate delivery detected" log line)
