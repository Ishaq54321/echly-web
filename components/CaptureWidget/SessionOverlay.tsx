"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { attachElementHighlighter, detachElementHighlighter } from "./session/elementHighlighter";
import { attachClickCapture, detachClickCapture } from "./session/clickCapture";
import { SessionControlPanel } from "./SessionControlPanel";
import { SessionFeedbackPopup } from "./SessionFeedbackPopup";
import type { CaptureContext } from "./types";

const CAPTURE_TOOLTIP_OFFSET = 12;

export type SessionOverlayProps = {
  captureRoot: HTMLDivElement;
  sessionMode: boolean;
  sessionPaused: boolean;
  sessionFeedbackPending: { screenshot: string; context: CaptureContext | null } | null;
  state: string;
  onElementClicked: (element: Element) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onRecordVoice: () => void;
  onDoneVoice: () => void;
  onSaveText: (transcript: string) => void;
  onCancel?: () => void;
};

/**
 * Renders session UI into capture root and attaches highlighter + click capture.
 * When sessionMode and !sessionPaused, hover and click are active; when sessionFeedbackPending
 * is set, click capture is effectively disabled (popup is on top and has data-echly-ui).
 */
export function SessionOverlay({
  captureRoot,
  sessionMode,
  sessionPaused,
  sessionFeedbackPending,
  state,
  onElementClicked,
  onPause,
  onResume,
  onEnd,
  onRecordVoice,
  onDoneVoice,
  onSaveText,
  onCancel,
}: SessionOverlayProps) {
  const cleanupRef = useRef<(() => void)[]>([]);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const captureActive = sessionMode && !sessionPaused && sessionFeedbackPending == null;

  useEffect(() => {
    if (!sessionMode || !captureRoot) return;
    const getActive = () => sessionMode && !sessionPaused && sessionFeedbackPending == null;
    cleanupRef.current.push(
      attachElementHighlighter(captureRoot, { getActive })
    );
    cleanupRef.current.push(
      attachClickCapture(captureRoot, {
        enabled: getActive,
        onElementClicked,
      })
    );
    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
      detachElementHighlighter();
      detachClickCapture();
    };
  }, [sessionMode, captureRoot, sessionPaused, sessionFeedbackPending, onElementClicked]);

  /* Cursor only when capture is fully active and root is in document (avoids pointer without overlay). */
  useEffect(() => {
    if (!captureActive || !captureRoot?.isConnected) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [captureActive, captureRoot]);

  useEffect(() => {
    if (!captureActive) {
      setTooltipPos(null);
      return;
    }
    const onMove = (e: MouseEvent) => {
      setTooltipPos({ x: e.clientX + CAPTURE_TOOLTIP_OFFSET, y: e.clientY + CAPTURE_TOOLTIP_OFFSET });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [captureActive]);

  if (!sessionMode || !captureRoot) return null;

  const content = (
    <>
      <SessionControlPanel sessionPaused={sessionPaused} onPause={onPause} onResume={onResume} onEnd={onEnd} />
      {captureActive && tooltipPos != null && (
        <div
          aria-hidden
          className="echly-capture-tooltip"
          style={{
            position: "fixed",
            left: tooltipPos.x,
            top: tooltipPos.y,
            pointerEvents: "none",
            zIndex: 2147483646,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.95)",
            background: "rgba(0,0,0,0.75)",
            borderRadius: 6,
            whiteSpace: "nowrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          Click to add feedback
        </div>
      )}
      {sessionFeedbackPending && (
        <SessionFeedbackPopup
          screenshot={sessionFeedbackPending.screenshot}
          isVoiceListening={state === "voice_listening"}
          onRecordVoice={onRecordVoice}
          onDoneVoice={onDoneVoice}
          onSaveText={onSaveText}
          onCancel={onCancel}
        />
      )}
    </>
  );

  return createPortal(content, captureRoot);
}
