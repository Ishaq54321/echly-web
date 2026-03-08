"use client";

import React from "react";

export type StackGap = 8 | 12 | 16 | 20 | 24;

export type StackProps = {
  children: React.ReactNode;
  gap?: StackGap;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Stack({
  children,
  gap = 16,
  className = "",
  ...rest
}: StackProps) {
  const gapClass =
    gap !== 16 ? `echly-stack--gap-${gap}` : "";
  return (
    <div
      className={`echly-stack ${gapClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
