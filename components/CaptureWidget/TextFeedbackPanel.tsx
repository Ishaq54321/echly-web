"use client";

import React, { useState } from "react";

export type TextFeedbackPanelProps = {
  screenshot?: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
};

export function TextFeedbackPanel({
  screenshot,
  onSubmit,
  onCancel,
}: TextFeedbackPanelProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const t = text.trim();
    if (t) onSubmit(t);
  };

  return (
    <div
      className="text-feedback"
      data-echly-ui="true"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(380px, 92vw)",
        borderRadius: 14,
        background: "rgba(20,22,28,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.08)",
        zIndex: 2147483647,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Plus Jakarta Sans", "SF Pro Display", Inter, system-ui, sans-serif',
      }}
    >
      {screenshot && (
        <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(0,0,0,0.3)",
              aspectRatio: "16/10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={screenshot}
              alt="Capture"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the feedback..."
          aria-label="Feedback text"
          rows={3}
          className="text-feedback-textarea"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.06)",
            color: "#F3F4F6",
            fontSize: 14,
            resize: "vertical",
            minHeight: 80,
          }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "#A1A1AA",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="submit-feedback"
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: text.trim() ? "#466EFF" : "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: text.trim() ? "pointer" : "default",
            }}
          >
            Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
