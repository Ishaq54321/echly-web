# Phase 3 (Checkout UX rewrite) Pre-Flight Audit

**Date:** 2026-05-20
**Mode:** READ-ONLY — no files modified except this report, no commands run, no APIs hit.
**Goal:** surface every Paddle-overlay touchpoint so Phase 3 can rewire it cleanly to a Stripe hosted-redirect-then-return pattern.

---

## Section 1 — Current Checkout Flow (End-to-End Trace)

### 1.1 `lib/billing/openUpgradeCheckout.ts` (full contents)

```ts
  1  "use client";
  2
  3  import type { Paddle } from "@paddle/paddle-js";
  4  import { authFetch } from "@/lib/authFetch";
  5
  6  export interface CheckoutResponse {
  7    priceId: string;
  8    customData: Record<string, string>;
  9    customerEmail: string;
 10    customerId: string | null;
 11    seatCount: number;
 12  }
 13
 14  export interface OpenCheckoutOptions {
 15    paddle: Paddle;
 16    billingCycle: "monthly" | "annual";
 17    /**
 18     * Requested seat count. Optional — the server enforces the workspace
 19     * member-count floor regardless of what's sent here, so the value can be
 20     * higher than the floor but never lower.
 21     */
 22    seatCount?: number;
 23  }
 24
 25  /**
 26   * Fetches checkout details from the API and opens the Paddle overlay.
 27   *
 28   * Event handling (checkout.completed / closed / error) is NOT done here —
 29   * Paddle.js dispatches events through the global eventCallback wired in
 30   * usePaddle. Each calling surface subscribes via usePaddle({ onEvent }) and
 31   * reacts to the events it cares about. This helper only opens the overlay.
 32   */
 33  export async function openUpgradeCheckout(
 34    options: OpenCheckoutOptions
 35  ): Promise<void> {
 36    const { paddle, billingCycle, seatCount } = options;
 37
 38    const res = await authFetch("/api/billing/checkout", {
 39      method: "POST",
 40      headers: { "Content-Type": "application/json" },
 41      // seatCount is advisory — the server clamps it to the member-count floor.
 42      body: JSON.stringify({ billingCycle, seatCount }),
 43    });
 44
 45    if (!res) {
 46      throw new Error("Request failed. Please try again.");
 47    }
 48
 49    const json = (await res.json().catch(() => null)) as {
 50      success?: boolean;
 51      data?: CheckoutResponse;
 52      error?: { message?: string };
 53    } | null;
 54
 55    if (!res.ok || !json?.success || !json.data) {
 56      throw new Error(
 57        json?.error?.message ?? "Failed to start checkout. Please try again."
 58      );
 59    }
 60
 61    const data = json.data;
 62
 63    paddle.Checkout.open({
 64      items: [
 65        {
 56          priceId: data.priceId,
 67          quantity: data.seatCount,
 68        },
 69      ],
 70      customData: data.customData,
 71      customer: data.customerId
 72        ? { id: data.customerId }
 73        : { email: data.customerEmail },
 74      settings: {
 75        variant: "one-page",
 76        successUrl: `${window.location.origin}/settings?tab=billing&upgraded=true`,
 77      },
 78    });
 79  }
```

