"use client";

import { authFetch } from "@/lib/authFetch";

export interface OpenCheckoutOptions {
  billingCycle: "monthly" | "annual";
  /**
   * Requested seat count. Optional — the server enforces the workspace
   * member-count floor regardless of what's sent here, so the value can be
   * higher than the floor but never lower.
   */
  seatCount?: number;
}

/**
 * Initiates upgrade checkout via Stripe-hosted Checkout.
 *
 * Flow:
 * 1. POST to /api/billing/checkout — server creates a Stripe Checkout Session
 * 2. Server returns { url } pointing to checkout.stripe.com
 * 3. We redirect the browser to that URL via window.location.assign
 * 4. After payment, Stripe redirects back to /settings?tab=billing&upgraded=true
 *
 * On success: the function does not return — the page navigates away.
 * On error (network/server/auth): throws an Error with a user-friendly message.
 */
export async function openUpgradeCheckout(
  options: OpenCheckoutOptions
): Promise<void> {
  const { billingCycle, seatCount } = options;

  const res = await authFetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // seatCount is advisory — the server clamps it to the member-count floor.
    body: JSON.stringify({ billingCycle, seatCount }),
  });

  if (!res) {
    throw new Error("Request failed. Please try again.");
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: { url: string };
    error?: { message?: string };
  } | null;

  if (!res.ok || !json?.success || !json.data?.url) {
    throw new Error(
      json?.error?.message ?? "Failed to start checkout. Please try again."
    );
  }

  // Redirect to Stripe-hosted Checkout. The browser leaves this page entirely.
  window.location.assign(json.data.url);
}
