"use client";

import React from "react";

export type SessionControlPanelProps = {
  sessionPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

export function SessionControlPanel({ sessionPaused, onPause, onResume, onEnd }: SessionControlPanelProps) {
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
      {sessionPaused ? (
        <button
          type="button"
          onClick={onResume}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Resume Feedback Session
        </button>
      ) : (
        <button
          type="button"
          onClick={onPause}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.9)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Pause
        </button>
      )}
      <button
        type="button"
        onClick={onEnd}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "none",
          background: "rgba(239,68,68,0.9)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        End
      </button>
    </div>
  );
}
