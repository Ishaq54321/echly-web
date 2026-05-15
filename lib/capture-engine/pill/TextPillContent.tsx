"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Trash2, Send, Mic } from "lucide-react";
import { PillTooltip } from "./PillTooltip";

interface TextPillContentProps {
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSend: () => void;
  onSwitchToVoiceMode: () => void;
}

const SINGLE_LINE_HEIGHT = 24;
const MAX_LEN = 2000;
const COUNTER_REVEAL_AT = 1800;
const COUNTER_WARNING_AT = 100; // remaining chars at which counter turns red

export function TextPillContent({
  value,
  onChange,
  onCancel,
  onSend,
  onSwitchToVoiceMode,
}: TextPillContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isGrown, setIsGrown] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
    setIsGrown(ta.scrollHeight > SINGLE_LINE_HEIGHT + 4);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSend();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const remaining = MAX_LEN - value.length;
  const showCounter = value.length >= COUNTER_REVEAL_AT;
  const counterWarning = remaining <= COUNTER_WARNING_AT;

  return (
    <div
      className={
        "echly-pill-content echly-pill-content--text" +
        (isGrown ? " echly-pill-content--text-grown" : "")
      }
    >
      {/* LEFT — hover-revealed voice-mode switch. Reveals only on pill hover,
          NOT on focus-within, so it stays hidden while typing unless the user
          mouses over the pill. */}
      <PillTooltip content="Switch to voice mode">
        <button
          type="button"
          className="echly-pill-action echly-pill-action--mic"
          onClick={onSwitchToVoiceMode}
          aria-label="Switch to voice mode"
        >
          <Mic size={18} strokeWidth={1.75} />
        </button>
      </PillTooltip>

      <span className="echly-pill-divider" aria-hidden="true" />

      {/* PRIMARY CONTROLS */}
      <button
        type="button"
        className="echly-pill-icon-btn"
        onClick={onCancel}
        aria-label="Cancel"
      >
        <Trash2 size={18} strokeWidth={1.75} />
      </button>

      <div className="echly-pill-text-input-wrap">
        <textarea
          ref={textareaRef}
          className="echly-pill-text-textarea"
          placeholder="What would you change?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MAX_LEN}
          aria-label="Feedback description"
        />
      </div>

      {showCounter && (
        <span
          className={
            "echly-pill-text-meta" +
            (counterWarning ? " echly-pill-text-meta--warning" : "")
          }
          aria-live="polite"
        >
          {remaining}
        </span>
      )}

      <button
        type="button"
        className="echly-pill-send-btn"
        onClick={onSend}
        disabled={!value.trim()}
        aria-label="Send"
      >
        <Send size={18} strokeWidth={2} fill="currentColor" stroke="none" />
      </button>
    </div>
  );
}
