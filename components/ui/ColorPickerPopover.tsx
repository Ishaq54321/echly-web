"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerPopoverProps {
  /** Element to anchor to (positioned below it). */
  anchorEl: HTMLElement | null;
  /** Initial hex value. */
  initialColor: string;
  /** Called when user confirms a new color. */
  onSave: (newColor: string) => void;
  /** Called when user cancels (Escape, click outside, or Cancel button). */
  onCancel: () => void;
}

const POPOVER_WIDTH = 240;
const POPOVER_HEIGHT = 320;
const GAP = 8;

export function ColorPickerPopover({
  anchorEl,
  initialColor,
  onSave,
  onCancel,
}: ColorPickerPopoverProps) {
  const [color, setColor] = useState(initialColor);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColor(initialColor);
  }, [initialColor]);

  useEffect(() => {
    if (!anchorEl) return;

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
  }, [anchorEl]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && isValidHex(color)) {
        e.preventDefault();
        onSave(color.toUpperCase());
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [color, onCancel, onSave]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onCancel();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [anchorEl, onCancel]);

  if (!position) return null;

  const valid = isValidHex(color);
  const previewColor = valid ? color : initialColor;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 rounded-[var(--radius-btn)] border border-[var(--border)] bg-[var(--surface-card)] shadow-lg p-3"
      style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <HexColorPicker color={color} onChange={setColor} />

      <div className="mt-3 flex items-center gap-2">
        <span
          className="w-6 h-6 rounded border border-black/10 shrink-0"
          style={{ backgroundColor: previewColor }}
          aria-hidden="true"
        />
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => setColor(normalizeHexInput(e.target.value))}
          className={[
            "flex-1 px-2 py-1 text-[13px] font-mono rounded",
            "bg-[var(--layer-1-bg)] text-[var(--text-primary-strong)]",
            "border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]",
            valid
              ? "border-[var(--border)]"
              : "border-[var(--semantic-error,#dc2626)]",
          ].join(" ")}
          placeholder="#RRGGBB"
          maxLength={7}
          autoFocus
        />
      </div>

      {!valid && (
        <p className="text-xs text-[var(--semantic-error,#dc2626)] mt-1">
          Use format #RRGGBB
        </p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-[30px] items-center px-3 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => valid && onSave(color.toUpperCase())}
          disabled={!valid}
          className="inline-flex h-[30px] items-center px-3 rounded-[var(--radius-btn)] bg-[var(--text-heading)] text-white text-[13px] font-medium hover:opacity-85 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeHexInput(value: string): string {
  let v = value.trim();
  if (v.length > 0 && !v.startsWith("#")) {
    v = "#" + v;
  }
  return v;
}
