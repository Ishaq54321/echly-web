"use client";

import { useSyncExternalStore } from "react";

export type BillingState = {
  maxSessions: number | null;
  plan: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  setBilling: (data: { maxSessions: number | null; plan: string | null }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: unknown) => void;
};

type BillingStoreSnapshot = Omit<BillingState, "setBilling" | "setLoading" | "setError">;

let snapshot: BillingStoreSnapshot = {
  maxSessions: null,
  plan: null,
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

function setBilling(data: { maxSessions: number | null; plan: string | null }) {
  setSnapshot({
    maxSessions: data.maxSessions,
    plan: data.plan,
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
  get maxSessions() {
    return snapshot.maxSessions;
  },
  get plan() {
    return snapshot.plan;
  },
  get isLoaded() {
    return snapshot.isLoaded;
  },
  get isLoading() {
    return snapshot.isLoading;
  },
  get error() {
    return snapshot.error;
  },
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
