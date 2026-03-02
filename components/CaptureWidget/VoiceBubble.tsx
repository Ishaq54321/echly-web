"use client";

import React, { useEffect, useState } from "react";
import { MicOrb } from "./MicOrb";

export type VoiceBubbleProps = {
  isListening: boolean;
  isProcessing: boolean;
  isExiting?: boolean;
  audioLevel: number;
  sentiment: "negative" | "neutral" | "positive";
  liveTranscript?: string;
  aiPreviewTitle?: string | null;
  orbSuccess?: boolean;
  onDone: () => void;
};

const MOTION = "140ms cubic-bezier(0.2, 0.8, 0.2, 1)";

/**
 * Growing pill: starts as 44px circle, expands to 240px over 180ms.
 * [ Mic Orb ] [ Transcript ] [ Done ]
 */
export function VoiceBubble({
  isListening,
  isProcessing,
  isExiting = false,
  audioLevel,
  sentiment,
  liveTranscript = "",
  aiPreviewTitle = null,
  orbSuccess = false,
  onDone,
}: VoiceBubbleProps) {
  const isSpeaking = isListening && audioLevel > 0.12;
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);

  const shouldExpand = isListening || isProcessing || isExiting;

  useEffect(() => {
    if (shouldExpand) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setExpanded(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setExpanded(false);
  }, [shouldExpand]);

  const wordCount = liveTranscript.trim() ? liveTranscript.trim().split(/\s+/).length : 0;
  useEffect(() => {
    if (wordCount > 5) {
      const t = setTimeout(() => setShowTranscript(true), 80);
      return () => clearTimeout(t);
    }
    setShowTranscript(false);
  }, [wordCount]);

  useEffect(() => {
    if (aiPreviewTitle && aiPreviewTitle.length > 5) {
      const t = setTimeout(() => setShowAiPreview(true), 80);
      return () => clearTimeout(t);
    }
    setShowAiPreview(false);
  }, [aiPreviewTitle]);

  return (
    <div
      className={`echly-capsule ${expanded ? "echly-capsule--expanded" : ""} ${isExiting ? "echly-capsule--exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={isProcessing ? "Structuring insight" : "Describe the issue"}
    >
      <div className="echly-capsule-orb">
        <MicOrb
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          isExiting={isExiting}
          isProcessing={isProcessing}
          isSuccess={orbSuccess}
          sentiment={sentiment}
          size={44}
        />
      </div>
      <div className="echly-capsule-transcript-block">
        {isProcessing ? (
          <span className="echly-capsule-text">
            Structuring insight…
            <span className="echly-capsule-underline" aria-hidden />
          </span>
        ) : (
          <>
            <span
              className="echly-capsule-transcript"
              style={{
                opacity: showTranscript ? 1 : 0,
                transition: `opacity ${MOTION}`,
              }}
            >
              {liveTranscript || "Describe the issue…"}
            </span>
            {aiPreviewTitle && (
              <span
                className="echly-ai-preview"
                style={{
                  opacity: showAiPreview ? 1 : 0,
                  transition: "opacity 200ms ease-out",
                }}
              >
                {aiPreviewTitle}
              </span>
            )}
          </>
        )}
      </div>
      {isListening && !isProcessing && (
        <button
          type="button"
          className="echly-capsule-done"
          onClick={onDone}
          aria-label="Done recording"
        >
          Done
        </button>
      )}
    </div>
  );
}
