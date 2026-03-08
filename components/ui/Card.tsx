"use client";

import React from "react";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
} & React.HTMLAttributes<HTMLElement>;

export function Card({
  children,
  className = "",
  as: Component = "div",
  ...rest
}: CardProps) {
  return (
    <Component className={`echly-card ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}
