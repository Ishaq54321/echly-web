"use client";

import { Search } from "lucide-react";

export function SessionsSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 stroke-[2.2]"
        aria-hidden
      />
      <input
        type="search"
        placeholder="Search sessions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-full border border-neutral-200 bg-white pl-9 pr-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
        aria-label="Search sessions"
      />
    </div>
  );
}
