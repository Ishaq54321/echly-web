"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { buildCaptureContext } from "@/lib/captureContext";
import type { CaptureContext } from "./types";

const MIN_SIZE = 24;
const DRAG_THRESHOLD_PX = 5;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const HIGHLIGHT_BLUE = "#3B82F6";

export type Region = { x: number; y: number; w: number; h: number };

const OVERLAY_ID = "echly-capture-overlay";
const HIGHLIGHT_BOX_ID = "echly-highlight-box";
const TOOLTIP_ID = "echly-capture-tooltip";

/** Get nearest meaningful page element at (x,y). Ignores body, overlay, echly-shadow-host. */
function getPageElementAt(clientX: number, clientY: number, overlayRoot: Node | null): Element | null {
  if (typeof document === "undefined" || !document.elementFromPoint) return null;
  const host = overlayRoot && "host" in overlayRoot ? (overlayRoot as ShadowRoot).host : null;
  const el = document.elementFromPoint(clientX, clientY);
  if (!el || el === document.body) return null;
  const root = el.getRootNode?.();
  if (root === overlayRoot) return null;
  if (host && (el === host || host.contains(el))) return null;
  if ((el as Element).id === OVERLAY_ID || (el as Element).id === HIGHLIGHT_BOX_ID || (el as Element).id === TOOLTIP_ID) return null;
  if ((host as Element)?.id === "echly-shadow-host") return null;
  return el;
}

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
  const [highlightRect, setHighlightRect] = useState<Region | null>(null);
  const [dragRect, setDragRect] = useState<Region | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const hoveredElementRef = useRef<Element | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDragModeRef = useRef(false);
  const dragRectRef = useRef<Region | null>(null);

  const clearHighlight = useCallback(() => {
    setHighlightRect(null);
    setDragRect(null);
    hoveredElementRef.current = null;
    dragStartRef.current = null;
    isDragModeRef.current = false;
    dragRectRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    setOverlayVisible(false);
    clearHighlight();
    setTimeout(() => onCancel(), 120);
  }, [onCancel, clearHighlight]);

  // ESC to cancel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
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

  const root = overlayRef.current?.getRootNode?.() ?? null;

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Tooltip: show after short delay, follow cursor with offset
      setTooltipPos({ x: clientX + 16, y: clientY + 16 });
      if (!tooltipVisible) setTooltipVisible(true);

      if (isDragModeRef.current && dragStartRef.current) {
        const sx = dragStartRef.current.x;
        const sy = dragStartRef.current.y;
        const x = Math.min(sx, clientX);
        const y = Math.min(sy, clientY);
        const w = Math.abs(clientX - sx);
        const h = Math.abs(clientY - sy);
        const next = { x, y, w, h };
        dragRectRef.current = next;
        setDragRect(next);
        setHighlightRect(null);
        return;
      }

      const el = getPageElementAt(clientX, clientY, root);
      hoveredElementRef.current = el;
      if (el) {
        try {
          const r = el.getBoundingClientRect();
          setHighlightRect({ x: r.left, y: r.top, w: r.width, h: r.height });
        } catch {
          setHighlightRect(null);
        }
      } else {
        setHighlightRect(null);
      }
    },
    [root, tooltipVisible]
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    isDragModeRef.current = false;
    setDragRect(null);
  }, []);

  const onMouseUp = useCallback(
    async (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const start = dragStartRef.current;
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let targetRect: Region | null = null;
      let targetElement: Element | null = null;

      const currentDragRect = dragRectRef.current;
      if (isDragModeRef.current && currentDragRect && currentDragRect.w >= MIN_SIZE && currentDragRect.h >= MIN_SIZE) {
        targetRect = currentDragRect;
      } else if (!isDragModeRef.current && distance <= DRAG_THRESHOLD_PX) {
        targetElement = hoveredElementRef.current;
        if (targetElement) {
          try {
            const r = targetElement.getBoundingClientRect();
            if (r.width >= MIN_SIZE && r.height >= MIN_SIZE) {
              targetRect = { x: r.left, y: r.top, w: r.width, h: r.height };
            }
          } catch (_) {}
        }
      }

      dragStartRef.current = null;
      isDragModeRef.current = false;
      setDragRect(null);

      if (!targetRect) return;

      // Temporarily hide overlay and highlight so screenshot is crisp
      setOverlayVisible(false);
      setHighlightRect(null);

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
        typeof window !== "undefined"
          ? buildCaptureContext(window, targetElement ?? null)
          : null;

      onCapture(cropped, context);
    },
    [getFullTabImage, onCapture, onCancel]
  );

  // Switch to drag mode when move distance exceeds threshold
  useEffect(() => {
    if (!dragStartRef.current) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStartRef.current || isDragModeRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) {
        isDragModeRef.current = true;
        setHighlightRect(null);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const showHighlight = !!highlightRect && !dragRect && !isDragModeRef.current;
  const showDragRect = !!dragRect && dragRect.w >= MIN_SIZE && dragRect.h >= MIN_SIZE;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        cursor: "crosshair",
        pointerEvents: "auto",
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => {
        if (!isDragModeRef.current) {
          setHighlightRect(null);
          hoveredElementRef.current = null;
        }
      }}
    >
      {/* Step 1: Visual overlay — dimmed/blurred, pointer-events: none. Hidden before capture. */}
      <div
        id={OVERLAY_ID}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
          zIndex: 2147483646,
          opacity: overlayVisible ? 1 : 0,
          transition: "opacity 120ms ease",
        }}
      />

      {/* Step 2: Smart highlight box — follows hover, crisp blue border. Hidden before capture. */}
      {showHighlight && highlightRect && (
        <div
          id={HIGHLIGHT_BOX_ID}
          style={{
            position: "fixed",
            left: highlightRect.x,
            top: highlightRect.y,
            width: highlightRect.w,
            height: highlightRect.h,
            border: "2px solid #3B82F6",
            borderRadius: 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            transition: "all 120ms ease",
            zIndex: 2147483646,
            opacity: overlayVisible ? 1 : 0,
          }}
        />
      )}

      {/* Optional drag selection rectangle */}
      {showDragRect && dragRect && (
        <div
          style={{
            position: "fixed",
            left: dragRect.x,
            top: dragRect.y,
            width: dragRect.w,
            height: dragRect.h,
            border: "2px solid #3B82F6",
            borderRadius: 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            transition: "border-color 120ms ease",
            zIndex: 2147483646,
            opacity: overlayVisible ? 1 : 0,
          }}
        />
      )}

      {/* Step 7: Floating tooltip */}
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
          opacity: tooltipVisible ? 1 : 0,
          transition: "opacity 150ms ease",
          transform: "translateY(-50%)",
        }}
      >
        Click to capture • Drag to select • ESC to cancel
      </div>
    </div>
  );
}
