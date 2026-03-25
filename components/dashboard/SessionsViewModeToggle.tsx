"use client";

import { LayoutGrid, LayoutList } from "lucide-react";

export function SessionsViewModeToggle({
  value,
  onChange,
}: {
  value: "list" | "grid";
  onChange: (next: "list" | "grid") => void;
}) {
  const isList = value === "list";
  const nextMode = isList ? "grid" : "list";
  const Icon = isList ? LayoutGrid : LayoutList;
  const label = isList ? "Switch to card view" : "Switch to list view";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onChange(nextMode)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
    >
      <Icon
        size={20}
        strokeWidth={2.1}
        className="[shape-rendering:geometricPrecision]"
        aria-hidden="true"
      />
    </button>
  );
}
