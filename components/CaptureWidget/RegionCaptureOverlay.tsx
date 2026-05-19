"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { buildCaptureContext, isAnnoteElement } from "@/lib/captureContext";
import { ECHLY_DEBUG } from "@/lib/utils/logger";
import { playShutterSound } from "@/lib/playShutterSound";
import type { CaptureContext } from "@/lib/capture-engine/core/types";

const MIN_SIZE = 24;
const ECHLY_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const SEMANTIC_CONTAINERS = new Set([
  "ARTICLE", "SECTION", "ASIDE", "MAIN", "FORM", "DIALOG", "NAV", "HEADER", "FOOTER",
]);

const CONTAINER_ROLES = new Set([
  "dialog", "region", "article", "form", "navigation", "banner", "contentinfo",
]);

function hasVisualBoundary(style: CSSStyleDeclaration): boolean {
  const bg = style.backgroundColor;
  if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") return true;

  const bw = parseFloat(style.borderTopWidth) || 0;
  if (bw >= 1) return true;

  if (style.boxShadow && style.boxShadow !== "none") return true;

  const br = parseFloat(style.borderRadius) || 0;
  if (br >= 4) return true;

  return false;
}

function isSemanticContainer(el: Element): boolean {
  if (SEMANTIC_CONTAINERS.has(el.tagName)) return true;
  const role = el.getAttribute("role");
  if (role && CONTAINER_ROLES.has(role)) return true;
  return false;
}

export function detectVisualContainer(el: Element): DOMRect {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  let node: Element | null = el;
  let bestRect = el.getBoundingClientRect();
  let found = false;
  let levels = 0;

  while (node && node !== document.body && levels < 15) {
    levels++;
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);

    if (rect.width < 2 || rect.height < 2) {
      node = node.parentElement;
      continue;
    }

    if (rect.width / viewportW > 0.70 || rect.height / viewportH > 0.50) {
      break;
    }

    if (hasVisualBoundary(style) || isSemanticContainer(node)) {
      bestRect = rect;
      found = true;
      break;
    }

    node = node.parentElement;
  }

  if (!found) {
    bestRect = el.getBoundingClientRect();
  }

  return bestRect;
}

export type Region = { x: number; y: number; w: number; h: number };

export function clampRect(rect: { x: number; y: number; w?: number; h?: number; width?: number; height?: number }): Region {
  let w = rect.w ?? rect.width ?? 0;
  let h = rect.h ?? rect.height ?? 0;
  let x = rect.x;
  let y = rect.y;

  if (x < 0) { x = 0; }
  if (y < 0) { y = 0; }

  const maxW = window.innerWidth - x;
  const maxH = window.innerHeight - y;
  w = Math.min(w, maxW);
  h = Math.min(h, maxH);

  return { x, y, w: Math.max(0, w), h: Math.max(0, h) };
}

export type RegionCaptureOverlayProps = {
  getFullTabImage: () => Promise<string | null>;
  onAddVoice: (croppedDataUrl: string, context: CaptureContext | null) => void;
  onCancel: () => void;
  onSelectionStart?: () => void;
};

