"use client";

import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";

/** Mirror the existing debounce window in useMicPermission so back-to-back
 *  Permissions API events collapse into one observable transition. */
const STATE_DEBOUNCE_MS = 120;

export interface UseMicPermissionListenerOptions {
  /**
   * Toggle the subscription. When false the listener is torn down; when
   * flipped back to true a fresh subscription is created. Lets consumers
   * scope the listener to the narrow window where it's useful (e.g. only
   * while the pill is in a stalled state).
   */
  enabled: boolean;
  /** Fired on every Permissions API state transition while enabled. */
  onChange: (state: PermissionState) => void;
}

/**
 * Side-effect-only hook: subscribes to the Permissions API for "microphone"
 * and forwards every state transition to the consumer. Returns nothing — the
 * consumer owns whatever state machine reacts to the change.
 *
 * Gracefully no-ops on browsers where navigator.permissions is unavailable
 * or query() throws. Debounces back-to-back change events by 120ms to
 * collapse Chrome's occasional double-fires.
 */
export function useMicPermissionListener({
  enabled,
  onChange,
}: UseMicPermissionListenerOptions): void {
  /** Latest callback so consumers don't have to memoize. */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    if (
      typeof navigator === "undefined" ||
      !navigator.permissions ||
      typeof navigator.permissions.query !== "function"
    ) {
      return;
    }

    let cancelled = false;
    let statusRef: PermissionStatus | null = null;
    let debounceId: ReturnType<typeof setTimeout> | null = null;

    const handleChange = () => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        if (cancelled || !statusRef) return;
        const next = statusRef.state;
        logger.debug("mic-permission-listener", "state_change", { state: next });
        onChangeRef.current(next);
      }, STATE_DEBOUNCE_MS);
    };

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        statusRef = status;
        status.addEventListener("change", handleChange);
      })
      .catch(() => {
        /* Permissions API unsupported — degrade silently. */
      });

    return () => {
      cancelled = true;
      if (debounceId) clearTimeout(debounceId);
      statusRef?.removeEventListener("change", handleChange);
    };
  }, [enabled]);
}
