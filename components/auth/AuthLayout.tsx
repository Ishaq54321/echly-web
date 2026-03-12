"use client";

import { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#FFFFFF]"
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(159,232,112,0.12), transparent 60%)",
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
