"use client";

import React from "react";

export type SkeletonVariant = "line" | "circle" | "rect";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  variant = "line",
  width,
  height,
  className = "",
  style,
}: SkeletonProps) {
  const variantClass =
    variant === "circle"
      ? "echly-skeleton echly-skeleton--circle"
      : variant === "line"
        ? "echly-skeleton echly-skeleton--line"
        : "echly-skeleton";

  return (
    <span
      className={[variantClass, className].filter(Boolean).join(" ")}
      style={{
        display: "block",
        width: width ?? (variant === "circle" ? 32 : "100%"),
        height: height ?? (variant === "circle" ? 32 : variant === "line" ? 12 : 40),
        borderRadius: variant === "circle" ? "9999px" : undefined,
        ...style,
      }}
      aria-hidden
    />
  );
}
