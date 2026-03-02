"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { RecordingMicOrb } from "./RecordingMicOrb";

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
  liveTranscript = "",
  onDone,
  onCancel,
}: RecordingCapsuleProps) {
  const [expanded, setExpanded] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

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

  const statusText = useMemo(() => {
    if (isProcessing) return "Optimizing your insight…";
    return "Listening — we'll structure this.";
  }, [isProcessing]);

  if (!visible) return null;

  return (
    <div className="echly-recording-row" aria-live="polite" role="status">
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
          <RecordingMicOrb isRecording={isActive} isProcessing={isProcessing} />
        </div>

        <div className="echly-recording-center">
          <span className="echly-recording-status">{statusText}</span>
          <div className="echly-recording-transcript" ref={transcriptRef}>
            <span className="echly-recording-text">
              {transcriptText}
              {isProcessing && (
                <span className="echly-recording-underline" aria-hidden />
              )}
            </span>
          </div>
          <div className="echly-recording-action-row">
            <button
              type="button"
              onClick={onCancel}
              className="echly-recording-cancel-pill"
              aria-label="Cancel recording"
            >
              Cancel
            </button>
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
      </div>
    </div>
  );
}
