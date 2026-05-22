/**
 * Tag — marketing forklift of components/ui/Tag.tsx
 *
 * Modifications from source:
 * - NONE to JSX / className / styles — copied verbatim.
 * - Dropped the unused `TAG_CHIP_BASE_CLASS` import (source imports it but the
 *   default/sidebar variants compute their own class strings inline; the import
 *   was dead in the original too). No other changes.
 */
"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export type TagVariant = "default" | "sidebar";

interface TagProps {
  name: string;
  variant?: TagVariant;
  inactive?: boolean;
  className?: string;
  children?: ReactNode;
  onRemove?: () => void;
}

const sidebarShell =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium";

export function Tag({ name, variant = "default", inactive: _inactive = false, className = "", children, onRemove }: TagProps) {
  const colorClass = variant === "default" ? "" : "bg-[var(--surface-subtle)] text-[var(--text-body)] border-transparent";
  const baseClass = variant === "default"
    ? "inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--hair)] text-[14px] font-medium text-[var(--text-body)] hover:text-[var(--text-body)] transition-colors cursor-default"
    : sidebarShell;

  return (
    <span
      className={`relative group ${baseClass} ${colorClass} ${className}`}
    >
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-5 w-5 rounded-full bg-[var(--color-danger)] flex items-center justify-center shadow-sm cursor-pointer"
        >
          <X className="h-3 w-3 text-white" strokeWidth={2.5} />
        </button>
      )}
      {children}
    </span>
  );
}
