"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MicOrb } from "./MicOrb";

export type RecordingCapsuleProps = {
  visible: boolean;
  isActive: boolean;
  isProcessing: boolean;
  isExiting?: boolean;
  audioLevel: number;
  sentiment: "negative" | "neutral" | "positive";
  liveTranscript?: string;
  onDone: () => void;
  onCancel: () => void;
};

export function RecordingCapsule({
  visible,
  isActive,
  isProcessing,
  isExiting = false,
  audioLevel,
  sentiment,
  liveTranscript = "",
  onDone,
  onCancel,
}: RecordingCapsuleProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isActive || isProcessing) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setExpanded(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setExpanded(false);
  }, [isActive, isProcessing]);

  const transcriptText = useMemo(() => {
    if (isProcessing) return "Structuring insight…";
    const t = liveTranscript.trim();
    if (t) return t;
    return "Listening…";
  }, [isProcessing, liveTranscript]);

  if (!visible) return null;

  return (
    <div className="echly-recording-row" aria-live="polite" role="status">
      {!isProcessing && (
        <button
          type="button"
          onClick={onCancel}
          className="echly-recording-cancel"
          aria-label="Cancel recording"
        >
          Cancel
        </button>
      )}

      <div
        className={[
          "echly-recording-capsule",
          expanded ? "echly-recording-capsule--expanded" : "",
          isProcessing ? "echly-recording-capsule--processing" : "",
          isExiting ? "echly-recording-capsule--exiting" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="echly-recording-orb">
          <MicOrb
            isSpeaking={isActive && audioLevel > 0.12}
            audioLevel={audioLevel}
            isProcessing={isProcessing}
            isExiting={isExiting}
            sentiment={sentiment}
            size={expanded ? 56 : 56}
          />
        </div>

        <div className="echly-recording-transcript">
          <span className="echly-recording-text">
            {transcriptText}
            {isProcessing && <span className="echly-capsule-underline" aria-hidden />}
          </span>
        </div>

        {isActive && !isProcessing && (
          <button
            type="button"
            className="echly-recording-done"
            onClick={onDone}
            aria-label="Done recording"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}

