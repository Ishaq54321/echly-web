"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExtensionDetection } from "@/components/dashboard/hooks/useExtensionDetection";

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

type UseSessionEntryCtaResult = {
  isInstalled: boolean;
  startingRecorder: boolean;
  triggerCta: () => void;
};

type UseSessionEntryCtaOptions = {
  onRecorderFallback?: () => void;
};

export function useSessionEntryCta(options?: UseSessionEntryCtaOptions): UseSessionEntryCtaResult {
  const { isInstalled } = useExtensionDetection();
  const [startingRecorder, setStartingRecorder] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const onRecorderFallback = options?.onRecorderFallback;

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const openExtensionStore = useCallback(() => {
    window.open(CHROME_EXTENSION_URL, "_blank", "noopener,noreferrer");
  }, []);

  const startRecorder = useCallback(() => {
    if (startingRecorder) return;
    setStartingRecorder(true);

    let acknowledged = false;

    const cleanup = () => {
      window.removeEventListener("message", handleRecorderOpened);
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setStartingRecorder(false);
    };

    const handleRecorderOpened = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type !== "ECHLY_RECORDER_OPENED") return;
      acknowledged = true;
      cleanup();
    };

    window.addEventListener("message", handleRecorderOpened);
    window.postMessage({ type: "ECHLY_OPEN_RECORDER" }, "*");

    fallbackTimerRef.current = window.setTimeout(() => {
      if (!acknowledged) {
        onRecorderFallback?.();
      }
      cleanup();
    }, 300);
  }, [onRecorderFallback, startingRecorder]);

  const triggerCta = useCallback(() => {
    if (isInstalled) {
      startRecorder();
      return;
    }
    openExtensionStore();
  }, [isInstalled, openExtensionStore, startRecorder]);

  return { isInstalled, startingRecorder, triggerCta };
}
