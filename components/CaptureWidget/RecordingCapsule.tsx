"use client";

import React, { useEffect, useState } from "react";
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
  audioLevel,
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

  const statusText = isProcessing
    ? "Structuring your feedback…"
    : isActive
      ? "Listening…"
      : "Tell us what's happening — we'll structure it.";

  const showEscHint = isActive && !isProcessing;

  if (!visible) return null;

  return (
    <div className="echly-recording-row" aria-live="polite" role="status">
      <div
        className={[
          "echly-recording-capsule",
          expanded ? "echly-recording-capsule--expanded" : "",
          isProcessing ? "echly-recording-capsule--processing" : "",
          isExiting ? "echly-recording-capsule--exiting" : "",
          isActive && !isProcessing ? "echly-recording-capsule--recording" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="echly-recording-orb">
          <RecordingMicOrb
            isRecording={isActive}
            isProcessing={isProcessing}
            audioLevel={audioLevel}
          />
        </div>

        <div className="echly-recording-center">
          <span className="echly-recording-status">{statusText}</span>
          {showEscHint && (
            <span className="echly-recording-esc-hint">Press Esc to cancel</span>
          )}
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
