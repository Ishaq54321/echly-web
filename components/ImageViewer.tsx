"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download } from "lucide-react";

export interface ImageViewerProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

export function ImageViewer({ imageUrl, fileName, onClose }: ImageViewerProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = fileName ?? "image";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const displayName = fileName ?? "image";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-150 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={containerRef}
        className={`relative max-w-[95vw] max-h-[80vh] sm:max-w-[90vw] sm:max-h-[85vh] flex flex-col items-center transition-transform duration-150 ease-out ${
          visible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
          aria-label="Close viewer"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="flex flex-1 min-h-0 w-full items-center justify-center">
          <img
            src={imageUrl}
            alt={displayName}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-xl"
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="mt-4 flex items-center gap-2 text-white underline hover:no-underline focus:outline-none focus:underline"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Download
        </button>
      </div>
    </div>
  );
}
