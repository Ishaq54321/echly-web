"use client";

import React from "react";

export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
} & React.HTMLAttributes<HTMLElement>;

/**
 * Global layout container: max-width 1200px, horizontal padding 24px.
 * All pages should wrap main content in this for consistent width.
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
  ...rest
}: ContainerProps) {
  return (
    <Component
      className={`max-w-[1200px] mx-auto px-6 ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}
