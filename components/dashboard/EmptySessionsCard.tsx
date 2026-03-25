"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useSessionEntryCta } from "@/components/dashboard/hooks/useSessionEntryCta";

export default function EmptySessionsCard() {
  const [animateIn, setAnimateIn] = useState(false);
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const { isInstalled, startingRecorder, triggerCta } = useSessionEntryCta({
    onRecorderFallback: () => setShowFallbackHint(true),
  });

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const ctaLabel = isInstalled ? "Start Recording" : "Download Extension";
  const handleCtaClick = () => {
    setShowFallbackHint(false);
    triggerCta();
  };

  return (
    <div
      className="mx-auto mt-16 max-w-xl rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm"
      style={{
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 140ms ease-out, transform 140ms ease-out",
        willChange: "opacity, transform",
      }}
    >
      <Image
        src="/illustrations/Welcome_card.png"
        alt="Welcome illustration"
        width={400}
        height={240}
        className="w-[40%] max-w-[200px] h-auto object-contain mx-auto mb-6"
      />

      <div className="px-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 whitespace-nowrap">
          Start your first feedback session
        </h2>

        <p className="text-base text-gray-600 text-center max-w-[640px] mx-auto mt-4">
          Capture feedback directly on your website in seconds using the Echly extension.
        </p>
      </div>

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