**Notes for the architect:**
- The function does TWO things today: POST to `/api/billing/checkout`, then call `paddle.Checkout.open(...)`. Phase 3 collapses both into "POST → window.location redirect."
- The `successUrl` built from `window.location.origin` is a Paddle setting only — the actual return URL for Stripe needs to come from `NEXT_PUBLIC_APP_URL` (server) since the user is bouncing through Stripe-hosted Checkout. The server route already builds it ([app/api/billing/checkout/route.ts:85](../../app/api/billing/checkout/route.ts#L85)).
- The `paddle` parameter is the only thing forcing this helper to be a client module. With Stripe, it's just a redirect — the helper becomes provider-agnostic.

### 1.2 `lib/hooks/usePaddle.ts` (full contents)

```ts
  1  "use client";
  2
  3  import {
  4    initializePaddle,
  5    type Paddle,
  6    type PaddleEventData,
  7  } from "@paddle/paddle-js";
  8  import { useEffect, useRef, useState } from "react";
  9
 10  // Module-level singleton — avoids double-init across concurrent mounts.
 11  let paddlePromise: Promise<Paddle | undefined> | null = null;
 12
 13  // Active event listeners (registered by hook instances). Paddle.js exposes a
 14  // single global eventCallback, so we fan it out to every surface that mounted
 15  // usePaddle with an onEvent handler.
 16  const eventListeners = new Set<(event: PaddleEventData) => void>();
 17
 18  function dispatchEvent(event: PaddleEventData) {
 19    eventListeners.forEach((listener) => {
 20      try {
 21        listener(event);
 22      } catch (err) {
 23        console.error("[paddle event listener error]", err);
 24      }
 25    });
 26  }
 27
 28  function getPaddleSingleton(): Promise<Paddle | undefined> {
 29    if (paddlePromise) return paddlePromise;
 30
 31    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
 32    const environment =
 33      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
 34        ? "production"
 35        : "sandbox";
 36
 37    if (!token) {
 38      console.error("[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set");
 39      paddlePromise = Promise.resolve(undefined);
 40      return paddlePromise;
 41    }
 42
 43    paddlePromise = initializePaddle({
 44      environment,
 45      token,
 46      eventCallback: dispatchEvent,
 47    });
 48
 49    return paddlePromise;
 50  }
 51
 52  export interface UsePaddleOptions {
 53    onEvent?: (event: PaddleEventData) => void;
 54  }
 55
 56  export function usePaddle(options?: UsePaddleOptions): {
 57    paddle: Paddle | undefined;
 58    ready: boolean;
 59  } {
 60    const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
 61    const [ready, setReady] = useState(false);
 62    const optionsRef = useRef(options);
 63
 64    // Keep the latest options without re-subscribing the event listener.
 65    // Mutating refs during render is disallowed — do it in an effect.
 66    useEffect(() => {
 67      optionsRef.current = options;
 68    });
 69
 70    useEffect(() => {
 71      let cancelled = false;
 72      getPaddleSingleton().then((instance) => {
 73        if (cancelled) return;
 74        setPaddle(instance);
 75        setReady(!!instance);
 76      });
 77      return () => {
 78      cancelled = true;
 79      };
 80    }, []);
 81
 82    // Subscribe to Paddle events via the shared dispatcher. The ref indirection
 83    // keeps the listener identity stable so we register exactly once.
 84    useEffect(() => {
 85      const listener = (event: PaddleEventData) => {
 86        optionsRef.current?.onEvent?.(event);
 87      };
 88      eventListeners.add(listener);
 89      return () => {
 90        eventListeners.delete(listener);
 91      };
 92    }, []);
 93
 94    return { paddle, ready };
 95  }
```

**Phase 3 action:** delete this file entirely. There are no Stripe equivalents — Stripe Checkout has no client SDK in this flow; we just `window.location.assign(url)`. After deletion, three imports break and need removal:
- [components/billing/UpgradeModal.tsx:9](../../components/billing/UpgradeModal.tsx#L9)
- [app/(app)/settings/page.tsx:48](../../app/(app)/settings/page.tsx#L48)

### 1.3 `components/billing/UpgradeModal.tsx` (full contents)

The file is 437 lines. The Paddle-coupled bits are concentrated in the imports and the top of the component body — reproduced here. (The rest is pure UI: cycle toggle, math summary, value bullets, CTA — none of which need to change.)

**Lines 1–14 (imports — Paddle coupling):**
```ts
  1  "use client";
  2
  3  import { useEffect, useState, type ReactNode } from "react";
  4  import { motion, AnimatePresence } from "framer-motion";
  5  import { Check, X, AlertCircle } from "lucide-react";
  6  import { useWorkspace } from "@/lib/client/workspaceContext";
  7  import { useWorkspaceUsageRealtime } from "@/lib/hooks/useWorkspaceUsageRealtime";
  8  import { usePlanCatalog } from "@/lib/hooks/usePlanCatalog";
  9  import { usePaddle } from "@/lib/hooks/usePaddle";
 10  import { openUpgradeCheckout } from "@/lib/billing/openUpgradeCheckout";
 11  import { fetchBillingUsage } from "@/lib/api/fetchBillingUsage";
 12  import { billingStore } from "@/lib/store/billingStore";
 13  import { CheckoutEventNames } from "@paddle/paddle-js";
```

**Lines 60–88 (Paddle event subscription):**
```ts
 60    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
 61      "monthly"
 62    );
 63    const [checkoutLoading, setCheckoutLoading] = useState(false);
 64    const [checkoutError, setCheckoutError] = useState<string | null>(null);
 65
 66    const { paddle } = usePaddle({
 67      onEvent: (event) => {
 68        if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
 69          setCheckoutError(null);
 70          // Quick-fix for billingStore staleness: refresh on completion only.
 71          // (Proper Firestore subscription is deferred to a polish phase.)
 72          fetchBillingUsage()
 73            .then((data) => billingStore.setBilling(data))
 74            .catch(() => {
 75              /* fail silently — useBillingUsage will catch up */
 76            });
 77          onClose();
 78        } else if (
 79          event.name === CheckoutEventNames.CHECKOUT_ERROR ||
 80          event.name === CheckoutEventNames.CHECKOUT_PAYMENT_ERROR ||
 81          event.name === CheckoutEventNames.CHECKOUT_FAILED
 82        ) {
 83          setCheckoutError("Checkout failed. Please try again.");
 84          setCheckoutLoading(false);
 85        } else if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
 86          setCheckoutLoading(false);
 87        }
 88      },
 89    });
```

**Lines 118–138 (`handleUpgradeClick` — calls `openUpgradeCheckout`):**
```ts
118    async function handleUpgradeClick() {
119      if (!isWorkspaceOwner) return;
120      if (!paddle) {
121        setCheckoutError(
122          "Checkout is still loading. Please try again in a moment."
123        );
124        return;
125      }
126      setCheckoutError(null);
127      setCheckoutLoading(true);
128      try {
129        await openUpgradeCheckout({ paddle, billingCycle, seatCount });
130        // Loading state is cleared by checkout.completed / closed / error events.
131      } catch (err) {
132        console.error("[upgrade] failed to open checkout:", err);
133        setCheckoutError(
134          err instanceof Error ? err.message : "Failed to start checkout. Try again."
135        );
136        setCheckoutLoading(false);
137      }
138    }
```

**The rest of the file (lines 139–437)** is JSX rendering and a `CycleButton` subcomponent — entirely UI, no Paddle references. Phase 3 should leave that intact.

### 1.4 `components/billing/UpgradeSuccessModal.tsx` (full contents)

```tsx
  1  "use client";
  2
  3  import { useEffect } from "react";
  4  import { motion, AnimatePresence } from "framer-motion";
  5  import { CheckCircle2 } from "lucide-react";
  6  import { ModalPortal } from "@/components/ui/ModalPortal";
  7  import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
  8  import { useWorkspaceRealtimeStore } from "@/lib/realtime/workspaceStore";
  9
 10  export interface UpgradeSuccessModalProps {
 11    isOpen: boolean;
 12    onClose: () => void;
 13    /** Plan the user upgraded to. Drives the heading copy. */
 14    planName?: string;
 15  }
 16
 17  // Once Firestore confirms, show the success state briefly before dismissing
 18  // so the transition reads as "done" rather than a flash.
 19  const SUCCESS_HOLD_MS = 800;
 20
 21  // Safety cap: webhook normally lands in 1-3s, but never trap the user. After
 22  // this we dismiss regardless — the view router self-corrects when/if the
 23  // webhook eventually lands (or the user can refresh).
 24  const FALLBACK_TIMEOUT_MS = 15000;
 25
 26  /**
 27   * Post-checkout bridge state. Opens immediately on Paddle's
 28   * `checkout.completed` (from BillingTab — see settings/page.tsx), then acts
 29   * as a redirecting/loading screen until Firestore catches up.
 30   * […]
 31   */
 32  export function UpgradeSuccessModal({
 33    isOpen,
 34    onClose,
 35    planName = "Business",
 36  }: UpgradeSuccessModalProps) {
 37    const { workspace } = useWorkspaceRealtimeStore();
 38
 39    const plan = workspace?.billing?.plan;
 40    const isPlanConfirmed = plan === "business" || plan === "enterprise";
 41
 42    useEffect(() => {
 43      if (!isOpen || !isPlanConfirmed) return;
 44      const timeout = setTimeout(onClose, SUCCESS_HOLD_MS);
 45      return () => clearTimeout(timeout);
 46    }, [isOpen, isPlanConfirmed, onClose]);
 47
 48    useEffect(() => {
 49      if (!isOpen) return;
 50      const fallback = setTimeout(onClose, FALLBACK_TIMEOUT_MS);
 51      return () => clearTimeout(fallback);
 52    }, [isOpen, onClose]);
 53
 54    return (
 55      <ModalPortal>
 56        <AnimatePresence>
 57          {isOpen && (
 58            […JSX: spinner-bridge → confirmed checkmark state…]
 59          )}
 60        </AnimatePresence>
 61      </ModalPortal>
 62    );
 63  }
```

(Full file lives at [components/billing/UpgradeSuccessModal.tsx](../../components/billing/UpgradeSuccessModal.tsx).)

**Phase 3-relevant facts:**
- Lifecycle is driven by `isOpen` + the live workspace doc (`useWorkspaceRealtimeStore`). It self-dismisses once `billing.plan` flips to `business`/`enterprise`.
- It has NO Paddle imports. The Paddle coupling is one level up: who *sets* `isOpen=true`.
- Today, `isOpen=true` is set by `UpgradeCheckoutBridge` on Paddle's `CHECKOUT_COMPLETED` event ([app/(app)/settings/page.tsx:241](../../app/(app)/settings/page.tsx#L241)).
- After Phase 3, the trigger becomes `searchParams.get("upgraded") === "true"` (the user returns from Stripe-hosted Checkout with that query param).
- The 15s fallback + Firestore-flip self-dismiss logic stay as-is — they're already provider-agnostic.

### 1.5 `app/api/billing/checkout/route.ts` (full contents)

```ts
  1  import "server-only";
  2  import type { NextRequest } from "next/server";
  3  import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
  4  import { apiError, apiSuccess } from "@/lib/server/apiResponse";
  5  import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
  6  import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
  7  import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
  8  import { getPaymentProvider } from "@/lib/billing/payments";
  9
 10  export const dynamic = "force-dynamic";
 11
 12  export async function POST(req: NextRequest) {
 13    let user;
 14    try {
 15      user = await requireAuth(req);
 16    } catch (err) {
 17      return toAuthorizationResponse(err);
 18    }
 19
 20    try {
 21      const workspaceId = await getUserWorkspaceIdRepo(user.uid);
 22      const workspace = await getWorkspace(workspaceId);
 23      if (!workspace) {
 24        return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
 25      }
 26      assertWorkspaceActive(workspace, { allowSuspended: true });
 27
 28      if (workspace.ownerId !== user.uid) {
 29        return apiError({
 30          code: "FORBIDDEN",
 31          message: "Only the workspace owner can upgrade",
 32          status: 403,
 33        });
 34      }
 35
 36      const plan = workspace.billing?.plan ?? "starter";
 37      if (plan === "business" || plan === "enterprise") {
 38        return apiError({
 39          code: "INVALID_INPUT",
 40          message: "Already on a paid plan",
 41          status: 400,
 42        });
 43      }
 44
 45      let body: { billingCycle?: unknown; seatCount?: unknown } = {};
 46      try {
 47        body = (await req.json()) as {
 48          billingCycle?: unknown;
 49          seatCount?: unknown;
 50        };
 51      } catch {
 52        // default to monthly
 53      }
 54
 55      const billingCycle: "monthly" | "annual" =
 56        body.billingCycle === "annual" ? "annual" : "monthly";
 57
 58      const memberCount = workspace.usage?.members ?? 1;
 59      const floor = Math.max(memberCount, 1);
 60      const requested =
 61        typeof body.seatCount === "number"
 62          ? body.seatCount
 63          : typeof body.seatCount === "string"
 64          ? parseInt(body.seatCount, 10)
 65          : NaN;
 66      const seatCount = Number.isFinite(requested)
 67        ? Math.max(requested, floor)
 68        : floor;
 69
 70      const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
 71      const ownerEmail = user.email ?? "";
 72
 73      const provider = getPaymentProvider();
 74      const result = await provider.createCheckoutSession({
 75        workspaceId,
 76        workspaceName: workspace.name,
 77        ownerEmail,
 78        ownerUid: user.uid,
 79        seatCount,
 80        billingCycle,
 81        existingCustomerId: workspace.billing?.customerId ?? null,
 82        successUrl: `${origin}/settings?tab=billing&upgraded=true`,
 83        cancelUrl: `${origin}/settings?tab=billing`,
 84      });
 85
 86      return apiSuccess({
 87        priceId: result.priceId,
 88        customData: result.customData,
 89        customerEmail: result.customerEmail,
 90        customerId: result.customerId ?? null,
 91        seatCount,
 92      });
 93    } catch (err) {
 94      console.error("POST /api/billing/checkout:", err);
 95      return apiError({ code: "INTERNAL_ERROR", message: "Failed to create checkout session", status: 500 });
 92    }
 93  }
```

**Phase 3 action:** the auth / owner / plan / seat-count clamp logic (lines 13–68) stays exactly as-is. The response shape (lines 86–92) collapses from five Paddle-shaped fields to `{ url }`. The `successUrl` + `cancelUrl` already point to the right places. The provider call moves from "give me priceId+customer info" to "give me a hosted Checkout URL."

---

## Section 2 — Settings Page Integration Points

`app/(app)/settings/page.tsx` is 3,500+ lines. All Paddle-related references are concentrated in two regions: the file header (imports) and two component definitions (`UpgradeCheckoutBridge` + `BillingTab`).

### 2.1 All matches in `app/(app)/settings/page.tsx`

| Line | Match | Role |
|------|-------|------|
| 48 | `import { usePaddle } from "@/lib/hooks/usePaddle";` | Import (used in two places: `UpgradeCheckoutBridge` and `BillingTab`). |
| 49 | `import { openUpgradeCheckout } from "@/lib/billing/openUpgradeCheckout";` | Import (used in `BillingTab.handleCheckout`). |
| 54 | `import { UpgradeSuccessModal } from "@/components/billing/UpgradeSuccessModal";` | Import (rendered by `UpgradeCheckoutBridge`). |
| 55 | `import { CheckoutEventNames } from "@paddle/paddle-js";` | Import (used in both `UpgradeCheckoutBridge` and `BillingTab.usePaddle({ onEvent })`). |
| 216 | `<UpgradeCheckoutBridge />` | Render — inside `<BillingUsageProvider>`, OUTSIDE the `activeTab === "billing"` gate (intentional — survives tab switches). |
| 235 | `function UpgradeCheckoutBridge()` | Component definition (lines 235–257). |
| 239 | `usePaddle({` | Inside `UpgradeCheckoutBridge` — listens for `CHECKOUT_COMPLETED` to open the success modal. |
| 241 | `if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED)` | Bridge trigger today. |
| 252 | `<UpgradeSuccessModal isOpen={showSuccessModal} ... />` | Render — gated by the bridge's local state. |
| 3197 | `function BillingTab()` | Component definition (lines 3197–~3650). |
| 3208 | `const searchParams = useSearchParams();` | Captures URL params for the `?upgraded=true` banner. |
| 3211 | `if (searchParams.get("upgraded") === "true") setBillingError(null);` | Effect: clears stale error banner when returning from checkout. |
| 3218 | `const { paddle } = usePaddle({ onEvent: (event) => { ... } });` | BillingTab's OWN paddle subscription (separate from the bridge). |
| 3220 | `if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) { setBillingError(null); setCheckoutLoading(false); }` | Resets tab-local state on completion. |
| 3224–3226 | `CHECKOUT_ERROR / CHECKOUT_PAYMENT_ERROR / CHECKOUT_FAILED` | Surface error banner. |
| 3230 | `CHECKOUT_CLOSED` | Clears the checkout-button spinner when the user cancels the overlay. |
| 3256 | `await openUpgradeCheckout({ paddle, billingCycle: cycle, seatCount });` | The `handleCheckout` entry-point. |
| 3411 | `{searchParams.get("upgraded") === "true" && ( <div>You're on the Business plan now…</div> )}` | Success banner shown inline at the top of the BillingTab body. |

**No other matches** in this file (or the rest of the app code path) — confirmed via grep on `usePaddle | CheckoutEventNames | openUpgradeCheckout | UpgradeCheckoutBridge`.

### 2.2 `UpgradeCheckoutBridge` definition

**Lines 235–257** (verbatim):

```tsx
235  function UpgradeCheckoutBridge() {
236    const [showSuccessModal, setShowSuccessModal] = useState(false);
237    const { refetch: refetchUsage } = useBillingUsageContext();
238
239    usePaddle({
240      onEvent: (event) => {
241        if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
242          // Celebrate immediately — don't wait for Firestore. The modal itself
243          // handles the webhook-timing handoff and self-dismisses once the
244          // live workspace doc flips.
245          setShowSuccessModal(true);
246          void refetchUsage();
247        }
248      },
249    });
250
251    return (
252      <UpgradeSuccessModal
253        isOpen={showSuccessModal}
254        onClose={() => setShowSuccessModal(false)}
255      />
256    );
257  }
```

Rendered at **line 216**, inside `<BillingUsageProvider>` and OUTSIDE the `activeTab === "billing"` gate so it survives tab switches and BillingTab's loading/error remounts.

**Phase 3 action:** the bridge needs a new trigger. The `usePaddle({ onEvent })` listener goes away; instead it reads `useSearchParams().get("upgraded") === "true"` and opens `showSuccessModal`. Then it should clear the URL param (via `router.replace`) so a refresh doesn't re-trigger it. The `refetchUsage()` call stays — it's provider-agnostic.

### 2.3 `BillingTab` checkout integration

**Component definition starts at line 3197.** The Paddle-specific surface area:

- **Line 3198** — `const [checkoutLoading, setCheckoutLoading] = useState(false);` — UI loading state for the "Continue to checkout" button.
- **Line 3200** — `const [billingError, setBillingError] = useState<string | null>(null);` — Error banner state.
- **Lines 3218–3234** — `usePaddle({ onEvent })`, with `CHECKOUT_COMPLETED` clearing error+loading, three `CHECKOUT_*ERROR/FAILED` variants showing the error banner, and `CHECKOUT_CLOSED` clearing the spinner.
- **Lines 3236–3267** — `handleCheckout(cycle, seatCount?)`:
  - Owner-only guard (line 3240–3245)
  - `paddle` readiness guard (line 3246–3251)
  - Sets loading, calls `openUpgradeCheckout({ paddle, billingCycle, seatCount })` (line 3256), relies on Paddle events to clear loading
  - Catches synchronous errors (network / 4xx from `/api/billing/checkout`) and surfaces them via `setBillingError`
- **Line 3411** — the success banner: `{searchParams.get("upgraded") === "true" && (...)}`.

**Paddle instance flow:** the `paddle` instance is obtained **independently** inside `BillingTab` via `usePaddle({ onEvent })` — it is NOT passed in from a parent. Same for `UpgradeCheckoutBridge`. The `usePaddle` hook itself uses a module-level singleton to ensure both instances share state (line 11 of `usePaddle.ts`), and the global Paddle.js `eventCallback` fans every event out to every listener.

**Phase 3 action — BillingTab simplifications:**
- Drop `usePaddle({ onEvent })` entirely (lines 3218–3234). Stripe doesn't fire client-side events.
- Drop the `paddle` readiness check in `handleCheckout` (lines 3246–3251) — no SDK to wait for.
- `handleCheckout` becomes: set loading → POST → read `{ url }` from response → `window.location.assign(url)`. Loading state is moot because the page is leaving; but keep it for the brief XHR window so the button shows "Loading…" between click and redirect.
- The `?upgraded=true` banner (line 3411) stays unchanged.
- The error banner stays — it surfaces server errors from `/api/billing/checkout`.

### 2.4 Other locations that initiate the upgrade flow

**Plan-limit-hit prompts:**
- [components/workspace/InviteMemberModal.tsx:7](../../components/workspace/InviteMemberModal.tsx#L7) — imports `UpgradeModal`. When the invite API returns `PLAN_LIMIT_REACHED` (line 53), the modal closes the invite UI and opens `<UpgradeModal open={showUpgrade} ... />` (line 129). The `UpgradeModal` itself then calls `openUpgradeCheckout` via the user's CTA click. **No direct Paddle call** from `InviteMemberModal`.

**Brand-logo upgrade prompt** in settings:
- [app/(app)/settings/page.tsx:453](../../app/(app)/settings/page.tsx#L453) and ~`798`, `804`, `808`, `814`, `867`, `871` — there is a `brandLogoUpgradeOpen` popover (NOT the full `UpgradeModal`). It is a tooltip-style affordance that points the user toward upgrading, not a checkout initiator. **No direct call to `openUpgradeCheckout` or Paddle.Checkout.**

**Dashboard banners / admin tools:** searched. No other `openUpgradeCheckout`, `paddle.Checkout.open`, or `UpgradeModal` usage anywhere in the app surface. Admin tools manipulate billing via `/api/admin/workspaces/actions` (manual override / set_plan), not via the checkout flow.

**Summary:** the ONLY two entry points to checkout today are:
1. **`UpgradeModal` button** (rendered by `InviteMemberModal` on plan-limit-hit, and elsewhere). Its `handleUpgradeClick` calls `openUpgradeCheckout(...)`.
2. **`BillingTab` CTAs** in `PlansAndPricingView`, whose `onUpgrade` callback resolves to `BillingTab.handleCheckout(...)` → `openUpgradeCheckout(...)`.

Both flow through the same `openUpgradeCheckout` helper, which is the **single point of redirect-rewiring** for Phase 3.

---

## Section 3 — Type Shapes & Callers

### 3.1 `lib/billing/payments/types.ts` (full contents)

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
 14    priceId: string;
 15    customData: Record<string, string>; // includes { workspaceId }
 16    customerEmail: string;
 17    customerId?: string | null; // pass to Paddle.Checkout.open if existing
 18  }
 19
 20  export interface PortalParams {
 21    customerId: string;
 22    returnUrl: string;
 23  }
 24
 25  export interface PortalResult {
 26    portalUrl: string;
 27  }
 28
 29  export type WebhookEvent =
 30    | { type: "subscription_started"; eventId: string; data: { subscriptionId: string; customerId: string; workspaceId: string | null; }; }
 31    | { type: "subscription_updated"; eventId: string; data: { subscriptionId: string }; }
 32    | { type: "subscription_canceled"; eventId: string; data: { subscriptionId: string }; }
 33    | { type: "payment_failed"; eventId: string; data: { subscriptionId: string | null; customerId: string | null; customerEmail?: string; }; }
 34    | { type: "unknown"; eventId: string; data: Record<string, unknown>; };
 35
 36  […SubscriptionData, ProrationMode, TransactionSummary, PaymentProvider interface…]
121  }
```

(Full file at [lib/billing/payments/types.ts](../../lib/billing/payments/types.ts).)

### 3.2 `CheckoutResult` callers

Production code references (excluding `node_modules`, `docs/audits`):

| File:line | Construction or consumption | Fields touched | Survives collapse to `{ url }`? |
|-----------|-----------------------------|----------------|----------------------------------|
| [lib/billing/payments/types.ts:13](../../lib/billing/payments/types.ts#L13) | Type definition | — | n/a (the definition itself changes) |
| [lib/billing/payments/types.ts:96](../../lib/billing/payments/types.ts#L96) | `createCheckoutSession` signature | — | n/a |
| [lib/billing/payments/paddle.ts:13](../../lib/billing/payments/paddle.ts#L13) | Type import | — | — |
| [lib/billing/payments/paddle.ts:62](../../lib/billing/payments/paddle.ts#L62) | `PaddleProvider.createCheckoutSession` returns `{ priceId, customData, customerEmail, customerId }` | All four | **No** — Paddle path would break, but Paddle is being retired in this migration. |
| [lib/billing/payments/stripe.ts:5](../../lib/billing/payments/stripe.ts#L5) | Type import | — | — |
| [lib/billing/payments/stripe.ts:62](../../lib/billing/payments/stripe.ts#L62) | Stub — `throw "not yet implemented"` | None (stub) | **Yes** — Phase 3 implements this; collapsing the type fits naturally. |
| [app/api/billing/checkout/route.ts:74](../../app/api/billing/checkout/route.ts#L74) | Consumes `result.priceId`, `result.customData`, `result.customerEmail`, `result.customerId` (lines 87–90) | All four | **No, as-is** — the route currently propagates all four to the client. Phase 3 rewrites the route to forward `result.url` only. |

**Conclusion:** collapsing `CheckoutResult` to `{ url: string }` requires:
1. Update `types.ts` to make `CheckoutResult = { url: string }` (or replace with a Stripe-shaped type; see Section 8 for the trade-off).
2. `paddle.ts` `createCheckoutSession` becomes dead code — `PaddleProvider` retains its other methods but this one will fail to compile. **However**, since Paddle is being fully retired, this is the expected outcome of the migration. If we want a clean intermediate state, leave `paddle.ts` returning a placeholder `{ url: "" }` or remove `PaddleProvider` entirely in a separate step.
3. `app/api/billing/checkout/route.ts` returns `{ url: result.url }` only.
4. `lib/billing/openUpgradeCheckout.ts` rewrites to redirect — no overlay open.

### 3.3 `CheckoutParams` callers

Production code references:

| File:line | Construction or consumption | Fields passed/read | All still needed for Stripe Checkout Sessions API? |
|-----------|-----------------------------|---------------------|------------------------------------------------------|
| [lib/billing/payments/types.ts:1](../../lib/billing/payments/types.ts#L1) | Definition | — | n/a |
| [lib/billing/payments/paddle.ts:12](../../lib/billing/payments/paddle.ts#L12), `:61` | Implementer | Reads `billingCycle`, `workspaceId`, `ownerEmail`, `existingCustomerId`. **Does NOT read** `workspaceName`, `ownerUid`, `seatCount`, `successUrl`, `cancelUrl` (Paddle never used those — it's a client-overlay flow). | n/a — retired. |
| [lib/billing/payments/stripe.ts:4](../../lib/billing/payments/stripe.ts#L4), `:62` | Stub | None (stub) | — |
| [app/api/billing/checkout/route.ts:74](../../app/api/billing/checkout/route.ts#L74) | Constructor — passes all nine fields. | All nine. | **Mostly yes.** See below. |

**Stripe Checkout Session field mapping** (from the existing `CheckoutParams`):

| `CheckoutParams` field | Stripe Checkout Session API usage |
|------------------------|-----------------------------------|
| `workspaceId` | → `metadata.workspaceId` on the session **AND** `subscription_data.metadata.workspaceId` (so it propagates to the Subscription, which is what the webhook reads). |
| `workspaceName` | Currently unused by Paddle. Useful for `customer_creation` or invoice descriptions, but **not strictly needed** — can be dropped if we're not customizing those. |
| `ownerEmail` | → `customer_email` (or assign during `customer` lookup) |
| `ownerUid` | → `metadata.ownerUid` (optional — only the webhook needs the workspace, but ownerUid is a useful audit field). |
| `seatCount` | → `line_items[0].quantity` |
| `billingCycle` | → resolves to `line_items[0].price` via `resolveBusinessPriceId()` |
| `successUrl` | → `success_url` |
| `cancelUrl` | → `cancel_url` |
| `existingCustomerId` | → `customer` (when set; falls back to `customer_email`) |

**Conclusion:** all nine fields map cleanly. `workspaceName` is the only optional drop; keep it for now (no cost, useful later for invoice metadata).

---

## Section 4 — Env Var Usage

### 4.1 `NEXT_PUBLIC_APP_URL` read sites (production code)

Production read sites (excluding `node_modules`, `docs/audits`):

| File:line | Pattern |
|-----------|---------|
| [lib/email/billingEmails.ts:17](../../lib/email/billingEmails.ts#L17) | `const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";` |
| [lib/email/workspaceEmails.ts:27](../../lib/email/workspaceEmails.ts#L27) | same fallback |
| [lib/email/urls.ts:11](../../lib/email/urls.ts#L11) | same fallback |
| [lib/email/sendEmailWithPreferences.ts:11](../../lib/email/sendEmailWithPreferences.ts#L11) | same fallback |
| [lib/email/planLimitDispatch.server.ts:14](../../lib/email/planLimitDispatch.server.ts#L14) | same fallback |
| [app/api/auth/forgot-password/route.ts:77](../../app/api/auth/forgot-password/route.ts#L77) | same fallback |
| [app/api/auth/send-verification/route.ts:83](../../app/api/auth/send-verification/route.ts#L83) | same fallback |
| [app/api/billing/portal/route.ts:45](../../app/api/billing/portal/route.ts#L45) | `req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai"` |
| [app/api/billing/webhook/route.ts:16](../../app/api/billing/webhook/route.ts#L16) | same simple fallback |
| [app/api/billing/checkout/route.ts:70](../../app/api/billing/checkout/route.ts#L70) | `req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai"` |
| [app/api/users/send-password-reset/route.ts:42](../../app/api/users/send-password-reset/route.ts#L42) | same |
| [app/api/users/confirm-email-change/route.ts:10](../../app/api/users/confirm-email-change/route.ts#L10) | same |
| [app/api/users/change-email/route.ts:12](../../app/api/users/change-email/route.ts#L12) | same |
| [app/api/sessions/[sessionId]/access-requests/route.ts:22](../../app/api/sessions/[sessionId]/access-requests/route.ts#L22) | same |
| [app/api/sessions/[sessionId]/invite/route.ts:22](../../app/api/sessions/[sessionId]/invite/route.ts#L22) | same |
| [app/api/sessions/[sessionId]/request-access/route.ts:24](../../app/api/sessions/[sessionId]/request-access/route.ts#L24) | same |

**Pattern:** every read site uses the same fallback chain. The checkout/portal routes prefer `req.headers.get("origin")` first (lets the URL track the actual request origin, useful for previews); everything else uses the env var with a `https://annote.ai` fallback.

### 4.2 `.env.example` declaration

`NEXT_PUBLIC_APP_URL` is declared (commented) at [.env.example:24](../../.env.example#L24):
```
# Public app URL — used in email links (no trailing slash).
# NEXT_PUBLIC_APP_URL=https://annote.ai
```

**`.env.local`** is git-ignored per [.gitignore:34-35](../../.gitignore#L34-L35) (`.env*` with `!.env.example`). Not read by this audit.

### 4.3 Stripe SDK import sites

Searched the entire repo for `from "stripe"` and `require("stripe")` and `import.*\bStripe\b`. The only hits:

- [lib/billing/payments/stripe.ts:1](../../lib/billing/payments/stripe.ts#L1) — `import Stripe from "stripe";` (the provider class itself)
- [lib/billing/payments/index.ts:21](../../lib/billing/payments/index.ts#L21) — dynamic `require("./stripe")` of the local module (NOT a `stripe` SDK import; just the lazy-load of the provider class).

**Confirmed: zero other Stripe SDK imports.** The SDK boundary is cleanly contained inside `lib/billing/payments/stripe.ts`.

---

## Section 5 — Stripe Checkout Integration Pre-Requisites

### 5.1 `STRIPE_*` env vars in `.env.example`

Declared block in [.env.example:58-70](../../.env.example#L58-L70):

```
# ─── Stripe (Phase 1: scaffold, dormant unless PAYMENT_PROVIDER=stripe) ───
# Test mode keys from https://dashboard.stripe.com/test/apikeys
# STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# STRIPE_SECRET_KEY=sk_test_xxxxx

# Price IDs from https://dashboard.stripe.com/test/products
# Both must point to the same Stripe Product ("Annote Business").
# STRIPE_BUSINESS_PRICE_MONTHLY_ID=price_xxxxx
# STRIPE_BUSINESS_PRICE_ANNUAL_ID=price_xxxxx

# Webhook signing secret from https://dashboard.stripe.com/test/webhooks
# (added in Phase 4 — leave empty for now)
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**All five env vars are present** (commented):
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_BUSINESS_PRICE_MONTHLY_ID`
- ✅ `STRIPE_BUSINESS_PRICE_ANNUAL_ID`
- ✅ `STRIPE_WEBHOOK_SECRET` (declared early — Phase 4 hasn't wired it up yet)

For Phase 3, only `STRIPE_SECRET_KEY` and the two price IDs are read. `STRIPE_PUBLISHABLE_KEY` is not used by the hosted-redirect flow (no client SDK). `STRIPE_WEBHOOK_SECRET` belongs to Phase 4.

### 5.2 Current `StripeProvider.createCheckoutSession()` stub

From [lib/billing/payments/stripe.ts:62-69](../../lib/billing/payments/stripe.ts#L62-L69):

```ts
 62    async createCheckoutSession(_params: CheckoutParams): Promise<CheckoutResult> {
 63      // PHASE 3: this will actually call stripe.checkout.sessions.create() and return { url }.
 64      // For now, stub — Phase 1 only scaffolds the class.
 65      void getStripe;
 66      throw new Error(
 67        "[stripe] createCheckoutSession is not yet implemented (Phase 3)."
 68      );
 69    }
```

The Phase 1 comment on line 63 explicitly anticipates the `{ url }` collapse — this aligns with the type change described in §3.2.

### 5.3 Current `StripeProvider.resolveBusinessPriceId()` (already functional)

From [lib/billing/payments/stripe.ts:49-60](../../lib/billing/payments/stripe.ts#L49-L60):

```ts
 49    resolveBusinessPriceId(billingCycle: "monthly" | "annual"): string {
 50      const id =
 51        billingCycle === "annual"
 52          ? process.env.STRIPE_BUSINESS_PRICE_ANNUAL_ID
 53          : process.env.STRIPE_BUSINESS_PRICE_MONTHLY_ID;
 54      if (!id) {
 55        throw new Error(
 56          `[stripe] Missing STRIPE_BUSINESS_PRICE_${billingCycle === "annual" ? "ANNUAL" : "MONTHLY"}_ID env var.`
 57        );
 58      }
 59      return id;
 60    }
```

**Ready for Phase 3.** `createCheckoutSession` will call `this.resolveBusinessPriceId(params.billingCycle)` to fill `line_items[0].price`.

The SDK singleton (lines 18–39) is also ready: `getStripe()` instantiates the SDK with a pinned API version (`2026-04-22.dahlia`) and an `appInfo` block. No changes needed for Phase 3.

---

## Section 6 — Downstream Effects — What We Must Not Break

### 6.1 Other UI surfaces opening the Paddle overlay

**No other surfaces** open the Paddle overlay outside of `UpgradeModal` and `BillingTab`. Both paths funnel through `openUpgradeCheckout`. Confirmed:
- `InviteMemberModal` opens `<UpgradeModal>` on `PLAN_LIMIT_REACHED` — the modal then routes to `openUpgradeCheckout`. Not a direct Paddle call.
- The brand-logo upgrade popover ([app/(app)/settings/page.tsx:798](../../app/(app)/settings/page.tsx#L798) area) is a tooltip-style affordance, not a checkout trigger.
- No test or script calls `openUpgradeCheckout` directly. (Repo has **no test runner** — `package.json` lacks any `test` / `vitest` / `jest` script. The only `*.test.*` / `*.spec.*` matches are inside `node_modules`.)

### 6.2 `?upgraded=true` query parameter read sites

Production code (excluding `node_modules` / `docs/audits`):

| File:line | Pattern |
|-----------|---------|
| [app/(app)/settings/page.tsx:3211](../../app/(app)/settings/page.tsx#L3211) | `if (searchParams.get("upgraded") === "true") setBillingError(null);` — clears stale errors on return. |
| [app/(app)/settings/page.tsx:3411](../../app/(app)/settings/page.tsx#L3411) | `{searchParams.get("upgraded") === "true" && (... "You're on the Business plan now ...")}` — inline success banner. |
| [lib/billing/openUpgradeCheckout.ts:76](../../lib/billing/openUpgradeCheckout.ts#L76) | Builds the Paddle `successUrl` with `&upgraded=true`. (Going away in Phase 3 — the server route is the only place that should produce this URL.) |
| [app/api/billing/checkout/route.ts:85](../../app/api/billing/checkout/route.ts#L85) | Builds the same URL server-side. (Stays.) |

The only consumer of `?upgraded=true` is `BillingTab`. The `UpgradeCheckoutBridge` (which owns the post-checkout success modal) does NOT read it today — it listens to `CHECKOUT_COMPLETED`. **After Phase 3, `UpgradeCheckoutBridge` will need to also read `?upgraded=true` to know when to open the modal.**

**No other URL params** are consumed by the post-checkout flow. There is no `session_id` parameter today (Paddle doesn't propagate one). Stripe Checkout can be configured to include `{CHECKOUT_SESSION_ID}` in `success_url`, but it's NOT required for the current flow — the webhook handles all state writes and the bridge polls the Firestore workspace doc.

### 6.3 Features that depend on the in-modal `CHECKOUT_COMPLETED` event

Two listeners fire on `CHECKOUT_COMPLETED` today:

1. **`UpgradeCheckoutBridge.onEvent`** ([app/(app)/settings/page.tsx:241](../../app/(app)/settings/page.tsx#L241)):
   - Sets `showSuccessModal = true`.
   - Calls `refetchUsage()` (warms the BillingUsageProvider).

2. **`BillingTab.usePaddle({ onEvent })`** ([app/(app)/settings/page.tsx:3220](../../app/(app)/settings/page.tsx#L3220)):
   - Clears `billingError` and `checkoutLoading`.
   - Note: there are TWO sibling `usePaddle` subscriptions today; the dispatcher fans every event to both.

3. **`UpgradeModal.onEvent`** ([components/billing/UpgradeModal.tsx:66-87](../../components/billing/UpgradeModal.tsx#L66-L87)):
   - Calls `fetchBillingUsage()` + `billingStore.setBilling(data)` (the older billingStore path, predates the BillingUsageProvider/realtime workspace doc).
   - Calls `onClose()` to close the modal.
   - Error/closed events update `checkoutError` and `checkoutLoading`.

**Phase 3 replacement:** all three of these become moot — the page is leaving for Stripe. After return:
- `UpgradeCheckoutBridge` reads `?upgraded=true` instead and triggers the modal + `refetchUsage()`.
- `BillingTab` no longer needs a Paddle listener at all. The `?upgraded=true` effect already clears `billingError`.
- `UpgradeModal`'s entire `onEvent` block goes away. The modal is unmounted before the redirect happens (we should `onClose()` synchronously right before the redirect — see §8.1 for the unmount-safety note).

**No analytics / telemetry calls** fire on these events anywhere in the codebase. The closest is `logAdminAction` server-side in the webhook (lines 196–219 of the webhook route) — but that's webhook-driven and survives the Paddle→Stripe transition unchanged.

### 6.4 Analytics / telemetry calls in the checkout flow

**None.** Searched for `posthog`, `mixpanel`, `gtag`, `analytics\.track` in `components/billing/`, `lib/billing/`, and the settings page checkout region. Zero hits.

The only logging in this path is `console.error(...)` for failed checkouts ([components/billing/UpgradeModal.tsx:132](../../components/billing/UpgradeModal.tsx#L132), [app/(app)/settings/page.tsx:3259](../../app/(app)/settings/page.tsx#L3259), [app/api/billing/checkout/route.ts:94](../../app/api/billing/checkout/route.ts#L94)) and server-side `logAdminAction` calls in the webhook.

**Zero risk** of breaking analytics in Phase 3.

---

## Section 7 — Stripe Checkout Session Requirements Reconciliation

### 7.1 Customer identification

- **First-upgrade customer ID:** `workspace.billing.customerId` is set for the first time by the webhook at [app/api/billing/webhook/route.ts:211](../../app/api/billing/webhook/route.ts#L211) (Paddle today), in `handleSubscriptionStarted`. Before the first successful checkout, it's `null`.
- **Existing customer scenario:** if a workspace upgraded once then was canceled/comped back, `billing.customerId` persists on the workspace doc (the cancel handler at [app/api/billing/webhook/route.ts:336-344](../../app/api/billing/webhook/route.ts#L336-L344) clears `subscriptionId` and resets `plan` but does NOT clear `customerId`).
- **Different workspace, same person:** customer IDs are per-workspace, not per-user. If the same user upgrades workspace A then tries to upgrade workspace B, workspace B has its own `billing.customerId === null`, so Stripe will create a new Customer keyed off `ownerEmail`. This may produce duplicate Stripe Customers for the same email — typical for B2B SaaS and acceptable.
- **Paddle branching today** ([lib/billing/payments/paddle.ts:60-74](../../lib/billing/payments/paddle.ts#L60-L74)):
  ```ts
  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    const priceId = this.resolveBusinessPriceId(params.billingCycle);
    return {
      priceId,
      customData: { workspaceId: params.workspaceId },
      customerEmail: params.ownerEmail,
      customerId: params.existingCustomerId ?? null,
    };
  }
  ```
  No real branching — Paddle returns both `customerEmail` and `customerId`, and the client overlay (in `openUpgradeCheckout.ts:71-73`) picks one: `data.customerId ? { id: data.customerId } : { email: data.customerEmail }`.
- **Stripe equivalent:** pass `customer: existingCustomerId` when set; otherwise pass `customer_email: ownerEmail`. (Stripe Checkout will create a Customer from the email on success.) Simpler than the Paddle branching because Stripe accepts both fields on the same call (`customer_email` is ignored when `customer` is set).

### 7.2 `customData` (Paddle) → `metadata` (Stripe)

- **Today:** `customData = { workspaceId }` ([lib/billing/payments/paddle.ts:67-70](../../lib/billing/payments/paddle.ts#L67-L70)).
- **Webhook read site:** [lib/billing/payments/paddle.ts:336-345](../../lib/billing/payments/paddle.ts#L336-L345) inside `normalizePaddleEvent`:
  ```ts
  workspaceId:
    (data.customData as Record<string, unknown> | null)?.["workspaceId"] != null
      ? String((data.customData as Record<string, unknown>)["workspaceId"])
      : null,
  ```
  Read by `handleSubscriptionStarted` ([app/api/billing/webhook/route.ts:116](../../app/api/billing/webhook/route.ts#L116)) as the primary workspace-resolution path (fallback at line 117–126: query by `billing.customerId`).
- **Stripe equivalent:** pass `metadata: { workspaceId }` on the Checkout Session **AND** `subscription_data.metadata: { workspaceId }` so it propagates to the resulting Subscription. The webhook in Phase 4 will read `event.data.object.metadata.workspaceId` from `subscription.created` / `customer.subscription.created`.

### 7.3 Seat count source & enforcement

- **Client:** `UpgradeModal` derives `seatCount` from `seatCountProp` (passed in from Plans view) clamped to `memberFloor = max(memberCount, 1)` ([components/billing/UpgradeModal.tsx:103-107](../../components/billing/UpgradeModal.tsx#L103-L107)). For `BillingTab.handleCheckout`, the `seatCount` argument is optional.
- **Wire:** the client sends `{ billingCycle, seatCount }` in the POST body ([lib/billing/openUpgradeCheckout.ts:42](../../lib/billing/openUpgradeCheckout.ts#L42)).
- **Server enforcement:** [app/api/billing/checkout/route.ts:58-68](../../app/api/billing/checkout/route.ts#L58-L68). The server clamps to `max(requested, floor)` where `floor = max(memberCount, 1)`. Comment on line 58: *"Server is the source of truth for the floor. The client may request a HIGHER seat count (planning ahead) but never lower than the actual member count — this defends against client-side seat-count tampering."*
- **Stripe Checkout equivalent:** `line_items[0].quantity = seatCount` from the server-clamped value. (Optionally `adjustable_quantity: { enabled: true, minimum: floor, maximum: ... }` on the line item if we want Stripe-side UX for the user to bump seats during checkout — out of scope for Phase 3 unless desired.)

### 7.4 Billing cycle resolution

- **Client → server:** `{ billingCycle: "monthly" | "annual" }` in the POST body ([lib/billing/openUpgradeCheckout.ts:42](../../lib/billing/openUpgradeCheckout.ts#L42)).
- **Server normalization:** [app/api/billing/checkout/route.ts:55-56](../../app/api/billing/checkout/route.ts#L55-L56) — `body.billingCycle === "annual" ? "annual" : "monthly"` (everything not literally "annual" defaults to monthly).
- **Server → priceId:** today, the route forwards `billingCycle` to `provider.createCheckoutSession(...)` and the provider resolves it. `PaddleProvider.createCheckoutSession` calls `this.resolveBusinessPriceId(params.billingCycle)` ([lib/billing/payments/paddle.ts:63](../../lib/billing/payments/paddle.ts#L63)). `StripeProvider.resolveBusinessPriceId` ([lib/billing/payments/stripe.ts:49-60](../../lib/billing/payments/stripe.ts#L49-L60)) is already implemented and reads `STRIPE_BUSINESS_PRICE_MONTHLY_ID` / `STRIPE_BUSINESS_PRICE_ANNUAL_ID`. **Phase 3 just calls it.**

### 7.5 Success / cancel URLs

- **Success URL today:** built in TWO places (an existing minor duplication):
  - Client overlay: `${window.location.origin}/settings?tab=billing&upgraded=true` ([lib/billing/openUpgradeCheckout.ts:76](../../lib/billing/openUpgradeCheckout.ts#L76)). Paddle uses this to redirect the user post-completion within the overlay's "success" view. After Phase 3 this line is deleted along with the file's overlay logic.
  - Server param: `${origin}/settings?tab=billing&upgraded=true` ([app/api/billing/checkout/route.ts:85](../../app/api/billing/checkout/route.ts#L85)). Today this is passed to `provider.createCheckoutSession` but `PaddleProvider` doesn't use it (Paddle has its own URL flow). Stripe will use it directly as `success_url`.
- **Cancel URL today:** `${origin}/settings?tab=billing` ([app/api/billing/checkout/route.ts:86](../../app/api/billing/checkout/route.ts#L86)). Passed to the provider; ignored by Paddle (Paddle's overlay close is purely client-side — the modal stays open, user can re-engage). Stripe will use this directly as `cancel_url` and the user returns to the billing tab without the `?upgraded=true` flag.

**Phase 3 action:** the server already produces both URLs correctly. The provider implementation in `StripeProvider.createCheckoutSession` just passes them through.

---

## Section 8 — Risk Flags

### 8.1 Code paths that break if the upgrade modal stays open during a redirect

Two state-setting paths run AFTER `openUpgradeCheckout(...)` returns today:
- [components/billing/UpgradeModal.tsx:136](../../components/billing/UpgradeModal.tsx#L136): `setCheckoutLoading(false)` inside the catch.
- [app/(app)/settings/page.tsx:3265](../../app/(app)/settings/page.tsx#L3265): `setCheckoutLoading(false)` inside the catch.

These are only reached on SYNCHRONOUS errors before redirect — they're already inside `try/catch`, so a "thrown before redirect" outcome leaves the modal cleanly in an error state. No unmount-after-navigation hazard here because the page navigates away (full HTTP redirect, not a client-side route push) and the JS state is discarded.

**However**, two subtle items:
- `fetchBillingUsage().then(...)` in [components/billing/UpgradeModal.tsx:72-76](../../components/billing/UpgradeModal.tsx#L72-L76) — this whole block goes away with the Paddle event handler, so it's not a concern.
- `void refetchUsage()` in [app/(app)/settings/page.tsx:246](../../app/(app)/settings/page.tsx#L246) — this is in the bridge, fired on `CHECKOUT_COMPLETED`. After Phase 3, when the user returns with `?upgraded=true`, calling `refetchUsage()` on a freshly-mounted page is fine.

**Recommendation:** in the new `handleCheckout`, call `onClose()` (close the modal) right before `window.location.assign(url)`. This dismisses the modal cleanly so the user doesn't see it briefly during the redirect lag.

### 8.2 Code that assumes `Paddle.Checkout.open` is synchronous-feeling

- [components/billing/UpgradeModal.tsx:127-130](../../components/billing/UpgradeModal.tsx#L127-L130): sets `checkoutLoading = true` BEFORE calling `openUpgradeCheckout`, with a comment "Loading state is cleared by checkout.completed / closed / error events." With a redirect-based flow, the loading state is cleared when the page leaves — but during the XHR window (a few hundred ms), the button shows "Loading…" which is correct UX. **No code change needed**, just a comment update: loading is cleared by navigation (success path) or thrown error (error path).
- [app/(app)/settings/page.tsx:3253-3257](../../app/(app)/settings/page.tsx#L3253-L3257): same pattern, same outcome.

### 8.3 Dead code after Phase 3

Becomes unreachable / removable:

| File | Reason |
|------|--------|
| [lib/hooks/usePaddle.ts](../../lib/hooks/usePaddle.ts) | Stripe has no client SDK in this flow. Delete entirely. |
| `@paddle/paddle-js` import in [components/billing/UpgradeModal.tsx:13](../../components/billing/UpgradeModal.tsx#L13) and [app/(app)/settings/page.tsx:55](../../app/(app)/settings/page.tsx#L55) | Remove. |
| `usePaddle({ onEvent })` blocks in `UpgradeModal`, `UpgradeCheckoutBridge`, and `BillingTab` | Remove. |
| `fetchBillingUsage` + `billingStore.setBilling` in `UpgradeModal` (lines 11–12, 72–76) | Only used inside the Paddle event handler — becomes dead. Can be left if `billingStore` is referenced elsewhere; otherwise also a candidate for removal. (Out of scope for Phase 3 audit; flag for Phase 5/6.) |
| `CheckoutResponse` interface in [openUpgradeCheckout.ts:6-12](../../lib/billing/openUpgradeCheckout.ts#L6-L12) | Collapses to `{ url: string }`. |

**Provider abstraction note:** `PaddleProvider.createCheckoutSession` (paddle.ts:60-74) becomes dead in production once `PAYMENT_PROVIDER=stripe`. The Phase 3 type collapse of `CheckoutResult` to `{ url: string }` will make `paddle.ts` fail to compile unless we (a) leave it returning a placeholder, (b) split the type into provider-specific variants, or (c) remove `PaddleProvider` entirely. See Section 9 "biggest unknowns."

### 8.4 Tests exercising the upgrade flow

**None.** The repo has no test runner. `package.json` has scripts `dev`, `build`, `start`, `lint`, `build:extension:*` — no `test`. All `*.test.*` / `*.spec.*` matches are in `node_modules`.

**Manual testing reference:** [PADDLE_TESTING.md](../../PADDLE_TESTING.md) lists T14 ("Verify billing surfaces update after upgrade") and other manual scenarios. Phase 3 should produce an updated Stripe-equivalent manual test plan, but no automated tests need to be updated.

---

## Section 9 — Summary Table

| Concern | Status | Lines / Files | Phase 3 action |
|---|---|---|---|
| Paddle overlay invocation | Single site | [lib/billing/openUpgradeCheckout.ts:63-78](../../lib/billing/openUpgradeCheckout.ts#L63-L78) | Replace `paddle.Checkout.open(...)` with `window.location.assign(json.data.url)` |
| Event subscription (`CHECKOUT_COMPLETED` etc.) | Three sites | UpgradeModal.tsx:64-88, settings/page.tsx:239-249 (bridge), :3218-3234 (BillingTab) | Delete all three `usePaddle({ onEvent })` blocks; replace bridge trigger with `?upgraded=true` query-param effect |
| `usePaddle` hook | Single file | [lib/hooks/usePaddle.ts](../../lib/hooks/usePaddle.ts) | Delete file. Remove three imports (UpgradeModal:9, settings:48, and the hook itself) |
| `openUpgradeCheckout` signature | Single file, two call sites | [lib/billing/openUpgradeCheckout.ts](../../lib/billing/openUpgradeCheckout.ts); callers at UpgradeModal:129, settings:3256 | Rewrite to `openUpgradeCheckout({ billingCycle, seatCount? })` (no `paddle` param). Internally: POST + `window.location.assign(url)`. Returns `Promise<never>` on success (page leaves) or throws on error |
| `UpgradeModal` Paddle coupling | Imports + handler | [components/billing/UpgradeModal.tsx:9-13](../../components/billing/UpgradeModal.tsx#L9-L13), :64-88, :118-138 | Decouple: drop `usePaddle`, `CheckoutEventNames`, `fetchBillingUsage`/`billingStore` imports. `handleUpgradeClick` becomes pure `setLoading → call helper → catch errors`. UI is unchanged |
| Settings page checkout bridge | Two sub-components | [app/(app)/settings/page.tsx:235-257](../../app/(app)/settings/page.tsx#L235-L257), :3197-3267, :3411-3422 | Simplify: `UpgradeCheckoutBridge` watches `?upgraded=true` instead of Paddle events. Drop `BillingTab.usePaddle`. `?upgraded=true` banner stays |
| `CheckoutResult` type shape | Type def + 1 implementer + 1 stub + 1 route | [types.ts:13-18](../../lib/billing/payments/types.ts#L13-L18); paddle.ts:62; stripe.ts:62; route.ts:74-92 | Collapse to `{ url: string }`. Decide Paddle path: either retire `PaddleProvider.createCheckoutSession` or stub it to throw. (See unknowns) |
| API route response shape | Single file | [app/api/billing/checkout/route.ts:86-92](../../app/api/billing/checkout/route.ts#L86-L92) | Return `apiSuccess({ url: result.url })` only |
| `StripeProvider.createCheckoutSession` | Stub | [lib/billing/payments/stripe.ts:62-69](../../lib/billing/payments/stripe.ts#L62-L69) | Implement: `stripe.checkout.sessions.create({ mode: "subscription", line_items, customer or customer_email, success_url, cancel_url, metadata: { workspaceId }, subscription_data: { metadata: { workspaceId, ownerUid? } } })`. Return `{ url: session.url! }` |
| Customer ID handling | Existing field on workspace | [lib/billing/payments/paddle.ts:65-73](../../lib/billing/payments/paddle.ts#L65-L73) (today); [app/api/billing/checkout/route.ts:81](../../app/api/billing/checkout/route.ts#L81) (forwarded) | Stripe: pass `customer: existingCustomerId` if non-null, else `customer_email: ownerEmail`. `workspace.billing.customerId` semantics carry over unchanged (set by webhook on first successful checkout) |
| Success URL handling | Server-side already built | [app/api/billing/checkout/route.ts:70, :82, :85-86](../../app/api/billing/checkout/route.ts#L70) | Wire-through unchanged. Drop the duplicated client-side `successUrl` in `openUpgradeCheckout.ts:76` |

---

## Biggest Unknowns

1. **What to do with `PaddleProvider.createCheckoutSession` after the type collapse.** Once `CheckoutResult` becomes `{ url: string }`, the Paddle implementation either needs to (a) be retired in lockstep (`PaddleProvider` deleted, `lib/billing/payments/index.ts` only registers Stripe), (b) be kept but throw `"[paddle] checkout retired — use Stripe"`, or (c) be split into provider-specific `CheckoutResult` types. The Phase 1 audit ([docs/audits/phase1-preflight.md](./phase1-preflight.md#L301)) states "Paddle provider is the only supported provider going forward" — that comment is now stale relative to the migration. **Decision needed:** is Phase 3 the right moment to delete `paddle.ts`, or does it co-exist as dead code until Phase 4/5 retires it together with webhook code?

2. **Does Stripe Checkout need `client_reference_id` in addition to `metadata.workspaceId`?** Stripe Checkout supports both. `metadata` is the primary mechanism and propagates to the Subscription (which is what the webhook reads). `client_reference_id` is a flat top-level field that's also returned in the `checkout.session.completed` event. Today's Paddle path uses only `customData` (the metadata-equivalent). **Recommendation:** use `metadata.workspaceId` on both the Session AND `subscription_data.metadata` to mirror the Paddle "custom_data on subscription" model — but the architect should confirm before the webhook (Phase 4) is written, since the webhook lookup path depends on it.

3. **`UpgradeSuccessModal` re-trigger on URL refresh.** Today, the bridge is event-driven, so a refresh after upgrade doesn't re-open the success modal. After Phase 3, the modal opens whenever `?upgraded=true` is in the URL — a hard refresh would re-open it. **Two mitigations to choose between:** (a) the bridge `router.replace`s the URL to drop the query param immediately after opening the modal (clean, but a single-flight side effect inside a render-driven effect), or (b) the modal self-dismisses fast enough that re-opening on refresh is benign. Recommend (a) — it matches the "consumed once" semantics the Paddle event flow had.
