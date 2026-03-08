"use client";

import React from "react";

export type DividerProps = {
  className?: string;
} & React.HTMLAttributes<HTMLHRElement>;

export function Divider({ className = "", ...rest }: DividerProps) {
  return <hr className={`echly-divider ${className}`.trim()} {...rest} />;
}
