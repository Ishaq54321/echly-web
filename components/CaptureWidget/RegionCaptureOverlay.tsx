"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { buildCaptureContext } from "@/lib/captureContext";
import type { CaptureContext } from "./types";

const MIN_SIZE = 24;

export type Region = { x: number; y: number; w: number; h: number };

const OVERLAY_ID = "echly-capture-overlay";
const TOOLTIP_ID = "echly-capture-tooltip";

export type RegionCaptureOverlayProps = {
  getFullTabImage: () => Promise<string | null>;
  onCapture: (croppedDataUrl: string, context: CaptureContext | null) => void;
  onCancel: () => void;
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
}: RegionCaptureOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectionRect, setSelectionRect] = useState<Region | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRectRef = useRef<Region | null>(null);

  const cancel = useCallback(() => {
    setOverlayVisible(false);
    setSelectionRect(null);
    startRef.current = null;
    selectionRectRef.current = null;
    setTimeout(() => onCancel(), 120);
  }, [onCancel]);

  // ESC to cancel
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
    const x = e.clientX;
    const y = e.clientY;
    startRef.current = { x, y };
    setSelectionRect({ x, y, w: 0, h: 0 });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 16, y: e.clientY + 16 });
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

  const performCapture = useCallback(
    async (targetRect: Region) => {
      setOverlayVisible(false);
      setSelectionRect(null);

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

  const finalizeSelection = useCallback(
    (current: Region | null) => {
      const start = startRef.current;
      startRef.current = null;
      selectionRectRef.current = null;
      if (!start || !current || current.w < MIN_SIZE || current.h < MIN_SIZE) {
        setSelectionRect(null);
        return;
      }
      performCapture({ x: current.x, y: current.y, w: current.w, h: current.h });
    },
    [performCapture]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      finalizeSelection(selectionRectRef.current);
    },
    [finalizeSelection]
  );

  useEffect(() => {
    const onWindowMouseUp = (e: MouseEvent) => {
      if (e.button !== 0 || !startRef.current) return;
      finalizeSelection(selectionRectRef.current);
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [finalizeSelection]);

  const showSelection = !!selectionRect && (selectionRect.w >= MIN_SIZE || selectionRect.h >= MIN_SIZE);

  return (
    <div
      ref={overlayRef}
      role="presentation"
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 2147483647, userSelect: "none" }}
    >
      {/* Overlay: dim only, no blur. Blocks page clicks. */}
      <div
        id={OVERLAY_ID}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.12)",
          pointerEvents: "auto",
          cursor: "crosshair",
          zIndex: 2147483646,
          opacity: overlayVisible ? 1 : 0,
          transition: "opacity 120ms ease",
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

      {/* Drag selection rectangle */}
      {showSelection && selectionRect && (
        <div
          style={{
            position: "fixed",
            left: selectionRect.x,
            top: selectionRect.y,
            width: Math.max(selectionRect.w, 1),
            height: Math.max(selectionRect.h, 1),
            border: "2px solid #3B82F6",
            borderRadius: 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.08)",
            pointerEvents: "none",
            zIndex: 2147483646,
            opacity: overlayVisible ? 1 : 0,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        id={TOOLTIP_ID}
        style={{
          position: "fixed",
          left: tooltipPos.x,
          top: tooltipPos.y,
          padding: "8px 14px",
          borderRadius: 9999,
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          fontSize: "13px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 2147483647,
          transition: "opacity 150ms ease",
          transform: "translateY(-50%)",
        }}
      >
        Drag to select • ESC to cancel
      </div>
    </div>
  );
}
