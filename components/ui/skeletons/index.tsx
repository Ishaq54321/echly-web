"use client";

import type { HTMLAttributes } from "react";

export function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

type SkeletonBaseProps = HTMLAttributes<HTMLDivElement> & {
  animate?: boolean;
};

export function SkeletonBase({
  className,
  animate = true,
  ...rest
}: SkeletonBaseProps) {
  return (
    <div
      className={cx(
        "rounded-md",
        animate ? "animate-pulse bg-neutral-200/80" : "bg-neutral-200/55",
        className
      )}
      {...rest}
    />
  );
}

type SkeletonHeaderProps = HTMLAttributes<HTMLDivElement> & {
  animate?: boolean;
};

export function SkeletonHeader({
  className,
  animate = true,
  ...rest
}: SkeletonHeaderProps) {
  return (
    <div className={cx("space-y-2", className)} {...rest}>
      <SkeletonBase className="h-7 w-48 max-w-[70%]" animate={animate} />
      <SkeletonBase className="h-4 w-72 max-w-[85%]" animate={animate} />
    </div>
  );
}

type SkeletonCardProps = HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  animate?: boolean;
};

export function SkeletonCard({
  className,
  lines = 3,
  animate = true,
  ...rest
}: SkeletonCardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-neutral-200 bg-white shadow-sm",
        className
      )}
      {...rest}
    >
      <div className="space-y-3 p-6">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            className={cx("h-3.5", i === lines - 1 ? "max-w-[85%]" : "w-full")}
            animate={animate}
          />
        ))}
      </div>
    </div>
  );
}

type SkeletonTableRowProps = {
  cols?: number;
  animate?: boolean;
};

export function SkeletonTableRow({ cols = 4, animate = true }: SkeletonTableRowProps) {
  return (
    <tr className="border-b border-neutral-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4 align-middle">
          <SkeletonBase className="h-4 w-full max-w-[120px]" animate={animate} />
        </td>
      ))}
    </tr>
  );
}

type SkeletonListProps = {
  rows?: number;
  rowHeight?: number;
  gap?: number;
  animate?: boolean;
};

export function SkeletonList({
  rows = 6,
  rowHeight = 72,
  gap = 12,
  animate = true,
}: SkeletonListProps) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-2 shadow-sm"
          style={{ minHeight: rowHeight }}
        >
          <SkeletonBase className="h-8 w-8 shrink-0 rounded-full" animate={animate} />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBase className="h-3.5 w-2/5 max-w-[200px]" animate={animate} />
            <SkeletonBase className="h-3 w-3/4 max-w-[320px]" animate={animate} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SkeletonBase className="h-8 w-[4.5rem] rounded-full" animate={animate} />
            <SkeletonBase className="h-8 w-8 rounded-md" animate={animate} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonSessionGrid({ animate = true }: { animate?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <SkeletonBase className="mb-3 h-4 max-w-[60%]" animate={animate} />
          <div className="mb-3 flex flex-wrap gap-2">
            <SkeletonBase className="h-6 w-16 rounded-full" animate={animate} />
            <SkeletonBase className="h-6 w-20 rounded-full" animate={animate} />
          </div>
          <SkeletonBase className="h-24 w-full rounded-lg" animate={animate} />
          <div className="mt-3 flex justify-end">
            <SkeletonBase className="h-7 w-7 rounded-md" animate={animate} />
          </div>
        </div>
      ))}
    </div>
  );
}
