"use client";

import { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(70,110,255,0.08), transparent 60%)",
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
