"use client";

import React from "react";

export type SectionProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export function Section({
  title,
  children,
  className = "",
  ...rest
}: SectionProps) {
  return (
    <section className={className.trim()} {...rest}>
      {title && <h3 className="echly-section-title">{title}</h3>}
      {children}
    </section>
  );
}
