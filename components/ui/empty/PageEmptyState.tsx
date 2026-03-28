"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/empty/EmptyState";

export type PageEmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  /** Primary action as link */
  action?: { label: string; href: string };
  /** Primary action as button */
  actionButton?: { label: string; onClick: () => void };
  density?: "default" | "compact";
};

/**
 * Consistent empty states for app surfaces: copy + optional CTA.
 */
export function PageEmptyState({
  title,
  description,
  icon,
  action,
  actionButton,
  density = "compact",
}: PageEmptyStateProps) {
  const cta =
    action != null ? (
      <Link
        href={action.href}
        className="inline-flex items-center justify-center rounded-xl bg-[#155DFC] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0F4ED1] active:scale-[0.99]"
      >
        {action.label}
      </Link>
    ) : actionButton != null ? (
      <button
        type="button"
        onClick={actionButton.onClick}
        className="inline-flex items-center justify-center rounded-xl bg-[#155DFC] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0F4ED1] active:scale-[0.99]"
      >
        {actionButton.label}
      </button>
    ) : null;

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      emphasis="muted"
      density={density}
      animate
    >
      {cta}
    </EmptyState>
  );
}
