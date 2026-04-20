"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  title?: string;
  shape?: "circle" | "square";
}

const OUTPUT_SIZE = 400;

export function ImageCropModal({
  isOpen,
  imageSrc,
  onConfirm,
  onCancel,
  title = "Crop profile photo",
  shape = "circle",
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [imgX, setImgX] = useState(0);
  const [imgY, setImgY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const [canvasSize, setCanvasSize] = useState(400);

  // Load image and center it
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const area = cropAreaRef.current;
      const size = area ? area.clientWidth : 400;
      setCanvasSize(size);
      const fitScale = Math.max(size / img.width, size / img.height) * 1.0;
      const s = Math.max(fitScale, 1);
      setScale(s);
      setImgX((size - img.width * s) / 2);
      setImgY((size - img.height * s) / 2);
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
    setImgX(dragStart.imgX + (e.clientX - dragStart.x));
    setImgY(dragStart.imgY + (e.clientY - dragStart.y));
  }, [dragging, dragStart]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const next = prev - e.deltaY * 0.002;
      return Math.max(0.5, Math.min(5, next));
    });
  }, []);

  // Touch drag
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
    if (e.touches.length === 1 && touchRef.current) {
      setImgX(touchRef.current.imgX + (e.touches[0].clientX - touchRef.current.x));
      setImgY(touchRef.current.imgY + (e.touches[0].clientY - touchRef.current.y));
    }
    if (e.touches.length === 2 && lastPinchRef.current != null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / lastPinchRef.current;
      lastPinchRef.current = newDist;
      setScale((prev) => Math.max(0.5, Math.min(5, prev * ratio)));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    touchRef.current = null;
    lastPinchRef.current = null;
  }, []);

  const handleConfirm = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const out = document.createElement("canvas");
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const ctx = out.getContext("2d");
    if (!ctx) return;

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
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.92
    );
  }, [canvasSize, imgX, imgY, scale, shape, onConfirm]);

  if (!isOpen) return null;

  const circleSize = canvasSize * 0.72;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
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
            borderBottom: "1px solid #EBEBEB",
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
            min={0.5}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#1775E0" }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #EBEBEB",
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
              border: "1px solid #D1D5DB",
              background: "white",
              color: "#374151",
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
            Save photo
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
  );
}
