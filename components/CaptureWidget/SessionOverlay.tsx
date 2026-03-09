"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { attachElementHighlighter, detachElementHighlighter } from "./session/elementHighlighter";
import { attachClickCapture, detachClickCapture } from "./session/clickCapture";
import { SessionControlPanel } from "./SessionControlPanel";
import { VoiceCapturePanel } from "./VoiceCapturePanel";
import { TextFeedbackPanel } from "./TextFeedbackPanel";
import type { CaptureContext } from "./types";

const CAPTURE_TOOLTIP_OFFSET = 12;

function createCommentCursor() {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">`,
    `<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    `</svg>`,
  ].join("");
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 6 6, auto`;
}

const COMMENT_CURSOR = createCommentCursor();

export type SessionOverlayProps = {
  captureRoot: HTMLDivElement;
  sessionMode: boolean;
  sessionPaused: boolean;
  pausePending?: boolean;
  endPending?: boolean;
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
  captureMode?: "voice" | "text";
  listeningAudioLevel?: number;
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
  pausePending = false,
  endPending = false,
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
  captureMode = "voice",
  listeningAudioLevel = 0,
}: SessionOverlayProps) {
  const cleanupRef = useRef<(() => void)[]>([]);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const voiceStartedForPendingRef = useRef(false);
  const sessionActionPending = pausePending || endPending;
  const sessionCursorActive = sessionMode && !sessionPaused && !sessionActionPending;
  const captureActive =
    sessionMode &&
    !sessionPaused &&
    !sessionActionPending &&
    sessionFeedbackPending == null;

  useEffect(() => {
    if (!sessionMode || !captureRoot) return;
    const getActive = () =>
      sessionMode &&
      !sessionPaused &&
      !sessionActionPending &&
      sessionFeedbackPending == null;
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
  }, [
    sessionMode,
    captureRoot,
    sessionPaused,
    sessionActionPending,
    sessionFeedbackPending,
    onElementClicked,
  ]);

  /* Keep feedback cursor scoped to active session capture mode. */
  useEffect(() => {
    if (!captureRoot?.isConnected) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = sessionCursorActive ? COMMENT_CURSOR : "";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [sessionCursorActive, captureRoot]);

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

  /* When captureMode is voice and we have pending feedback, start voice recording immediately (once). */
  useEffect(() => {
    if (!sessionFeedbackPending || captureMode !== "voice" || voiceStartedForPendingRef.current) return;
    voiceStartedForPendingRef.current = true;
    onRecordVoice();
  }, [sessionFeedbackPending, captureMode, onRecordVoice]);

  useEffect(() => {
    if (!sessionFeedbackPending) voiceStartedForPendingRef.current = false;
  }, [sessionFeedbackPending]);

  if (!sessionMode || !captureRoot) return null;

  const content = (
    <>
      <div
        aria-hidden
        className="echly-session-overlay-cursor"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2147483645,
          cursor: sessionCursorActive ? COMMENT_CURSOR : "default",
        }}
      />
      <SessionControlPanel
        sessionPaused={sessionPaused}
        pausePending={pausePending}
        endPending={endPending}
        onPause={onPause}
        onResume={onResume}
        onEnd={onEnd}
      />
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
      {sessionFeedbackPending && captureMode === "voice" && (
        <VoiceCapturePanel
          screenshot={sessionFeedbackPending.screenshot}
          audioLevel={listeningAudioLevel}
          isListening={state === "voice_listening"}
          onFinish={onDoneVoice}
        />
      )}
      {sessionFeedbackPending && captureMode === "text" && (
        <TextFeedbackPanel
          screenshot={sessionFeedbackPending.screenshot}
          onSubmit={onSaveText}
          onCancel={onCancel}
        />
      )}
    </>
  );

  return createPortal(content, captureRoot);
}
