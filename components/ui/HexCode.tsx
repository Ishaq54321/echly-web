"use client";

import { useRef } from "react";

interface HexCodeProps {
  hex: string;
  /** Legacy click handler — fires without anchor info. */
  onClick?: () => void;
  /** When provided, swatch becomes clickable and fires with its DOM node as anchor. */
  onEdit?: (anchorEl: HTMLElement) => void;
  size?: "sm" | "md";
}

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function HexCode({ hex, onClick, onEdit, size = "sm" }: HexCodeProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  if (!HEX_PATTERN.test(hex)) {
    return (
      <code className="text-[13px] font-mono text-[var(--text-body)]">
        {hex}
      </code>
    );
  }

  const swatchSize = size === "md" ? "w-[14px] h-[14px]" : "w-[11px] h-[11px]";
  const interactive = !!onEdit || !!onClick;

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onEdit) {
      e.stopPropagation();
      e.preventDefault();
      const anchor = spanRef.current ?? (e.currentTarget as HTMLElement);
      onEdit(anchor);
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      if (onEdit) {
        const anchor = spanRef.current ?? (e.currentTarget as HTMLElement);
        onEdit(anchor);
      } else {
        onClick?.();
      }
    }
  };

  return (
    <span
      ref={spanRef}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={[
        "inline-flex items-center align-baseline gap-1.5 px-1.5 py-[1px]",
        "bg-[var(--surface-subtle)] border border-[var(--hair)] rounded-[4px]",
        "text-[13px] font-mono text-[var(--text-body)]",
        interactive
          ? "cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
          : "",
      ].join(" ")}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={onEdit ? "Click to edit color" : undefined}
    >
      <span
        className={`${swatchSize} rounded-[2px] border border-black/10 shrink-0`}
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <span>{hex.toUpperCase()}</span>
    </span>
  );
}
