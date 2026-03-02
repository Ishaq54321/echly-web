"use client";

import React, { useEffect, useState } from "react";
import { MicOrb } from "./MicOrb";

export type VoiceBubbleProps = {
  isListening: boolean;
  isProcessing: boolean;
  isExiting?: boolean;
  audioLevel: number;
  sentiment: "negative" | "neutral" | "positive";
  /** Live AI title suggestion when transcript length > 10 */
  aiPreviewTitle?: string | null;
  onDone: () => void;
};

/**
 * Floating voice capsule. Renders in #echly-capture-root only.
 * Structure: .echly-capsule > .mic-orb + .capsule-text; .ai-preview below.
 */
export function VoiceBubble({
  isListening,
  isProcessing,
  isExiting = false,
  audioLevel,
  sentiment,
  aiPreviewTitle = null,
  onDone,
}: VoiceBubbleProps) {
  const isSpeaking = isListening && audioLevel > 0.12;
  const [showAiPreview, setShowAiPreview] = useState(false);

  useEffect(() => {
    if (aiPreviewTitle && aiPreviewTitle.length > 10) {
      const t = setTimeout(() => setShowAiPreview(true), 50);
      return () => clearTimeout(t);
    } else {
      setShowAiPreview(false);
    }
  }, [aiPreviewTitle]);

  return (
    <div
      className={`echly-capsule ${isExiting ? "echly-capsule--exiting" : ""}`}
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
          sentiment={sentiment}
        />
      </div>
      <div className="echly-capsule-text-block">
        <span className="echly-capsule-text">
          {isProcessing ? (
            <>
              Structuring insight…
              <span className="echly-capsule-underline" aria-hidden />
            </>
          ) : (
            "Describe the issue…"
          )}
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
