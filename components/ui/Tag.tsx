"use client";

import type { ReactNode } from "react";
import { getTagColor, TAG_CHIP_BASE_CLASS } from "@/lib/tagConfig";

export type TagVariant = "default" | "sidebar";

const SIDEBAR_NEUTRAL_CLASS =
  "bg-neutral-100 text-[12px] text-meta border-neutral-200";

interface TagProps {
  name: string;
  variant?: TagVariant;
  /** When true and variant is "sidebar", use neutral styling instead of semantic color. Use for unselected items. */
  inactive?: boolean;
  className?: string;
  /** Optional remove button - render inside the pill (e.g. dismiss control). Not a native select. */
  children?: ReactNode;
}

const sidebarShell =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium";

export function Tag({ name, variant = "default", inactive = false, className = "", children }: TagProps) {
  const useNeutral = variant === "sidebar" && inactive;
  const colorClass = useNeutral ? SIDEBAR_NEUTRAL_CLASS : getTagColor(name);
  const baseClass = variant === "default" ? TAG_CHIP_BASE_CLASS : sidebarShell;

  return (
    <span
      className={`relative group ${baseClass} ${colorClass} ${children ? "pr-6" : ""} ${className}`}
    >
      <span>{name}</span>
      {children}
    </span>
  );
}
