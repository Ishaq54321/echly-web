"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicPermissionState =
  | "idle"
  | "granting"
  | "granted"
  | "denied"
  | "denied-permanent";

export interface UseMicPermissionResult {
  state: MicPermissionState;
  validatedDeviceId: string | null;
  availableMics: MediaDeviceInfo[];
  requestPermission: () => Promise<void>;
  openSiteSettings: () => void;
}

interface UseMicPermissionOptions {
  storedDeviceId: string | null;
  onValidatedDeviceId?: (id: string | null) => void;
}

export function useMicPermission({
  storedDeviceId,
  onValidatedDeviceId,
}: UseMicPermissionOptions): UseMicPermissionResult {
  const [state, setState] = useState<MicPermissionState>("idle");
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [validatedDeviceId, setValidatedDeviceId] = useState<string | null>(null);
  const callbackRef = useRef(onValidatedDeviceId);
  callbackRef.current = onValidatedDeviceId;

  const requestPermission = useCallback(async () => {
    let alreadyActive = false;
    setState((prev) => {
      if (prev === "granted" || prev === "granting") {
        alreadyActive = true;
        return prev;
      }
      return "granting";
    });
    if (alreadyActive) return;

    const startedAt =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
    } catch (err) {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsedMs = now - startedAt;
      const isPermanentByTiming = elapsedMs < 150;

      let permanent = isPermanentByTiming;
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.permissions &&
          typeof navigator.permissions.query === "function"
        ) {
          const status = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          if (status.state === "denied") permanent = true;
        }
      } catch {
        /* Permissions API not supported — fall back to timing heuristic */
      }

      console.warn("[ECHLY:MIC] permission denied", {
        elapsedMs,
        permanent,
        err,
      });
      setState(permanent ? "denied-permanent" : "denied");
    }
  }, [storedDeviceId]);

  /**
   * Listen for Permissions API state changes so the UI updates automatically
   * if the user grants/denies via the URL bar lock icon while the card is open.
   */
  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.permissions ||
      typeof navigator.permissions.query !== "function"
    ) {
      return;
    }

    let cancelled = false;
    let statusRef: PermissionStatus | null = null;
    const handleChange = () => {
      if (cancelled || !statusRef) return;
      if (statusRef.state === "granted") {
        void requestPermission();
      } else if (statusRef.state === "denied") {
        setState("denied-permanent");
      }
    };

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        statusRef = status;
        status.addEventListener("change", handleChange);
      })
      .catch(() => {
        /* not supported */
      });

    return () => {
      cancelled = true;
      statusRef?.removeEventListener("change", handleChange);
    };
  }, [requestPermission]);

  const openSiteSettings = useCallback(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const url = `chrome://settings/content/siteDetails?site=${encodeURIComponent(origin)}`;

    let opened: Window | null = null;
    try {
      opened = window.open(url, "_blank");
    } catch {
      opened = null;
    }

    if (opened) return;

    // Fallback: copy URL so user can paste it (chrome:// is usually blocked).
    try {
      void navigator.clipboard.writeText(url);
      alert(
        "Couldn't open settings directly. The URL is copied to your clipboard — paste it into your browser's address bar."
      );
    } catch {
      alert(
        `Please open this URL in a new tab to manage microphone access:\n\n${url}`
      );
    }
  }, []);

  return {
    state,
    validatedDeviceId,
    availableMics,
    requestPermission,
    openSiteSettings,
  };
}
