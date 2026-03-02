"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { buildCaptureContext } from "@/lib/captureContext";
import type { CaptureContext } from "./types";

const MIN_SIZE = 24;
const ECHLY_MOTION = "140ms cubic-bezier(0.2, 0.8, 0.2, 1)";

export type Region = { x: number; y: number; w: number; h: number };

export type RegionCaptureOverlayProps = {
  getFullTabImage: () => Promise<string | null>;
  onCapture: (croppedDataUrl: string, context: CaptureContext | null) => void;
  onCancel: () => void;
  onSelectionStart?: () => void;
};

async function cropImageToRegion(
  fullImageDataUrl: string,
  region: Region,
  dpr: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sx = Math.round(region.x * dpr);
      const sy = Math.round(region.y * dpr);
      const sw = Math.round(region.w * dpr);
      const sh = Math.round(region.h * dpr);
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No canvas context"));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = fullImageDataUrl;
  });
}

export function RegionCaptureOverlay({
  getFullTabImage,
  onCapture,
  onCancel,
  onSelectionStart,
}: RegionCaptureOverlayProps) {
  const [selectionRect, setSelectionRect] = useState<Region | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [releasedRect, setReleasedRect] = useState<Region | null>(null);
  const [pulseDone, setPulseDone] = useState(false);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRectRef = useRef<Region | null>(null);

  const cancel = useCallback(() => {
    setOverlayVisible(false);
    setSelectionRect(null);
    startRef.current = null;
    selectionRectRef.current = null;
    setTimeout(() => onCancel(), 120);
  }, [onCancel]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cancel]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") cancel();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [cancel]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    onSelectionStart?.();
    const x = e.clientX;
    const y = e.clientY;
    startRef.current = { x, y };
    setSelectionRect({ x, y, w: 0, h: 0 });
  }, [onSelectionStart]);

  const performCapture = useCallback(
    async (targetRect: Region) => {
      setOverlayVisible(false);
      setSelectionRect(null);
      setReleasedRect(null);
      setPulseDone(false);

      await new Promise((r) => setTimeout(r, 80));

      let fullImage: string | null = null;
      try {
        fullImage = await getFullTabImage();
      } catch {
        setOverlayVisible(true);
        onCancel();
        return;
      }
      if (!fullImage) {
        setOverlayVisible(true);
        onCancel();
        return;
      }

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      let cropped: string;
      try {
        cropped = await cropImageToRegion(fullImage, targetRect, dpr);
      } catch {
        setOverlayVisible(true);
        onCancel();
        return;
      }

      const context: CaptureContext | null =
        typeof window !== "undefined" ? buildCaptureContext(window, null) : null;
      onCapture(cropped, context);
    },
    [getFullTabImage, onCapture, onCancel]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const current = selectionRectRef.current;
      const start = startRef.current;
      startRef.current = null;
      if (!start || !current || current.w < MIN_SIZE || current.h < MIN_SIZE) {
        setSelectionRect(null);
        return;
      }
      setSelectionRect(null);
      selectionRectRef.current = null;
      setReleasedRect({ x: current.x, y: current.y, w: current.w, h: current.h });
      setPulseDone(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPulseDone(true));
      });
      setTimeout(() => {
        performCapture({ x: current.x, y: current.y, w: current.w, h: current.h });
        setReleasedRect(null);
      }, 120);
    },
    [performCapture]
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!startRef.current) return;
    const sx = startRef.current.x;
    const sy = startRef.current.y;
    const x = Math.min(sx, e.clientX);
    const y = Math.min(sy, e.clientY);
    const w = Math.abs(e.clientX - sx);
    const h = Math.abs(e.clientY - sy);
    const next = { x, y, w, h };
    selectionRectRef.current = next;
    setSelectionRect(next);
  }, []);

  useEffect(() => {
    const onWindowMouseUp = (e: MouseEvent) => {
      if (e.button !== 0 || !startRef.current) return;
      const current = selectionRectRef.current;
      const start = startRef.current;
      startRef.current = null;
      if (!start || !current || current.w < MIN_SIZE || current.h < MIN_SIZE) {
        setSelectionRect(null);
        selectionRectRef.current = null;
        return;
      }
      setSelectionRect(null);
      selectionRectRef.current = null;
      setReleasedRect({ x: current.x, y: current.y, w: current.w, h: current.h });
      setPulseDone(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPulseDone(true));
      });
      setTimeout(() => {
        performCapture({ x: current.x, y: current.y, w: current.w, h: current.h });
        setReleasedRect(null);
      }, 120);
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [performCapture]);

  const showSelection = !!selectionRect && (selectionRect.w >= MIN_SIZE || selectionRect.h >= MIN_SIZE);
  const showReleased = releasedRect !== null;

  return (
    <div
      role="presentation"
      aria-hidden
      className="echly-region-overlay"
      style={{ position: "fixed", inset: 0, zIndex: 2147483647, userSelect: "none" }}
    >
      <div
        className="echly-region-overlay-dim"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.05)",
          pointerEvents: overlayVisible ? "auto" : "none",
          cursor: "crosshair",
          zIndex: 2147483646,
          opacity: overlayVisible ? 1 : 0,
          transition: `opacity ${ECHLY_MOTION}`,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          if (!startRef.current) return;
          setSelectionRect(null);
          startRef.current = null;
          selectionRectRef.current = null;
        }}
      />

      {showSelection && selectionRect && (
        <div
          className="echly-region-selection-box"
          style={{
            position: "fixed",
            left: selectionRect.x,
            top: selectionRect.y,
            width: Math.max(selectionRect.w, 1),
            height: Math.max(selectionRect.h, 1),
            border: "1px solid white",
            borderRadius: 4,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.02)",
            pointerEvents: "none",
            zIndex: 2147483646,
            opacity: overlayVisible ? 1 : 0,
            animation: "echly-selection-fade-in 100ms ease-out",
          }}
        />
      )}

      {showReleased && releasedRect && (
        <div
          className="echly-region-released-pulse"
          style={{
            position: "fixed",
            left: releasedRect.x,
            top: releasedRect.y,
            width: releasedRect.w,
            height: releasedRect.h,
            border: "1px solid white",
            borderRadius: 4,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.02)",
            pointerEvents: "none",
            zIndex: 2147483647,
            transition: "transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 140ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            transform: pulseDone ? "scale(1)" : "scale(0.98)",
            opacity: pulseDone ? 1 : 0.8,
          }}
        />
      )}
    </div>
  );
}
