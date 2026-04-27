"use client";

import { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-full w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--surface-card) 0%, var(--surface-subtle) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(23,117,224,0.08), transparent 60%)",
        }}
      />
      <div
        className="relative z-10 w-full flex flex-col items-center justify-center py-12"
        style={{ minHeight: "100vh" }}
      >
        {children}
      </div>
    </div>
  );
}
