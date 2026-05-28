"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isMicBlockedBySitePolicy, isPolicyBlockError } from "../micSitePolicy";
import { useMicPermissionListener } from "./useMicPermissionListener";

export type MicPermissionState =
  | "idle" // not yet requested
  | "granting" // request in flight (browser prompt likely visible)
  | "granted"
  | "granted-just-now" // brief celebratory state after auto-recovery (~600ms)
  | "denied" // retryable (user dismissed prompt without choosing)
  | "denied-permanent" // browser-level block (user clicked Block / chrome://settings)
  | "site-blocked"; // page sent Permissions-Policy header disallowing mic

export interface UseMicPermissionResult {
  state: MicPermissionState;
  validatedDeviceId: string | null;
  availableMics: MediaDeviceInfo[];
  /** Resolves to the resulting state so callers can branch inside the user-gesture chain. */
  requestPermission: () => Promise<MicPermissionState>;
}

interface UseMicPermissionOptions {
  storedDeviceId: string | null;
  onValidatedDeviceId?: (id: string | null) => void;
  /**
   * Fired once after the permission auto-recovers from a denied state to
   * granted (user flipped it in browser settings). Lets the caller resume
   * the begin-recording flow that was interrupted.
   */
  onAutoRecover?: () => void;
}

/** ms the celebratory "granted-just-now" panel stays up before resuming. */
const AUTO_RECOVER_CELEBRATE_MS = 600;

/**
 * Query the Permissions API for the current microphone state. Returns null if
 * the API is unsupported (older browsers) so callers can fall back safely.
 */
async function queryMicPermission(): Promise<PermissionState | null> {
  try {
    if (
      typeof navigator === "undefined" ||
      !navigator.permissions ||
      typeof navigator.permissions.query !== "function"
    ) {
      return null;
    }
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return status.state;
  } catch {
    return null;
  }
}

export function useMicPermission({
  storedDeviceId,
  onValidatedDeviceId,
  onAutoRecover,
}: UseMicPermissionOptions): UseMicPermissionResult {
  const [state, setState] = useState<MicPermissionState>("idle");
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [validatedDeviceId, setValidatedDeviceId] = useState<string | null>(null);
  const callbackRef = useRef(onValidatedDeviceId);
  callbackRef.current = onValidatedDeviceId;
  const autoRecoverRef = useRef(onAutoRecover);
  autoRecoverRef.current = onAutoRecover;
  /** Synchronous guard so concurrent callers (Begin click + listener) don't race getUserMedia. */
  const inFlightRef = useRef(false);
  /** Latest state, readable synchronously inside the change listener. */
  const stateRef = useRef<MicPermissionState>("idle");
  stateRef.current = state;

  const requestPermission =
    useCallback(async (): Promise<MicPermissionState> => {
      if (inFlightRef.current) return "granting";

      // Pre-flight: is the site itself blocking mic via Permissions-Policy?
      // Short-circuit before getUserMedia — no prompt, no recovery, no point
      // letting the user "Try again" against something that can't succeed.
      if (isMicBlockedBySitePolicy()) {
        console.warn(
          "[Annote] Microphone blocked by site Permissions-Policy. " +
            "This site has disabled microphone via HTTP header — no user action can override.",
        );
        setState("site-blocked");
        return "site-blocked";
      }

      inFlightRef.current = true;
      setState("granting");

      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((d) => d.kind === "audioinput");
        setAvailableMics(inputs);

        let resolved: string | null = null;
        if (storedDeviceId && inputs.some((d) => d.deviceId === storedDeviceId)) {
          resolved = storedDeviceId;
        } else {
          const fallback =
            inputs.find((d) => d.deviceId === "default") ?? inputs[0] ?? null;
          resolved = fallback?.deviceId ?? null;
        }

        setValidatedDeviceId(resolved);
        callbackRef.current?.(resolved);

        tempStream.getTracks().forEach((t) => t.stop());

        setState("granted");
        return "granted";
      } catch (err) {
        // Did getUserMedia reject specifically because of Permissions-Policy?
        // Catches the case where neither policy API was exposed for the
        // pre-flight check but the rejection message still reveals the cause.
        if (isPolicyBlockError(err)) {
          console.warn(
            "[Annote] Microphone blocked by site Permissions-Policy " +
              "(detected via getUserMedia rejection) — no user action can override.",
          );
          setState("site-blocked");
          return "site-blocked";
        }

        // Otherwise classify via Permissions API truth, not a timing heuristic.
        const permState = await queryMicPermission();

        let next: MicPermissionState;
        if (permState === "denied") {
          // Truly blocked at the browser level.
          next = "denied-permanent";
        } else {
          // "prompt" → user dismissed without choosing; null/unexpected →
          // default to retryable (safer than a false permanent block).
          next = "denied";
        }

        console.warn("[Annote] Microphone request failed:", {
          name: (err as Error)?.name,
          message: (err as Error)?.message,
          permState,
          classified: next,
        });
        setState(next);
        return next;
      } finally {
        inFlightRef.current = false;
      }
    }, [storedDeviceId]);

  /**
   * Listen for Permissions API state changes so the UI auto-recovers if the
   * user grants/denies via browser settings (e.g. in another tab) while the
   * panel is open. This listener NEVER re-enters the request flow — it only
   * reflects the new permission value into local state, and (on a
   * denied→granted transition) plays a brief success state then signals the
   * caller to resume the interrupted begin-recording flow.
   *
   * Subscription mechanics live in useMicPermissionListener; this hook only
   * owns the classification + celebration state machine.
   */
  const celebrateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyPermissionState = useCallback((next: PermissionState) => {
    // Site-blocked is terminal for this page: the block is the site's
    // Permissions-Policy, not a user/browser permission. No flip of the
    // microphone permission can fix it, so ignore every change event and
    // stay put — otherwise a stray "granted"/"prompt" would wrongly clear
    // the site-blocked panel.
    if (stateRef.current === "site-blocked") return;
    if (next === "granted") {
      // Don't recursively call requestPermission from a listener; just
      // reflect that access is now available. The next user gesture
      // (Begin click) will open the actual stream.
      inFlightRef.current = false;
      const prev = stateRef.current;
      if (prev === "denied" || prev === "denied-permanent") {
        // Recovered from a blocked state — celebrate briefly, then resume
        // the flow the user originally clicked Begin for.
        setState("granted-just-now");
        if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
        celebrateTimerRef.current = setTimeout(() => {
          setState("granted");
          autoRecoverRef.current?.();
        }, AUTO_RECOVER_CELEBRATE_MS);
      } else if (prev !== "granted" && prev !== "granted-just-now") {
        setState("granted");
      }
    } else if (next === "denied") {
      setState("denied-permanent");
    } else {
      // "prompt" — reset to idle so the panel offers a fresh request.
      setState((prev) =>
        prev === "granted" ||
        prev === "granting" ||
        prev === "granted-just-now"
          ? prev
          : "idle",
      );
    }
  }, []);

  useMicPermissionListener({
    enabled: true,
    onChange: applyPermissionState,
  });

  /** Reflect the initial Permissions API state on mount so the panel shows
   *  the correct status without waiting for a transition. The listener hook
   *  only fires on change events, so we read once here. */
  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.permissions ||
      typeof navigator.permissions.query !== "function"
    ) {
      return;
    }
    let cancelled = false;
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        applyPermissionState(status.state);
      })
      .catch(() => {
        /* not supported — stays idle, request fires on Begin */
      });
    return () => {
      cancelled = true;
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    };
  }, [applyPermissionState]);

  return {
    state,
    validatedDeviceId,
    availableMics,
    requestPermission,
  };
}
