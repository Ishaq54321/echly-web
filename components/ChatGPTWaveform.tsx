"use client";

import React, { useEffect, useRef } from "react";

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const STEP = BAR_WIDTH + BAR_GAP;
const CANVAS_HEIGHT = 64;
const MIN_BAR_PX = 1;
const MAX_BAR_PX = 48;
const SAMPLE_INTERVAL_MS = 50;

export type ChatGPTWaveformProps = {
  analyser: AnalyserNode | null;
};

function roundRectPath(
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

export default function ChatGPTWaveform({ analyser }: ChatGPTWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const amplitudeHistoryRef = useRef<number[]>([]);
  const lastSampleRef = useRef(0);
  const barCountRef = useRef(110);
  const cssWidthRef = useRef(0);
  const cssHeightRef = useRef(CANVAS_HEIGHT);
  const fillColorRef = useRef("rgba(23, 117, 224, 0.6)");

  // Resize observer to handle DPR + container width
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = window.devicePixelRatio || 1;

    const apply = (width: number) => {
      const cssW = Math.max(1, Math.floor(width));
      const cssH = CANVAS_HEIGHT;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cssWidthRef.current = cssW;
      cssHeightRef.current = cssH;
      barCountRef.current = Math.max(1, Math.floor(cssW / STEP));
    };

    apply(container.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Read CSS color once per analyser change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const style = getComputedStyle(canvas);
    const fill =
      style.getPropertyValue("--echly-waveform-fill").trim() ||
      style.getPropertyValue("--color-primary").trim() ||
      "rgba(23, 117, 224, 0.6)";
    fillColorRef.current = fill;
  }, [analyser]);

  useEffect(() => {
    if (!analyser) return;

    const node = analyser;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const bufferLength = node.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    // Seed history so bars exist immediately
    if (amplitudeHistoryRef.current.length === 0) {
      amplitudeHistoryRef.current = new Array(barCountRef.current + 2).fill(0);
    }

    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const cssW = cssWidthRef.current;
      const cssH = cssHeightRef.current;
      const barCount = barCountRef.current;
      if (cssW <= 0 || barCount <= 0) return;

      // Sample amplitude
      node.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const s = (dataArray[i] - 128) / 128;
        sum += s * s;
      }
      const rawRms = Math.sqrt(sum / dataArray.length);
      const gatedRms = rawRms < 0.015 ? 0 : rawRms;
      const boosted = Math.pow(gatedRms, 0.6) * 3.0;
      const smoothedRms = Math.min(1, boosted);

      const now = performance.now();
      if (lastSampleRef.current === 0) lastSampleRef.current = now;
      const elapsed = now - lastSampleRef.current;

      if (elapsed >= SAMPLE_INTERVAL_MS) {
        lastSampleRef.current = now;
        const history = amplitudeHistoryRef.current;
        const prev = history[history.length - 1] ?? 0;
        const smoothed = prev < 0.01 ? smoothedRms : prev * 0.3 + smoothedRms * 0.7;
        history.push(smoothed);
        const maxLen = barCount + 4;
        while (history.length > maxLen) history.shift();
      }

      const elapsedAfterPush = now - lastSampleRef.current;
      const t = Math.min(elapsedAfterPush / SAMPLE_INTERVAL_MS, 1);
      const pixelOffset = t * STEP;

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = fillColorRef.current || "currentColor";

      const fadeZone = Math.max(1, Math.floor(barCount * 0.12));
      const history = amplitudeHistoryRef.current;
      const total = barCount + 1;

      for (let i = 0; i < total; i++) {
        const dataIndex = history.length - barCount - 1 + i;
        let value = dataIndex >= 0 ? history[dataIndex] ?? 0 : 0;

        if (value < 0.02) {
          value = 0;
        }

        const rawHeight = value * cssH;
        const barHeight = Math.max(MIN_BAR_PX, Math.min(MAX_BAR_PX, rawHeight));

        const x = i * STEP - pixelOffset;
        const y = (cssH - barHeight) / 2;

        if (x + BAR_WIDTH < 0 || x > cssW) continue;

        const alpha = i < fadeZone ? 0.3 + 0.7 * (i / fadeZone) : 1;
        ctx.globalAlpha = alpha;

        roundRectPath(ctx, x, y, BAR_WIDTH, barHeight, 1);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      amplitudeHistoryRef.current = [];
      lastSampleRef.current = 0;
    };
  }, [analyser]);

  return (
    <div ref={containerRef} className="echly-chatgpt-waveform">
      <canvas ref={canvasRef} />
    </div>
  );
}
