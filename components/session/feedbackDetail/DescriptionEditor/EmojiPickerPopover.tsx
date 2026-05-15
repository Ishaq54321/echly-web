"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { usePortalHost } from "./PortalHost";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export interface EmojiPickerPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 360;
const GAP = 4;

export function EmojiPickerPopover({
  anchorEl,
  open,
  onSelect,
  onClose,
}: EmojiPickerPopoverProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const portalHost = usePortalHost();

  useEffect(() => {
    if (!open || !anchorEl) {
      setPosition(null);
      return;
    }
    const compute = () => {
      const rect = anchorEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = rect.bottom + GAP;
      let left = rect.left;

      if (left + POPOVER_WIDTH > viewportWidth - 16) {
        left = viewportWidth - POPOVER_WIDTH - 16;
      }
      if (left < 16) left = 16;

      if (top + POPOVER_HEIGHT > viewportHeight - 16) {
        top = rect.top - POPOVER_HEIGHT - GAP;
      }
      if (top < 16) top = 16;

      setPosition({ top, left });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, anchorEl, onClose]);

  if (!open || !position || !portalHost) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className="description-editor-portal fixed rounded-[var(--radius-btn)] border border-[var(--border)] bg-[var(--surface-card)] overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 2147483700,
        boxShadow: "var(--shadow-panel)",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <EmojiPicker
        onEmojiClick={(emojiData: { emoji: string }) => {
          onSelect(emojiData.emoji);
        }}
        width={POPOVER_WIDTH}
        height={POPOVER_HEIGHT}
        searchPlaceHolder="Search emoji..."
        previewConfig={{ showPreview: false }}
      />
    </div>,
    portalHost,
  );
}
