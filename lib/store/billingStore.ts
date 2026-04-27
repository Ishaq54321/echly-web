"use client";

import { useSyncExternalStore } from "react";

export type BillingState = {
  plan: string | null;
  feedbackTicketsUsed: number;
  feedbackTicketsLimit: number | null;
  seats: number;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  setBilling: (data: {
    plan: string | null;
    feedbackTicketsUsed: number;
    feedbackTicketsLimit: number | null;
    seats: number;
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: unknown) => void;
};

type BillingStoreSnapshot = Omit<BillingState, "setBilling" | "setLoading" | "setError">;

let snapshot: BillingStoreSnapshot = {
  plan: null,
  feedbackTicketsUsed: 0,
  feedbackTicketsLimit: null,
  seats: 1,
  isLoaded: false,
  isLoading: false,
  error: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Partial<BillingStoreSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): BillingStoreSnapshot {
  return snapshot;
}

function setBilling(data: {
  plan: string | null;
  feedbackTicketsUsed: number;
  feedbackTicketsLimit: number | null;
  seats: number;
}) {
  setSnapshot({
    plan: data.plan,
    feedbackTicketsUsed: data.feedbackTicketsUsed,
    feedbackTicketsLimit: data.feedbackTicketsLimit,
    seats: data.seats,
    isLoaded: true,
    error: null,
  });
}

function setLoading(loading: boolean) {
  setSnapshot({ isLoading: loading });
}

function setError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  setSnapshot({ error: message, isLoaded: false });
}

export const billingStore: BillingState = {
  get plan() { return snapshot.plan; },
  get feedbackTicketsUsed() { return snapshot.feedbackTicketsUsed; },
  get feedbackTicketsLimit() { return snapshot.feedbackTicketsLimit; },
  get seats() { return snapshot.seats; },
  get isLoaded() { return snapshot.isLoaded; },
  get isLoading() { return snapshot.isLoading; },
  get error() { return snapshot.error; },
  setBilling,
  setLoading,
  setError,
};

export function useBillingStore(): BillingState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...state,
    setBilling,
    setLoading,
    setError,
  };
}
