"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { buildCaptureContext } from "@/lib/captureContext";
import type { CaptureContext } from "./types";

const MIN_SIZE = 24;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const BRAND_COLOR = "#2563EB";
const HIGHLIGHT_COLOR = "rgba(37, 99, 235, 0.2)";

export type Region = { x: number; y: number; w: number; h: number };

/** Get topmost page element at (x,y), excluding our overlay and its shadow host. */
function getPageElementAt(clientX: number, clientY: number, overlayRoot: Node | null): Element | null {
  if (typeof document === "undefined" || !document.elementsFromPoint) return null;
  const host = overlayRoot && "host" in overlayRoot ? (overlayRoot as ShadowRoot).host : null;
  const elements = document.elementsFromPoint(clientX, clientY);
  for (const el of elements) {
    const root = el.getRootNode?.();
    if (root === overlayRoot) continue;
    if (host && (el === host || host.contains(el))) continue;
    return el;
  }
  return null;
}

export type RegionCaptureOverlayProps = {
  getFullTabImage: () => Promise<string | null>;
  /** Called with cropped data URL and capture context (URL, scroll, viewport, domPath, nearbyText). */
  onCapture: (croppedDataUrl: string, context: CaptureContext | null) => void;
  onCancel: () => void;
};

/**
 * Crops full tab image to viewport region. Uses devicePixelRatio for HiDPI.
 * Runs off main thread via requestAnimationFrame + async canvas.
 */
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
  const [phase, setPhase] = useState<"selecting" | "frozen" | "confirming" | "confirmingDone">("selecting");
  const [rect, setRect] = useState<Region | null>(null);
  const [hoverRect, setHoverRect] = useState<Region | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [confirmScaleOne, setConfirmScaleOne] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const hoveredElementRef = useRef<Element | null>(null);
  const snappedElementRef = useRef<Element | null>(null);

  const clearSelection = useCallback(() => {
    startRef.current = null;
    isDraggingRef.current = false;
    snappedElementRef.current = null;
    setRect(null);
    setHoverRect(null);
    hoveredElementRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    setOverlayVisible(false);
    clearSelection();
    setTimeout(() => onCancel(), 120);
  }, [onCancel, clearSelection]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        const el = hoveredElementRef.current;
        if (!el || isDraggingRef.current) return;
        try {
          const r = el.getBoundingClientRect();
          if (r.width >= MIN_SIZE && r.height >= MIN_SIZE) {
            setRect({
              x: r.left,
              y: r.top,
              w: r.width,
              h: r.height,
            });
            snappedElementRef.current = el;
            setHoverRect(null);
            hoveredElementRef.current = null;
          }
        } catch (_) {}
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
    setHoverRect(null);
    hoveredElementRef.current = null;
    startRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = true;
    setRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    setPhase("selecting");
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current && startRef.current) {
      const sx = startRef.current.x;
      const sy = startRef.current.y;
      const x = Math.min(sx, e.clientX);
      const y = Math.min(sy, e.clientY);
      const w = Math.abs(e.clientX - sx);
      const h = Math.abs(e.clientY - sy);
      setRect({ x, y, w, h });
      return;
    }
    const root = overlayRef.current?.getRootNode?.() ?? null;
    const el = getPageElementAt(e.clientX, e.clientY, root);
    hoveredElementRef.current = el;
    if (el) {
      try {
        const r = el.getBoundingClientRect();
        setHoverRect({ x: r.left, y: r.top, w: r.width, h: r.height });
      } catch {
        setHoverRect(null);
      }
    } else {
      setHoverRect(null);
    }
  }, []);

  const onMouseUp = useCallback(
    async (e: React.MouseEvent) => {
      if (e.button !== 0 || !isDraggingRef.current || !startRef.current) return;
      e.preventDefault();
      isDraggingRef.current = false;
      const current = rect;
      startRef.current = null;
      if (!current || current.w < MIN_SIZE || current.h < MIN_SIZE) {
        clearSelection();
        cancel();
        return;
      }
      setPhase("frozen");
      await new Promise((r) => setTimeout(r, 100));

      let fullImage: string | null = null;
      try {
        fullImage = await getFullTabImage();
      } catch {
        setPhase("selecting");
        setRect(current);
        cancel();
        return;
      }
      if (!fullImage) {
        setPhase("selecting");
        setRect(current);
        cancel();
        return;
      }

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      let cropped: string;
      try {
        cropped = await cropImageToRegion(fullImage, current, dpr);
      } catch {
        cancel();
        return;
      }

      const context: CaptureContext | null =
        typeof window !== "undefined"
          ? buildCaptureContext(window, snappedElementRef.current ?? null)
          : null;

      setPhase("confirming");
      setRect(current);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            setConfirmScaleOne(true);
            setTimeout(() => {
              setOverlayVisible(false);
              setTimeout(() => onCapture(cropped, context), 120);
            }, 150);
          }, 0);
        });
      });
    },
    [rect, getFullTabImage, onCapture, cancel, clearSelection]
  );

  const showRect = !!rect;
  const isConfirming = phase === "confirming" || phase === "confirmingDone";
  const rectScale = isConfirming && !confirmScaleOne ? 0.98 : 1;

  const showHover = !!hoverRect && !rect && phase === "selecting";

  return (
    <div
      ref={overlayRef}
      role="presentation"
      aria-hidden
      className="region-capture-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        cursor: "crosshair",
        background: "rgba(0, 0, 0, 0.08)",
        backdropFilter: "blur(1px)",
        opacity: overlayVisible ? 1 : 0,
        transition: `opacity 120ms ${EASING}`,
        pointerEvents: overlayVisible ? "auto" : "none",
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={(e) => {
        if (isDraggingRef.current && e.buttons === 0) isDraggingRef.current = false;
        setHoverRect(null);
        hoveredElementRef.current = null;
      }}
    >
      {showHover && hoverRect && (
        <div
          className="region-capture-hover"
          style={{
            position: "fixed",
            left: hoverRect.x,
            top: hoverRect.y,
            width: hoverRect.w,
            height: hoverRect.h,
            border: `2px dashed ${BRAND_COLOR}`,
            borderRadius: 6,
            backgroundColor: HIGHLIGHT_COLOR,
            pointerEvents: "none",
            transition: `opacity 80ms ${EASING}, border-color 80ms ${EASING}`,
          }}
        />
      )}
      {showRect && rect && (
        <div
          className="region-capture-rect"
          style={{
            position: "fixed",
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            border: "2px solid white",
            borderRadius: 6,
            boxShadow: isConfirming
              ? `0 0 0 1px ${BRAND_COLOR}, 0 0 20px rgba(37, 99, 235, 0.4)`
              : "0 0 0 1px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)",
            transform: `scale(${rectScale})`,
            transformOrigin: "center center",
            transition: `transform 150ms ${EASING}, box-shadow 150ms ${EASING}, border-color 150ms ${EASING}`,
            borderColor: isConfirming ? BRAND_COLOR : "white",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
