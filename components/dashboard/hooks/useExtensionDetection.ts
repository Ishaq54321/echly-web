"use client";

import { useEffect, useState } from "react";

type ExtensionDetectionState = {
  isInstalled: boolean;
};

export function useExtensionDetection(): ExtensionDetectionState {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    let isActive = true;
    let responded = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type !== "ECHLY_EXTENSION_PONG") return;

      responded = true;
      if (isActive) {
        setIsInstalled(true);
      }
    };

    const ping = () => {
      window.postMessage({ type: "ECHLY_EXTENSION_PING" }, "*");
    };

    window.addEventListener("message", handleMessage);

    // The extension's content script answers a PING with a PONG and is always
    // installed at document_start, so it responds whenever it's present. Probe
    // immediately, then keep polling so an install that happens AFTER mount is
    // detected live — no page refresh required (the old code probed exactly
    // once on mount, which is why it only updated on reload).
    ping();
    let attempts = 0;
    const pollId = window.setInterval(() => {
      attempts += 1;
      if (responded || attempts >= 15) {
        window.clearInterval(pollId);
        return;
      }
      ping();
    }, 1000);

    // The user typically leaves the tab to install from the Web Store and comes
    // back — re-probe on focus/visibility for near-instant detection on return.
    const reprobe = () => {
      if (!responded) ping();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") reprobe();
    };
    window.addEventListener("focus", reprobe);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      isActive = false;
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", reprobe);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(pollId);
    };
  }, []);

  return { isInstalled };
}
