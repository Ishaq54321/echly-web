"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
  title?: string;
  shape?: "circle" | "square";
  confirmLabel?: string;
}

const OUTPUT_SIZE = 400;
const MAX_ZOOM = 3;

function clampPosition(
  x: number,
  y: number,
  currentScale: number,
  imgW: number,
  imgH: number,
  canvasSize: number,
  circleR: number
): { x: number; y: number } {
  const scaledW = imgW * currentScale;
  const scaledH = imgH * currentScale;
  const cropLeft = canvasSize / 2 - circleR;
  const cropRight = canvasSize / 2 + circleR;
  const cropTop = canvasSize / 2 - circleR;
  const cropBottom = canvasSize / 2 + circleR;
  const clampedX = Math.min(cropLeft, Math.max(cropRight - scaledW, x));
  const clampedY = Math.min(cropTop, Math.max(cropBottom - scaledH, y));
  return { x: clampedX, y: clampedY };
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onConfirm,
  onCancel,
  onError,
  title = "Crop profile photo",
  shape = "circle",
  confirmLabel,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const minScaleRef = useRef<number>(0.1);

  const [scale, setScale] = useState(1);
  const [imgX, setImgX] = useState(0);
  const [imgY, setImgY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const [canvasSize, setCanvasSize] = useState(400);
  const [minScale, setMinScale] = useState(0.1);

  // Load image and set initial scale/position
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const area = cropAreaRef.current;
      const size = area ? area.clientWidth : 400;
      setCanvasSize(size);

      const localCircleR = (size * 0.72) / 2;
      const cropDiameter = localCircleR * 2;
      const minFitScale = Math.max(cropDiameter / img.width, cropDiameter / img.height);
      const fitWholeImage = Math.min(size / img.width, size / img.height);
      const initialScale = Math.max(fitWholeImage, minFitScale);

      minScaleRef.current = minFitScale;
      setMinScale(minFitScale);
      setScale(initialScale);

      const initX = (size - img.width * initialScale) / 2;
      const initY = (size - img.height * initialScale) / 2;
      const clamped = clampPosition(initX, initY, initialScale, img.width, img.height, size, localCircleR);
      setImgX(clamped.x);
      setImgY(clamped.y);
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, imgX, imgY, img.width * scale, img.height * scale);
  }, [imgX, imgY, scale]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, imgX, imgY });
  }, [imgX, imgY]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const img = imgRef.current;
    if (!img) return;
    const newX = dragStart.imgX + (e.clientX - dragStart.x);
    const newY = dragStart.imgY + (e.clientY - dragStart.y);
    const circleR = (canvasSize * 0.72) / 2;
    const clamped = clampPosition(newX, newY, scale, img.width, img.height, canvasSize, circleR);
    setImgX(clamped.x);
    setImgY(clamped.y);
  }, [dragging, dragStart, scale, canvasSize]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const img = imgRef.current;
    if (!img) return;
    const rawNewScale = scale - e.deltaY * 0.002;
    const newScale = Math.min(MAX_ZOOM, Math.max(minScaleRef.current, rawNewScale));
    setScale(newScale);
    const circleR = (canvasSize * 0.72) / 2;
    const clamped = clampPosition(imgX, imgY, newScale, img.width, img.height, canvasSize, circleR);
    setImgX(clamped.x);
    setImgY(clamped.y);
  }, [scale, imgX, imgY, canvasSize]);

  // Touch drag & pinch
  const touchRef = useRef<{ x: number; y: number; imgX: number; imgY: number } | null>(null);
  const lastPinchRef = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, imgX, imgY };
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchRef.current = Math.hypot(dx, dy);
    }
  }, [imgX, imgY]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const img = imgRef.current;
    if (!img) return;
    const circleR = (canvasSize * 0.72) / 2;
    if (e.touches.length === 1 && touchRef.current) {
      const newX = touchRef.current.imgX + (e.touches[0].clientX - touchRef.current.x);
      const newY = touchRef.current.imgY + (e.touches[0].clientY - touchRef.current.y);
      const clamped = clampPosition(newX, newY, scale, img.width, img.height, canvasSize, circleR);
      setImgX(clamped.x);
      setImgY(clamped.y);
    }
    if (e.touches.length === 2 && lastPinchRef.current != null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / lastPinchRef.current;
      lastPinchRef.current = newDist;
      const rawNewScale = scale * ratio;
      const newScale = Math.min(MAX_ZOOM, Math.max(minScaleRef.current, rawNewScale));
      setScale(newScale);
      const clamped = clampPosition(imgX, imgY, newScale, img.width, img.height, canvasSize, circleR);
      setImgX(clamped.x);
      setImgY(clamped.y);
    }
  }, [scale, imgX, imgY, canvasSize]);

  const onTouchEnd = useCallback(() => {
    touchRef.current = null;
    lastPinchRef.current = null;
  }, []);

  const handleConfirm = useCallback(() => {
    const img = imgRef.current;
    if (!img) { onError?.("Could not process image. Please try again."); return; }

    const out = document.createElement("canvas");
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const ctx = out.getContext("2d");
    if (!ctx) { onError?.("Could not process image. Please try again."); return; }

    const circleR = (canvasSize * 0.72) / 2;
    const circleCx = canvasSize / 2;
    const circleCy = canvasSize / 2;

    // Scale from canvas coords to output
    const scaleOut = OUTPUT_SIZE / (circleR * 2);

    ctx.save();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Map the circle region to the output canvas
    const srcX = circleCx - circleR;
    const srcY = circleCy - circleR;
    const srcSize = circleR * 2;

    // imgX/imgY are where the image is drawn on canvas
    // We need to map the circle area of the canvas to the output
    const drawX = (imgX - srcX) * scaleOut;
    const drawY = (imgY - srcY) * scaleOut;
    const drawW = img.width * scale * scaleOut;
    const drawH = img.height * scale * scaleOut;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    void srcSize; // used conceptually above

    out.toBlob(
      (blob) => {
        if (!blob) {
          onError?.("Could not save crop. Please try again.");
          return;
        }
        onConfirm(blob);
      },
      "image/jpeg",
      0.92
    );
  }, [canvasSize, imgX, imgY, scale, shape, onConfirm, onError]);

  if (!isOpen) return null;

  const circleSize = canvasSize * 0.72;

  return (
    <ModalPortal>
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: MODAL_LAYER_Z_INDEX,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          maxWidth: 480,
          width: "100%",
          margin: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          animation: "cropModalIn 240ms ease",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{title}</span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              borderRadius: 8,
              cursor: "pointer",
              color: "#555",
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={cropAreaRef}
          style={{
            width: "100%",
            aspectRatio: "1",
            background: "#1A1A1A",
            position: "relative",
            overflow: "hidden",
            cursor: dragging ? "grabbing" : "grab",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
          {/* Circle overlay */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: circleSize,
              height: circleSize,
              borderRadius: shape === "circle" ? "50%" : 12,
              border: "none",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Zoom control */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "#777", flexShrink: 0 }}>Zoom</span>
          <input
            type="range"
            min={minScale}
            max={MAX_ZOOM}
            step={0.01}
            value={scale}
            onChange={(e) => {
              const newScale = Number(e.target.value);
              setScale(newScale);
              const img = imgRef.current;
              if (img) {
                const circleR = (canvasSize * 0.72) / 2;
                const clamped = clampPosition(imgX, imgY, newScale, img.width, img.height, canvasSize, circleR);
                setImgX(clamped.x);
                setImgY(clamped.y);
              }
            }}
            style={{ flex: 1, accentColor: "#1775E0" }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "0 16px",
              height: 40,
              borderRadius: 10,
              border: "1px solid var(--border-strong)",
              background: "white",
              color: "var(--text-body)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: "0 20px",
              height: 40,
              borderRadius: 10,
              border: "none",
              background: "#1775E0",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmLabel ?? "Save photo"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cropModalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
    </ModalPortal>
  );
}
