"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
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
    <div className="w-full pt-8 pb-12">
      {/* Two-column split: text left, visual right */}
      <div className="flex flex-col lg:flex-row items-center gap-10">

        {/* Left column — text + CTAs */}
        <div className="flex-1 min-w-0 max-w-md">
          <h1 className="text-[44px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--text-heading)]">
            Capture feedback,<br />directly on your site.
          </h1>
          <p className="mt-7 text-[17px] leading-[1.7] font-medium text-[var(--text-body-strong)]">
            Record sessions, annotate screenshots, and collect actionable feedback from your team and clients — all in one place.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Button
              variant="primary"
              type="button"
              onClick={handleCtaClick}
              disabled={startingRecorder}
              className="h-11 px-6 rounded-[var(--radius-sm)] text-[15px] font-semibold transition-transform duration-150 ease-out hover:scale-[1.02]"
              aria-label={ctaLabel}
            >
              {ctaLabel}
            </Button>
            <span className="text-[var(--text-sm)] font-medium text-[var(--text-body-strong)]">
              Takes less than 10 seconds
            </span>
          </div>
          {showFallbackHint && (
            <p className="mt-3 text-[14px] text-[var(--text-tertiary)]" role="status" aria-live="polite">
              Click the Echly extension in your browser toolbar
            </p>
          )}
        </div>

        {/* Right column — product preview */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <Image
            src="/illustrations/Welcome_Card.png"
            alt="Echly product preview"
            width={408}
            height={306}
            className="w-[50%] h-auto object-contain"
            priority
          />
        </div>

      </div>
    </div>
  );
}
