"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_BAR_COUNT = 30;
const FFT_SIZE = 1024;
const SAMPLE_RATE_MS = 60;

/**
 * Industry-standard VU meter ballistics (matches WhatsApp / Voice Memos):
 *  - RMS from time-domain samples → smooth, perceptually-accurate loudness
 *  - Exponential moving average → prevents jittery flicker
 *  - Noise gate → ambient room tone never lights up bars
 *  - Linear display mapping with reasonable ceiling → loud speech ≈ 100%
 *
 * Tuning knobs (raise/lower without changing structure):
 *   SMOOTHING       0.5      higher = calmer, lower = snappier
 *   NOISE_FLOOR     0.01     raw RMS below this is treated as silence
 *   DISPLAY_CEILING 0.3      raw RMS that maps to a full-height bar
 */
const SMOOTHING = 0.5;
const NOISE_FLOOR = 0.01;
const DISPLAY_CEILING = 0.3;

export interface UseAudioLevelsResult {
  bars: number[];
  isActive: boolean;
}

export interface UseAudioLevelsOptions {
  /** Number of history bars to keep (default: 30). */
  barCount?: number;
}

/**
 * Rolling-history visualizer: every ~60ms (≈16fps) a new sample is pushed to
 * the right end of the bar array and the oldest is dropped from the left.
 * Result: bars[0] is ~1.8s ago, bars[29] is right now — gives the WhatsApp /
 * iMessage-style waveform that scrolls right-to-left as you speak.
 *
 * Accepts either a MediaStream (creates its own AudioContext + analyser) or an
 * existing AnalyserNode (reuses it; no second AudioContext on the same stream).
 */
export function useAudioLevels(
  input: MediaStream | AnalyserNode | null,
  options: UseAudioLevelsOptions = {},
): UseAudioLevelsResult {
  const barCount = options.barCount ?? DEFAULT_BAR_COUNT;
  const [liveBars, setLiveBars] = useState<number[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSampleAtRef = useRef<number>(0);
  const zeroBars = useMemo(() => Array(barCount).fill(0) as number[], [barCount]);

  useEffect(() => {
    if (!input) return;

    let ownedAudioCtx: AudioContext | null = null;
    let ownedSource: MediaStreamAudioSourceNode | null = null;
    let ownedAnalyser: AnalyserNode | null = null;
    let analyser: AnalyserNode | null = null;
    let cancelled = false;

    if (isAnalyserNode(input)) {
      analyser = input;
    } else {
      try {
        ownedAudioCtx = new AudioContext();
        ownedSource = ownedAudioCtx.createMediaStreamSource(input);
        ownedAnalyser = ownedAudioCtx.createAnalyser();
        ownedAnalyser.fftSize = FFT_SIZE;
        ownedAnalyser.smoothingTimeConstant = 0.7;
        ownedSource.connect(ownedAnalyser);
        analyser = ownedAnalyser;
      } catch (err) {
        console.warn("[ECHLY:AUDIO] failed to set up analyser", err);
        return;
      }
    }

    /**
     * Time-domain buffer — each sample is 0..255 with center at 128. RMS over
     * this gives perceived loudness directly, no need to weight specific
     * frequency bins.
     */
    const timeDomainBuffer = new Uint8Array(analyser.fftSize);
    let bars: number[] = Array(barCount).fill(0);
    let smoothedLevel = 0;
    setLiveBars(bars);
    lastSampleAtRef.current = 0;

    const tick = (now: number) => {
      if (cancelled || !analyser) return;

      if (now - lastSampleAtRef.current >= SAMPLE_RATE_MS) {
        analyser.getByteTimeDomainData(timeDomainBuffer);

        let sumSquares = 0;
        for (let i = 0; i < timeDomainBuffer.length; i++) {
          const sample = (timeDomainBuffer[i] - 128) / 128;
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / timeDomainBuffer.length);

        smoothedLevel = SMOOTHING * smoothedLevel + (1 - SMOOTHING) * rms;
        const gated = smoothedLevel < NOISE_FLOOR ? 0 : smoothedLevel;
        const displayLevel = Math.min(1, gated / DISPLAY_CEILING);

        bars = bars.slice(1);
        bars.push(displayLevel);
        setLiveBars(bars);

        lastSampleAtRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      try { ownedSource?.disconnect(); } catch { /* noop */ }
      try { ownedAnalyser?.disconnect(); } catch { /* noop */ }
      if (ownedAudioCtx && ownedAudioCtx.state !== "closed") {
        ownedAudioCtx.close().catch(() => { /* noop */ });
      }
    };
  }, [input, barCount]);

  return { bars: input && liveBars ? liveBars : zeroBars, isActive: !!input };
}

function isAnalyserNode(value: MediaStream | AnalyserNode): value is AnalyserNode {
  return typeof (value as AnalyserNode).getByteFrequencyData === "function";
}
