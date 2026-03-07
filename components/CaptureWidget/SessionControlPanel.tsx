"use client";

import React from "react";

export type SessionControlPanelProps = {
  sessionPaused: boolean;
  pausePending?: boolean;
  endPending?: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

function InlineSpinner() {
  return (
    <>
      <style>{`
        @keyframes echly-inline-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.28)",
          borderTopColor: "rgba(255,255,255,0.92)",
          opacity: 0.8,
          animation: "echly-inline-spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
    </>
  );
}

export function SessionControlPanel({
  sessionPaused,
  pausePending = false,
  endPending = false,
  onPause,
  onResume,
  onEnd,
}: SessionControlPanelProps) {
  return (
    <div
      data-echly-ui="true"
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderRadius: 12,
        background: "rgba(20,22,28,0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        zIndex: 2147483647,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
        {sessionPaused ? "Session paused" : "Recording Session"}
      </span>
      {pausePending ? (
        <button
          type="button"
          disabled
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.92)",
            fontSize: 13,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.9,
            cursor: "default",
          }}
        >
          <InlineSpinner />
          <span>Pausing…</span>
        </button>
      ) : sessionPaused ? (
        <button
          type="button"
          onClick={onResume}
          disabled={pausePending}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            cursor: pausePending ? "default" : "pointer",
            opacity: pausePending ? 0.7 : 1,
          }}
        >
          Resume Feedback Session
        </button>
      ) : (
        <button
          type="button"
          onClick={onPause}
          disabled={endPending}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.9)",
            fontSize: 13,
            fontWeight: 500,
            cursor: endPending ? "default" : "pointer",
            opacity: endPending ? 0.7 : 1,
          }}
        >
          Pause
        </button>
      )}
      {endPending ? (
        <button
          type="button"
          disabled
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "rgba(239,68,68,0.9)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.9,
            cursor: "default",
          }}
        >
          <InlineSpinner />
          <span>Ending…</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onEnd}
          disabled={pausePending}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "rgba(239,68,68,0.9)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            cursor: pausePending ? "default" : "pointer",
            opacity: pausePending ? 0.7 : 1,
          }}
        >
          End
        </button>
      )}
    </div>
  );
}
