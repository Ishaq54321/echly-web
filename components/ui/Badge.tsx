"use client";

import React from "react";

export type BadgeVariant = "neutral" | "accent";

const baseClass = "rounded-full font-medium inline-flex items-center text-[13px]";
const neutralClass =
  "bg-[#F1F3F2] text-[#111111] py-1 px-2.5";
const accentClass = "bg-[#DDF3C8] text-[#111111] py-1 px-2.5";

export type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const variantClass = variant === "accent" ? accentClass : neutralClass;
  return (
    <span
      className={`${baseClass} ${variantClass} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
