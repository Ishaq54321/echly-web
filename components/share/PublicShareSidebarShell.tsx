"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

export function PublicShareSidebarShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#FBFCFD]">
      <div className="shrink-0 border-b border-[#EDF1F5] px-4 py-5">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Echly home">
          <Image src="/Echly_logo.svg" alt="Echly" width={144} height={36} className="h-9 w-auto" />
        </Link>
      </div>
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
