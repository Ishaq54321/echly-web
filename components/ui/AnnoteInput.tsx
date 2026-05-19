"use client";

import React from "react";

export type AnnoteInputProps = {
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function AnnoteInput({ className = "", ...props }: AnnoteInputProps) {
  return <input className={`echly-input ${className}`.trim()} {...props} />;
}
