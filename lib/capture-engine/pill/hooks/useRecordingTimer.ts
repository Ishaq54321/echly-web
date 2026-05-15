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
  const limitCallbackRef = useRef(onLimitReached);

  useEffect(() => {
    limitCallbackRef.current = onLimitReached;
  }, [onLimitReached]);

  useEffect(() => {
    if (!isRecording) return;

    startTimeRef.current = Date.now();
    limitFiredRef.current = false;
    setLiveSeconds(0);
    const id = setInterval(() => {
      const start = startTimeRef.current;
      if (start == null) return;
      const secs = Math.floor((Date.now() - start) / 1000);
      setLiveSeconds(secs);
      if (secs >= HARD_LIMIT_SECONDS && !limitFiredRef.current) {
        limitFiredRef.current = true;
        limitCallbackRef.current?.();
      }
    }, 250);

    return () => {
      clearInterval(id);
      startTimeRef.current = null;
    };
    // resetKey is intentionally a dep — bumping it restarts the timer
    // mid-recording (e.g. user clicked Reset, MediaRecorder restarts but
    // isRecording never flips from true to false).
  }, [isRecording, resetKey]);

  const elapsedSeconds = isRecording ? liveSeconds : 0;
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