export async function cropImageToRegion(
  fullImageDataUrl: string,
  region: Region,
  dpr: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const expectedW = window.innerWidth * dpr;
      const expectedH = window.innerHeight * dpr;
      if (
        (Math.abs(img.width - expectedW) > 2 ||
          Math.abs(img.height - expectedH) > 2) &&
        ECHLY_DEBUG
      ) {
        console.warn("ECHLY: screenshot dimension mismatch", {
          imgW: img.width,
          imgH: img.height,
          expectedW,
          expectedH,
        });
      }
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
  onAddVoice,
  onCancel,
  onSelectionStart,
}: RegionCaptureOverlayProps) {
  const [selectionRect, setSelectionRect] = useState<Region | null>(null);
  const [releasedRect, setReleasedRect] = useState<Region | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [flashBorder, setFlashBorder] = useState(false);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRectRef = useRef<Region | null>(null);

  const cancel = useCallback(() => {
    setSelectionRect(null);
    setReleasedRect(null);
    startRef.current = null;
    selectionRectRef.current = null;
    setTimeout(() => onCancel(), 120);
  }, [onCancel]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (releasedRect) {
          setReleasedRect(null);
          setSelectionRect(null);
          selectionRectRef.current = null;
          startRef.current = null;
        } else {
          cancel();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cancel, releasedRect]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") cancel();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [cancel]);

  const performCapture = useCallback(
    async (targetRect: Region) => {
      if (confirming) return;
      setConfirming(true);
      playShutterSound();
      setFlashBorder(true);
      setTimeout(() => setFlashBorder(false), 150);

      await new Promise((r) => setTimeout(r, 200));

      let fullImage: string | null = null;
      try {
        fullImage = await getFullTabImage();
      } catch {
        setConfirming(false);
        onCancel();
        return;
      }

      const centerX = targetRect.x + targetRect.w / 2;
      const centerY = targetRect.y + targetRect.h / 2;
      let element: Element | null =
        typeof document !== "undefined"
          ? document.elementFromPoint(centerX, centerY)
          : null;
      while (element && isAnnoteElement(element)) {
        element = element.parentElement;
      }
      if (!element) element = document.body;

      if (!fullImage) {
        setConfirming(false);
        onCancel();
        return;
      }

      if (ECHLY_DEBUG) {
        console.log("[ECHLY] Captured viewport screenshot");
        console.log("ECHLY ELEMENT DETECTED", element);
      }

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const containerRect = detectVisualContainer(element);
      const safeRect = clampRect({
        x: containerRect.x,
        y: containerRect.y,
        w: containerRect.width,
        h: containerRect.height,
      });

      if (ECHLY_DEBUG) console.log("ECHLY CONTAINER RECT", safeRect);

      let containerCrop: string;
      try {
        containerCrop = await cropImageToRegion(fullImage, safeRect, dpr);
      } catch {
        setConfirming(false);
        onCancel();
        return;
      }

      const context: CaptureContext | null =
        typeof window !== "undefined"
          ? buildCaptureContext(window, element)
          : null;

      if (context) {
        const xPercent =
          ((targetRect.x + targetRect.w / 2 - safeRect.x) / safeRect.w) * 100;
        const yPercent =
          ((targetRect.y + targetRect.h / 2 - safeRect.y) / safeRect.h) * 100;
        context.pinPosition = { xPercent, yPercent };
      }

      onAddVoice(containerCrop, context);
      setConfirming(false);
      setReleasedRect(null);
    },
    [getFullTabImage, onAddVoice, onCancel, confirming]
  );

  const handleRetake = useCallback(() => {
    setReleasedRect(null);
    setSelectionRect(null);
    selectionRectRef.current = null;
    startRef.current = null;
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || releasedRect) return;
    e.preventDefault();
    onSelectionStart?.();
    const x = e.clientX;
    const y = e.clientY;
    startRef.current = { x, y };
    setSelectionRect({ x, y, w: 0, h: 0 });
  }, [onSelectionStart, releasedRect]);

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
    },
    []
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!startRef.current || releasedRect) return;
    const sx = startRef.current.x;
    const sy = startRef.current.y;
    const x = Math.min(sx, e.clientX);
    const y = Math.min(sy, e.clientY);
    const w = Math.abs(e.clientX - sx);
    const h = Math.abs(e.clientY - sy);
    const next = { x, y, w, h };
    selectionRectRef.current = next;
    setSelectionRect(next);
  }, [releasedRect]);

  useEffect(() => {
    const onWindowMouseUp = (e: MouseEvent) => {
      if (e.button !== 0 || !startRef.current || releasedRect) return;
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
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [releasedRect]);

  const showSelection = !!selectionRect && (selectionRect.w >= MIN_SIZE || selectionRect.h >= MIN_SIZE);
  const showReleased = releasedRect !== null;

  const hasSelection = (showSelection && selectionRect) || (showReleased && releasedRect);
  const rect = showReleased ? releasedRect! : selectionRect!;

  return (
    <div
      id="echly-overlay"
      role="presentation"
      aria-hidden
      className="echly-region-overlay"
      data-annote-ui="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        userSelect: "none",
      }}
    >
      {/* Full-screen dim when no selection; transparent when selection exists (cutout provides dim) */}
      <div
        className="echly-region-overlay-dim"
        style={{
          position: "fixed",
          inset: 0,
          background: hasSelection ? "transparent" : "rgba(0,0,0,0.4)",
          pointerEvents: releasedRect ? "none" : "auto",
          cursor: "crosshair",
          zIndex: 999998,
          transition: `background 180ms ${ECHLY_EASE}`,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          if (!startRef.current || releasedRect) return;
          setSelectionRect(null);
          startRef.current = null;
          selectionRectRef.current = null;
        }}
      />

      {/* Top-center hint */}
      <div
        className="echly-region-hint"
        style={{
          position: "fixed",
          left: "50%",
          top: 24,
          transform: "translateX(-50%)",
          zIndex: 999999,
          pointerEvents: "none",
          opacity: releasedRect ? 0 : 1,
          transition: `opacity 180ms ${ECHLY_EASE}`,
        }}
      >
        Drag to capture area — ESC to cancel
      </div>

      {/* Cutout: selected area clear, outside dimmed via box-shadow */}
      {hasSelection && rect && (
        <div
          className="echly-region-cutout"
          style={{
            position: "fixed",
            left: rect.x,
            top: rect.y,
            width: Math.max(rect.w, 1),
            height: Math.max(rect.h, 1),
            border: `2px solid ${flashBorder ? "#FFFFFF" : "#5A49BF"}`,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            zIndex: 999998,
            borderRadius: 14,
            transition: flashBorder ? "none" : `border-color 150ms ${ECHLY_EASE}`,
          }}
        />
      )}

      {/* Confirmation bar: Retake | Speak feedback */}
      {showReleased && releasedRect && (
        <div
          className="echly-region-confirm-bar"
          style={{
            position: "fixed",
            left: releasedRect.x + releasedRect.w / 2,
            bottom: Math.max(12, releasedRect.y + releasedRect.h - 48),
            transform: "translate(-50%, 100%)",
            display: "flex",
            pointerEvents: "auto",
            background: "rgba(20,22,28,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            zIndex: 999999,
            animation: `echly-confirm-bar-in 220ms ${ECHLY_EASE} forwards`,
          }}
        >
          <button
            type="button"
            onClick={handleRetake}
            className="echly-region-confirm-btn"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.9)",
              cursor: "pointer",
            }}
          >
            Retake
          </button>
          <button
            type="button"
            onClick={() => performCapture(releasedRect!)}
            disabled={confirming}
            className="echly-region-confirm-btn"
            style={{
              background: "#5A49BF",
              color: "#fff",
              fontWeight: 600,
              cursor: confirming ? "not-allowed" : "pointer",
            }}
          >
            Speak feedback
          </button>
        </div>
      )}
    </div>
  );
}
