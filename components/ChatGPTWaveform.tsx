"use client";

import React, { useEffect, useRef } from "react";

const BAR_COUNT = 120;
const BAR_WIDTH = 2;
const GAP = 2;
const MAX_HEIGHT = 26;
const MIN_HEIGHT = 2;
/** Normalized 0–1. Below this = silence: flat bar (BASELINE_BAR_HEIGHT), no animation. */
const SILENCE_THRESHOLD = 0.02;
/** Bar height when amplitude is 0 or below threshold (flat/silent). */
const BASELINE_BAR_HEIGHT = 1;

export type ChatGPTWaveformProps = {
  analyser: AnalyserNode | null;
};

export default function ChatGPTWaveform({ analyser }: ChatGPTWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser) return;

    const node = analyser;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const ctx2d = canvasEl.getContext("2d");
    if (!ctx2d) return;

    const bufferLength = node.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const totalWidth = BAR_COUNT * (BAR_WIDTH + GAP) - GAP;
    const canvasWidth = totalWidth;
    const canvasHeight = 52;

    let rafId: number;
    /** Smoothed average amplitude (0–1) to avoid flicker at speech start/end. */
    let smoothedAmplitude = 0;

    function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      rafId = requestAnimationFrame(() => draw(ctx, canvas));

      node.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const rawAvg = dataArray.length ? sum / dataArray.length / 255 : 0;
      const amplitude = rawAvg < SILENCE_THRESHOLD ? 0 : rawAvg;
      smoothedAmplitude = smoothedAmplitude * 0.8 + amplitude * 0.2;

      const isSilent = smoothedAmplitude < SILENCE_THRESHOLD;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvasHeight / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = dataArray[Math.floor((i / BAR_COUNT) * bufferLength)] ?? 0;
        const normalized = value / 255;
        const barBelowThreshold = normalized < SILENCE_THRESHOLD;

        let height: number;
        let opacity: number;

        if (isSilent || barBelowThreshold) {
          height = BASELINE_BAR_HEIGHT;
          opacity = 0.4;
        } else {
          const scale = Math.max(0, (normalized - SILENCE_THRESHOLD) / (1 - SILENCE_THRESHOLD));
          height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, MIN_HEIGHT + scale * (MAX_HEIGHT - MIN_HEIGHT)));
          opacity = 1;
        }

        const x = i * (BAR_WIDTH + GAP);
        const halfH = height / 2;

        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
        roundRect(ctx, x, centerY - halfH, BAR_WIDTH, height, 2);
        ctx.fill();
      }
    }

    function roundRect(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      if (r <= 0) {
        c.rect(x, y, w, h);
        return;
      }
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    draw(ctx2d, canvasEl);

    return () => cancelAnimationFrame(rafId);
  }, [analyser]);

  if (!analyser) {
    return <div className="waveform-placeholder" />;
  }

  return (
    <canvas
      ref={canvasRef}
      width={BAR_COUNT * (BAR_WIDTH + GAP) - GAP}
      height={52}
      className="echly-chatgpt-waveform"
    />
  );
}
