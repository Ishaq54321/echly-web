"use client";

import { useSyncExternalStore } from "react";

export type BillingState = {
  maxSessions: number | null;
  plan: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  setBilling: (data: { maxSessions: number | null; plan: string | null }) => void;
  setLoading: (loading: boolean) => void;
};

type BillingStoreSnapshot = Omit<BillingState, "setBilling" | "setLoading">;

let snapshot: BillingStoreSnapshot = {
  maxSessions: null,
  plan: null,
  isLoaded: false,
  isLoading: false,
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
  });
}

function setLoading(loading: boolean) {
  setSnapshot({ isLoading: loading });
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
  setBilling,
  setLoading,
};

export function useBillingStore(): BillingState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...state,
    setBilling,
    setLoading,
  };
}
