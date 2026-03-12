"use client";

import React from "react";

const cardBase = "rounded-[16px] transition-colors duration-150";

const cardDefault =
  "bg-white border border-[#E3E6E5] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

const cardCurrency =
  "bg-white border border-[#E3E6E5] rounded-[16px] p-6 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

const cardAddAccount =
  "border-2 border-dashed border-[#DADDDD] bg-transparent rounded-2xl flex flex-col items-center justify-center min-h-[120px]";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  variant?: "default" | "currency" | "addAccount";
} & React.HTMLAttributes<HTMLElement>;

export function Card({
  children,
  className = "",
  as: Component = "div",
  variant = "default",
  ...rest
}: CardProps) {
  const variantClass =
    variant === "currency"
      ? cardCurrency
      : variant === "addAccount"
        ? cardAddAccount
        : cardDefault;
  return (
    <Component
      className={`echly-card ${cardBase} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Currency card: soft surface, header row (e.g. flag + label), amount with large bold typography */
export function CurrencyCard({
  children,
  className = "",
  ...rest
}: Omit<CardProps, "variant">) {
  return (
    <Card variant="currency" className={className} {...rest}>
      {children}
    </Card>
  );
}

/** Add account placeholder: dashed border, centered plus icon */
export function AddAccountCard({
  children,
  className = "",
  ...rest
}: Omit<CardProps, "variant">) {
  return (
    <Card variant="addAccount" className={className} {...rest}>
      {children}
    </Card>
  );
}
