"use client";

/**
 * SpeechCaption — MARKETING-ONLY flourish. NOT a forklift.
 *
 * The real extension has no such caption: the recording pill is small and the
 * voice → text magic isn't visible to a passive viewer. This component sits
 * beneath the pill and makes the transcription legible for the demo.
 *
 * Fix 4 (v7): simplified to a single content row — just the transcript text
 * with a blinking caret while it types. The old "We're listening · just speak
 * naturally" header + red dot are gone; the box reads as pure captioning.
 *
 * Fix 2 (v9): the caret now signals "ready/listening" the way Otter / Apple
 * Live Captions do — it blinks at the START of the empty box (where the first
 * character will land), then disappears the instant the first word arrives.
 * There's no trailing caret as the text types; once even one word is revealed,
 * no cursor renders at all.
 *
 * It is positioned by its parent anchor in HeroCaptureDemo (margin-top under the
 * pill). All visual rules live in marketing.css (.speech-caption*).
 */

import React, { useEffect, useState } from "react";

export type CaptionState = "listening" | "transcribing";

interface SpeechCaptionProps {
  state: CaptionState;
  /** Full transcript to reveal word-by-word once state is "transcribing". */
  transcript: string;
  /** ms between each word appearing. */
  wordIntervalMs?: number;
  /** ms to wait after mount before typing begins (transcription lag). */
  typingDelayMs?: number;
}

export function SpeechCaption({
  state,
  transcript,
  wordIntervalMs = 200,
  typingDelayMs = 800,
}: SpeechCaptionProps) {
  const words = transcript.split(" ");
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (state !== "transcribing") {
      setRevealed(0);
      return;
    }
    setRevealed(0);
    let i = 0;
    let intervalId = 0;
    // Small natural delay before the words begin landing.
    const delayId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        i += 1;
        setRevealed(i);
        if (i >= words.length) window.clearInterval(intervalId);
      }, wordIntervalMs);
    }, typingDelayMs);
    return () => {
      window.clearTimeout(delayId);
      window.clearInterval(intervalId);
    };
  }, [state, transcript, wordIntervalMs, typingDelayMs, words.length]);

  // Fix 2 (v9): the caret only renders BEFORE the first word lands — it sits at
  // the start of the empty box signalling "ready to transcribe", then vanishes
  // the moment text begins. No trailing caret while typing.
  const showCaret = revealed === 0;

  return (
    <div className="speech-caption" data-state={state}>
      <div className="speech-caption-text" aria-live="polite">
        {showCaret && <span className="speech-caption-cursor" aria-hidden />}
        {/* Fix 3 (v9): only revealed words are rendered so the box auto-sizes to
            content (hidden-but-present spans would reserve the full height up
            front and leave empty space). Each word mounts already-shown and
            fades up via the .is-shown transition. */}
        {words.slice(0, revealed).map((word, i) => (
          <span key={i} className="speech-caption-word is-shown">
            {word}{i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
