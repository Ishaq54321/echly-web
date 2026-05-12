"use client";

import { useEffect, useRef, useState } from "react";

export interface LinkPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  initialUrl?: string;
  hasSelection: boolean;
  selectedText?: string;
  onSave: (url: string, text?: string) => void;
  onRemove?: () => void;
  onCancel: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT_EST = 200;
const GAP = 8;

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("mailto:")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function LinkPopover({
  anchorEl,
  open,
  initialUrl = "",
  hasSelection,
  selectedText = "",
  onSave,
  onRemove,
  onCancel,
}: LinkPopoverProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(selectedText);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setText(selectedText);
    }
  }, [open, initialUrl, selectedText]);

  useEffect(() => {
    if (!open || !anchorEl) {
      setPosition(null);
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + GAP;
    let left = rect.left;

    if (left + POPOVER_WIDTH > viewportWidth - 16) {
      left = viewportWidth - POPOVER_WIDTH - 16;
    }
    if (left < 16) left = 16;

    if (top + POPOVER_HEIGHT_EST > viewportHeight - 16) {
      top = rect.top - POPOVER_HEIGHT_EST - GAP;
    }
    if (top < 16) top = 16;

    setPosition({ top, left });
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, anchorEl, onCancel]);

  if (!open || !position) return null;

  const isEditing = !!initialUrl;
  const showTextField = !hasSelection || isEditing;
  const trimmedUrl = url.trim();
  const canSave = trimmedUrl.length > 0;

  const handleApply = () => {
    if (!canSave) return;
    const normalized = normalizeUrl(trimmedUrl);
    onSave(normalized, showTextField ? text.trim() || undefined : undefined);
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 rounded-[var(--radius-btn)] border border-[var(--border)] bg-[var(--surface-card)] shadow-lg p-3"
      style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          URL
        </label>
        <input
          ref={urlInputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="https://example.com"
          className="px-2.5 py-1.5 text-[13px] rounded bg-[var(--layer-1-bg)] text-[var(--text-primary-strong)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
        />

        {showTextField ? (
          <>
            <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mt-1">
              Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder="Link text"
              className="px-2.5 py-1.5 text-[13px] rounded bg-[var(--layer-1-bg)] text-[var(--text-primary-strong)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
            />
          </>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-2">
          {isEditing && onRemove ? (
            <button
              type="button"
              onClick={() => onRemove()}
              className="inline-flex h-[30px] items-center px-3 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--color-danger,#dc2626)] text-[13px] font-medium hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCancel()}
              className="inline-flex h-[30px] items-center px-3 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!canSave}
              className="inline-flex h-[30px] items-center px-3 rounded-[var(--radius-btn)] bg-[var(--text-heading)] text-white text-[13px] font-medium hover:opacity-85 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Update" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
