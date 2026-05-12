"use client";

import { useRef, useState, type CSSProperties, type SyntheticEvent } from "react";

interface ImageBlockProps {
  src: string;
  alt?: string;
  width?: number;
  aspect?: number;
  editable?: boolean;
  onResize?: (newWidth: number) => void;
  onAspectDetected?: (aspect: number) => void;
}

export function ImageBlock({
  src,
  alt,
  width,
  aspect,
  editable = false,
  onResize,
  onAspectDetected,
}: ImageBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startStateRef = useRef<{ x: number; width: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;

    setIsResizing(true);
    startStateRef.current = {
      x: e.clientX,
      width: containerRef.current.offsetWidth,
    };

    const handleMove = (moveEvent: MouseEvent) => {
      if (!startStateRef.current || !containerRef.current) return;
      const deltaX = moveEvent.clientX - startStateRef.current.x;
      const newWidth = Math.max(80, startStateRef.current.width + deltaX);

      const parent = containerRef.current.parentElement;
      const maxWidth = parent ? parent.offsetWidth * 0.95 : 600;
      const clampedWidth = Math.min(newWidth, maxWidth);

      containerRef.current.style.width = `${clampedWidth}px`;
    };

    const handleEnd = () => {
      setIsResizing(false);
      startStateRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);

      if (onResize && containerRef.current) {
        onResize(Math.round(containerRef.current.offsetWidth));
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  };

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!aspect && onAspectDetected) {
      const img = e.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        onAspectDetected(img.naturalWidth / img.naturalHeight);
      }
    }
  };

  const containerStyle: CSSProperties = {
    width: width ? `${width}px` : "min(600px, 95%)",
    maxWidth: "95%",
  };

  return (
    <div
      ref={containerRef}
      className={`image-block${isResizing ? " is-resizing" : ""}`}
      style={containerStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        onLoad={handleImageLoad}
        loading="lazy"
        draggable={false}
      />
      {editable ? (
        <div
          className="image-resize-handle-right"
          onMouseDown={handleResizeStart}
          role="slider"
          aria-label="Resize image"
        />
      ) : null}
    </div>
  );
}

export default ImageBlock;
