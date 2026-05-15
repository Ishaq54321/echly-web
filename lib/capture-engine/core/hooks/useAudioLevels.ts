"use client";

import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 5;

export interface UseAudioLevelsResult {
  bars: number[];
  isActive: boolean;
}

export function useAudioLevels(stream: MediaStream | null): UseAudioLevelsResult {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      setBars(Array(BAR_COUNT).fill(0));
      return;
    }

    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let cancelled = false;

    try {
      audioCtx = new AudioContext();
      source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
    } catch (err) {
      console.warn("[ECHLY:AUDIO] failed to set up analyser", err);
      return;
    }

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const binsPerBar = Math.max(1, Math.floor(buffer.length / BAR_COUNT));

    const tick = () => {
      if (cancelled || !analyser) return;
      analyser.getByteFrequencyData(buffer);

      const next: number[] = new Array(BAR_COUNT);
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < binsPerBar; j++) {
          sum += buffer[i * binsPerBar + j] ?? 0;
        }
        next[i] = sum / binsPerBar / 255;
      }

      setBars(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      try { source?.disconnect(); } catch { /* noop */ }
      try { analyser?.disconnect(); } catch { /* noop */ }
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => { /* noop */ });
      }
    };
  }, [stream]);

  return { bars, isActive: !!stream };
}
