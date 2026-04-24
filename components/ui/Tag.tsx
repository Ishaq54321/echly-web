"use client";

import type { ReactNode } from "react";
import { TAG_CHIP_BASE_CLASS } from "@/lib/tagConfig";

export type TagVariant = "default" | "sidebar";

interface TagProps {
  name: string;
  variant?: TagVariant;
  inactive?: boolean;
  className?: string;
  children?: ReactNode;
}

const sidebarShell =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium";

export function Tag({ name, variant = "default", inactive: _inactive = false, className = "", children }: TagProps) {
  const colorClass = "bg-gray-50 text-gray-700 border-[#EBEBEB]";
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
