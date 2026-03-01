"use client";

import { getTagPillClass } from "@/lib/tagConfig";

export type TagVariant = "default" | "sidebar";

const SIDEBAR_NEUTRAL_CLASS = "bg-neutral-100 text-[12px] text-neutral-400";

interface TagProps {
  name: string;
  variant?: TagVariant;
  /** When true and variant is "sidebar", use neutral styling instead of semantic color. Use for unselected items. */
  inactive?: boolean;
  className?: string;
  /** Optional remove button - render inside the pill (e.g. ✕). Not a native select. */
  children?: React.ReactNode;
}

const variantClasses: Record<TagVariant, string> = {
  default: "rounded-full px-3 py-1 text-xs font-medium",
  sidebar: "rounded-full px-2 py-0.5 text-[12px]",
};

export function Tag({ name, variant = "default", inactive = false, className = "", children }: TagProps) {
  const useNeutral = variant === "sidebar" && inactive;
  const colorClass = useNeutral ? SIDEBAR_NEUTRAL_CLASS : getTagPillClass(name);
  const baseClass = variantClasses[variant];

  return (
    <span
      className={`relative group inline-flex items-center ${baseClass} ${colorClass} ${children ? "pr-6" : ""} ${className}`}
    >
      <span>{name}</span>
      {children}
    </span>
  );
}
