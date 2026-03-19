"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useExtensionDetection } from "@/components/dashboard/hooks/useExtensionDetection";

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

function RecordingCursorIcon() {
  return (
    <div className="relative h-14 w-14">
      <div className="absolute inset-0 rounded-2xl bg-[#155DFC]/10" />
      <svg
        className="absolute inset-0 h-14 w-14 p-3 text-[#155DFC]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3.5" y="5" width="17" height="12.5" rx="2.25" />
        <circle cx="8.1" cy="9" r="1.9" fill="currentColor" stroke="none" />
        <path d="M13 11.4v4.9l4.2-2.45-4.2-2.45z" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export default function EmptySessionsCard() {
  const [animateIn, setAnimateIn] = useState(false);
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const [startingRecorder, setStartingRecorder] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const { isInstalled } = useExtensionDetection();

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const openExtensionStore = () => {
    window.open(CHROME_EXTENSION_URL, "_blank", "noopener,noreferrer");
  };

  const startRecorder = () => {
    if (startingRecorder) return;
    setShowFallbackHint(false);
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
    console.log("[ECHLY][DASHBOARD] Sending OPEN_RECORDER");
    window.postMessage({ type: "ECHLY_OPEN_RECORDER" }, "*");

    fallbackTimerRef.current = window.setTimeout(() => {
      if (!acknowledged) {
        setShowFallbackHint(true);
      }
      cleanup();
    }, 300);
  };

  const ctaLabel = isInstalled ? "Start Recording" : "Download Extension";
  const handleCtaClick = isInstalled ? startRecorder : openExtensionStore;

  return (
    <div
      className="max-w-[480px] mx-auto mt-16 rounded-2xl border border-neutral-200 bg-white shadow-sm p-8 md:p-10 text-center"
      style={{
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 140ms ease-out, transform 140ms ease-out",
        willChange: "opacity, transform",
      }}
    >
      <div className="text-[#155DFC] mx-auto">
        <RecordingCursorIcon />
      </div>

      <h2 className="mt-4 text-[26px] leading-[1.15] md:text-[30px] font-semibold text-[hsl(var(--text-primary-strong))]">
        Start your first feedback session
      </h2>

      <p className="mt-2 text-sm text-[hsl(var(--text-muted))] max-w-[360px] mx-auto leading-relaxed">
        Capture feedback directly on your website in seconds using the Echly extension.
      </p>

      <div className="mt-5 relative">
        <Button
          variant="primary"
          type="button"
          onClick={handleCtaClick}
          disabled={startingRecorder}
          className="h-11 w-full rounded-xl font-medium hover:scale-[1.02] transition-transform duration-[150ms] ease-out"
          aria-label={ctaLabel}
        >
          {ctaLabel}
        </Button>

        {showFallbackHint && (
          <p
            className="mt-2 text-xs text-[hsl(var(--text-muted))]"
            role="status"
            aria-live="polite"
          >
            Click the Echly extension in your browser toolbar
          </p>
        )}

        <p className="text-xs text-[hsl(var(--text-muted))] mt-2">
          Takes less than 10 seconds
        </p>
      </div>
    </div>
  );
}

