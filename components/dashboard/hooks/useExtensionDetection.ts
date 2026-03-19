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

    window.addEventListener("message", handleMessage);
    window.postMessage({ type: "ECHLY_EXTENSION_PING" }, "*");

    const timeoutId = window.setTimeout(() => {
      if (!responded && isActive) {
        setIsInstalled(false);
      }
    }, 500);

    return () => {
      isActive = false;
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return { isInstalled };
}
