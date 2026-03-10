"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface DragGhostChipProps {
  visible: boolean;
  sessionTitle?: string;
}

export function DragGhostChip({ visible, sessionTitle }: DragGhostChipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const updatePosition = (e: { clientX: number; clientY: number }) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMove = (e: MouseEvent) => updatePosition(e);
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      updatePosition(e);
    };
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("dragover", handleDragOver);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("dragover", handleDragOver);
    };
  }, [visible]);

  if (!visible || typeof document === "undefined" || !mounted) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9998] bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-sm text-sm text-neutral-700 whitespace-nowrap max-w-[200px] truncate"
      style={{
        left: position.x + 12,
        top: position.y + 12,
      }}
    >
      📄 Moving session{sessionTitle ? `: ${sessionTitle.length > 20 ? sessionTitle.slice(0, 20) + "…" : sessionTitle}` : ""}
    </div>,
    document.body
  );
}
