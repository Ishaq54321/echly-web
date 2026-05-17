"use client";

import type { Paddle } from "@paddle/paddle-js";
import { authFetch } from "@/lib/authFetch";

export interface CheckoutResponse {
  priceId: string;
  customData: Record<string, string>;
  customerEmail: string;
  customerId: string | null;
  seatCount: number;
}

export interface OpenCheckoutOptions {
  paddle: Paddle;
  billingCycle: "monthly" | "annual";
  /**
   * Requested seat count. Optional — the server enforces the workspace
   * member-count floor regardless of what's sent here, so the value can be
   * higher than the floor but never lower.
   */
  seatCount?: number;
}

/**
 * Fetches checkout details from the API and opens the Paddle overlay.
 *
 * Event handling (checkout.completed / closed / error) is NOT done here —
 * Paddle.js dispatches events through the global eventCallback wired in
 * usePaddle. Each calling surface subscribes via usePaddle({ onEvent }) and
 * reacts to the events it cares about. This helper only opens the overlay.
 */
export async function openUpgradeCheckout(
  options: OpenCheckoutOptions
): Promise<void> {
  const { paddle, billingCycle, seatCount } = options;

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
    data?: CheckoutResponse;
    error?: { message?: string };
  } | null;

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(
      json?.error?.message ?? "Failed to start checkout. Please try again."
    );
  }

  const data = json.data;

  paddle.Checkout.open({
    items: [
      {
        priceId: data.priceId,
        quantity: data.seatCount,
      },
    ],
    customData: data.customData,
    customer: data.customerId
      ? { id: data.customerId }
      : { email: data.customerEmail },
    settings: {
      variant: "one-page",
      successUrl: `${window.location.origin}/settings?tab=billing&upgraded=true`,
    },
  });
}
