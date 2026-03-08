"use client";

import React from "react";

export type EchlyButtonVariant = "primary" | "secondary" | "ghost";

export type EchlyButtonProps = {
  variant?: EchlyButtonVariant;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function EchlyButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: EchlyButtonProps) {
  return (
    <button
      type="button"
      className={`echly-btn echly-btn--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
