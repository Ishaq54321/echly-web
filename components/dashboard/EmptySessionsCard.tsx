"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export interface EmptySessionsCardProps {
  onStartRecording: () => void;
  isLoading?: boolean;
}

function RecordingCursorIcon() {
  return (
    <svg
      className="w-14 h-14 opacity-80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Recording dot */}
      <circle cx="8" cy="7" r="2.2" fill="currentColor" stroke="none" />

      {/* Screen */}
      <rect x="4.5" y="9" width="15" height="10" rx="2.2" />

      {/* Cursor click */}
      <path d="M14.2 13.1l4.3 2.5-4.3 2.5v-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function EmptySessionsCard({
  onStartRecording,
  isLoading = false,
}: EmptySessionsCardProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

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

      <h2 className="mt-5 text-[26px] leading-[1.15] md:text-[30px] font-semibold text-[hsl(var(--text-primary-strong))]">
        Start your first feedback session
      </h2>

      <p className="mt-3 text-sm text-[hsl(var(--text-muted))] max-w-[360px] mx-auto leading-relaxed">
        Capture feedback directly on your website in seconds using the Echly extension.
      </p>

      <div className="mt-7">
        <Button
          variant="primary"
          type="button"
          onClick={onStartRecording}
          disabled={isLoading}
          className="h-11 w-full rounded-xl font-medium hover:scale-[1.02] transition-transform duration-[150ms] ease-out"
          aria-label="Start recording"
        >
          Start recording
        </Button>

        <p className="text-xs text-[hsl(var(--text-muted))] mt-2">
          Takes less than 10 seconds
        </p>
      </div>
    </div>
  );
}

