"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export interface ImageViewerProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

export function ImageViewer({ imageUrl, fileName, onClose }: ImageViewerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

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
    <Modal
      open
      onClose={onClose}
      overlayClassName={`bg-black/80 backdrop-blur-md transition-opacity duration-150 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      panelClassName="w-full h-full max-w-none bg-transparent shadow-none rounded-none"
    >
      <div
        className={`relative w-full h-full flex items-center justify-center p-4 sm:p-6 transition-transform duration-150 ease-out ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
          aria-label="Close viewer"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="flex h-full w-full items-center justify-center">
          <img
            src={imageUrl}
            alt={displayName}
            className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-xl"
            loading="eager"
            decoding="async"
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white underline hover:no-underline focus:outline-none focus:underline"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Download
        </button>
      </div>
    </Modal>
  );
}
