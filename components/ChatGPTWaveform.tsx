"use client";

import React, { useEffect, useRef } from "react";

const BAR_COUNT = 110;
const BAR_WIDTH = 3;
const GAP = 2;
const CANVAS_HEIGHT = 64;
const MAX_HEIGHT = 48;
const MIN_HEIGHT = 4;
/** Normalized 0–1. Below this = silence: flat bar (BASELINE_BAR_HEIGHT), no animation. */
const SILENCE_THRESHOLD = 0.02;
/** Bar height when amplitude is 0 or below threshold (flat/silent). */
const BASELINE_BAR_HEIGHT = 3;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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
    const canvasHeight = CANVAS_HEIGHT;

    let rafId: number;
    let frame = 0;
    /** Smoothed average amplitude (0–1) to avoid flicker at speech start/end. */
    let smoothedAmplitude = 0;
    const renderedHeights = new Array<number>(BAR_COUNT).fill(BASELINE_BAR_HEIGHT);

    function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      rafId = requestAnimationFrame(() => draw(ctx, canvas));
      frame += 1;

      const fill =
        getComputedStyle(canvas).getPropertyValue("--echly-waveform-fill").trim() ||
        getComputedStyle(canvas).getPropertyValue("--color-primary").trim();

      node.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const rawAvg = dataArray.length ? sum / dataArray.length / 255 : 0;
      const amplitude = rawAvg < SILENCE_THRESHOLD ? 0 : rawAvg;
      smoothedAmplitude = smoothedAmplitude * 0.84 + amplitude * 0.16;

      const isSilent = smoothedAmplitude < SILENCE_THRESHOLD;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvasHeight / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = dataArray[Math.floor((i / BAR_COUNT) * bufferLength)] ?? 0;
        const normalized = value / 255;
        const barBelowThreshold = normalized < SILENCE_THRESHOLD;

        let targetHeight: number;
        let opacity: number;

        if (isSilent || barBelowThreshold) {
          const idleMotion = Math.sin(frame * 0.06 + i * 0.22) * 0.9;
          targetHeight = BASELINE_BAR_HEIGHT + idleMotion;
          opacity = 0.26;
        } else {
          const scale = Math.max(0, (normalized - SILENCE_THRESHOLD) / (1 - SILENCE_THRESHOLD));
          const easedScale = easeInOutCubic(scale);
          targetHeight = Math.max(
            MIN_HEIGHT,
            Math.min(MAX_HEIGHT, MIN_HEIGHT + easedScale * (MAX_HEIGHT - MIN_HEIGHT) * 0.82)
          );
          opacity = 0.9;
        }

        const previousHeight = renderedHeights[i] ?? BASELINE_BAR_HEIGHT;
        const easing = isSilent ? 0.1 : 0.18;
        const height = previousHeight + (targetHeight - previousHeight) * easing;
        renderedHeights[i] = height;

        const x = i * (BAR_WIDTH + GAP);
        const halfH = height / 2;

        ctx.fillStyle = fill || "currentColor";
        ctx.globalAlpha = opacity;
        roundRect(ctx, x, centerY - halfH, BAR_WIDTH, height, BAR_WIDTH / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
      height={CANVAS_HEIGHT}
      className="echly-chatgpt-waveform"
    />
  );
}
