"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/empty/EmptyState";
import { useSessionEntryCta } from "@/components/dashboard/hooks/useSessionEntryCta";

export default function EmptySessionsCard() {
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const { isInstalled, startingRecorder, triggerCta } = useSessionEntryCta({
    onRecorderFallback: () => setShowFallbackHint(true),
  });

  const ctaLabel = isInstalled ? "Start Recording" : "Download Extension";
  const handleCtaClick = () => {
    setShowFallbackHint(false);
    triggerCta();
  };

  return (
    <EmptyState
      animate
      emphasis="prominent"
      media={
        <Image
          src="/illustrations/Welcome_card.png"
          alt="Welcome illustration"
          width={400}
          height={240}
          className="mx-auto h-auto w-[40%] max-w-[200px] object-contain"
        />
      }
      title="Start your first feedback session"
      description="Capture feedback directly on your website in seconds using the Echly extension."
    >
      <Button
        variant="primary"
        type="button"
        onClick={handleCtaClick}
        disabled={startingRecorder}
        className="h-11 w-full rounded-xl font-medium transition-transform duration-[150ms] ease-out hover:scale-[1.02]"
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

      <p className="mt-2 text-xs text-[hsl(var(--text-muted))]">Takes less than 10 seconds</p>
    </EmptyState>
  );
}
