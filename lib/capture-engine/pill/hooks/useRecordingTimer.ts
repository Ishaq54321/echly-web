"use client";

import { useEffect, useRef, useState } from "react";

const WARNING_AT_SECONDS = 120;
const HARD_LIMIT_SECONDS = 180;

export type RecordingTimerPhase = "listening" | "warning" | "limit_reached";

export interface UseRecordingTimerResult {
  elapsedSeconds: number;
  elapsedFormatted: string;
  phase: RecordingTimerPhase;
}

export function useRecordingTimer(
  isRecording: boolean,
  onLimitReached: () => void,
  resetKey: number = 0,
): UseRecordingTimerResult {
  const [liveSeconds, setLiveSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const limitFiredRef = useRef(false);
  /** Ref mirror of liveSeconds so the freeze can read the final value from
   *  the interval-cleanup without adding liveSeconds as an effect dep. */
  const liveSecondsRef = useRef(0);
  /** Holds the final elapsed value so the timer freezes (doesn't reset to 0)
   *  while the recording is being sent/processed. State (not a ref) so that
   *  capturing the value triggers the re-render that needs to display it. */
  const [frozenSeconds, setFrozenSeconds] = useState(0);
  const limitCallbackRef = useRef(onLimitReached);

  useEffect(() => {
    limitCallbackRef.current = onLimitReached;
  }, [onLimitReached]);

  useEffect(() => {
    if (!isRecording) return;

    // Fresh recording starting — clear the frozen value so the timer
    // correctly restarts at 0:00 rather than the previous duration.
    setFrozenSeconds(0);
    liveSecondsRef.current = 0;
    startTimeRef.current = Date.now();
    limitFiredRef.current = false;
    setLiveSeconds(0);
    const id = setInterval(() => {
      const start = startTimeRef.current;
      if (start == null) return;
      const secs = Math.floor((Date.now() - start) / 1000);
      liveSecondsRef.current = secs;
      setLiveSeconds(secs);
      if (secs >= HARD_LIMIT_SECONDS && !limitFiredRef.current) {
        limitFiredRef.current = true;
        limitCallbackRef.current?.();
      }
    }, 250);

    return () => {
      clearInterval(id);
      startTimeRef.current = null;
      // Recording just stopped (send/processing) — freeze at the final value
      // so the displayed timer holds steady instead of snapping to 0:00.
      if (liveSecondsRef.current > 0) {
        setFrozenSeconds(liveSecondsRef.current);
      }
    };
    // resetKey is intentionally a dep — bumping it restarts the timer
    // mid-recording (e.g. user clicked Reset, MediaRecorder restarts but
    // isRecording never flips from true to false).
  }, [isRecording, resetKey]);

  const elapsedSeconds = isRecording ? liveSeconds : frozenSeconds;
  const phase: RecordingTimerPhase =
    elapsedSeconds >= HARD_LIMIT_SECONDS
      ? "limit_reached"
      : elapsedSeconds >= WARNING_AT_SECONDS
        ? "warning"
        : "listening";

  return {
    elapsedSeconds,
    elapsedFormatted: formatTime(elapsedSeconds),
    phase,
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
