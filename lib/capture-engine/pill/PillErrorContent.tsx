"use client";

import React from "react";
import { Trash2, RotateCcw, ExternalLink, Lock } from "lucide-react";

export type PillErrorType =
  | "mic_permission_initial"
  | "mic_permission_blocked"
  | "no_audio"
  | "transcription_failed";

interface PillErrorContentProps {
  type: PillErrorType;
  onRetry: () => void;
  onCancel: () => void;
  onOpenSettings?: () => void;
}

export function PillErrorContent({
  type,
  onRetry,
  onCancel,
  onOpenSettings,
}: PillErrorContentProps) {
  if (type === "mic_permission_initial") {
    return (
      <div className="echly-pill-content echly-pill-content--error">
        <button
          type="button"
          className="echly-pill-icon-btn"
          onClick={onCancel}
          aria-label="Dismiss"
        >
          <Trash2 size={18} strokeWidth={1.75} />
        </button>
        <span className="echly-pill-error-msg">Mic access needed</span>
        <button type="button" className="echly-pill-error-action" onClick={onRetry}>
          <RotateCcw size={14} strokeWidth={1.75} />
          <span>Give access</span>
        </button>
      </div>
    );
  }

  if (type === "mic_permission_blocked") {
    return (
      <>
        <div className="echly-pill-content echly-pill-content--error">
          <button
            type="button"
            className="echly-pill-icon-btn"
            onClick={onCancel}
            aria-label="Dismiss"
          >
            <Trash2 size={18} strokeWidth={1.75} />
          </button>
          <span className="echly-pill-error-msg">Mic blocked in browser</span>
          <button
            type="button"
            className="echly-pill-error-action"
            onClick={() => onOpenSettings?.()}
          >
            <ExternalLink size={14} strokeWidth={1.75} />
            <span>Open settings</span>
          </button>
        </div>
        <div className="echly-pill-error-hint-below" role="note">
          <Lock size={12} strokeWidth={1.75} aria-hidden="true" />
          <span>Or click the lock icon in your URL bar to allow access</span>
        </div>
      </>
    );
  }

  const copy =
    type === "no_audio"
      ? { title: "Didn't catch that", cta: "Try again" }
      : { title: "Couldn't process audio", cta: "Retry" };

  return (
    <div className="echly-pill-content echly-pill-content--error">
      <button
        type="button"
        className="echly-pill-icon-btn"
        onClick={onCancel}
        aria-label="Dismiss"
      >
        <Trash2 size={18} strokeWidth={1.75} />
      </button>
      <span className="echly-pill-error-msg">{copy.title}</span>
      <button type="button" className="echly-pill-error-action" onClick={onRetry}>
        <RotateCcw size={14} strokeWidth={1.75} />
        <span>{copy.cta}</span>
      </button>
    </div>
  );
}
