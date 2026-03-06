"use client";

import React from "react";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";

export interface TicketMetadataProps {
  createdAt?: string | { seconds: number } | null;
  updatedAt?: string | { seconds: number } | null;
  assignee?: string | null;
}

export function TicketMetadata({
  createdAt,
  updatedAt,
  assignee,
}: TicketMetadataProps) {
  return (
    <section className="mb-6">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] mb-2">
        Details
      </h3>
      <dl className="space-y-1.5 text-[12px]">
        <div>
          <dt className="text-[hsl(var(--text-tertiary))]">Created</dt>
          <dd className="text-[hsl(var(--text-primary-strong))] font-medium">
            {formatCommentDate(createdAt, { fallback: "—", includeTime: false, includeYear: true })}
          </dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--text-tertiary))]">Updated</dt>
          <dd className="text-[hsl(var(--text-primary-strong))] font-medium">
            {formatCommentDate(updatedAt, { fallback: "—", includeTime: false, includeYear: true })}
          </dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--text-tertiary))]">Assignee</dt>
          <dd className="text-[hsl(var(--text-primary-strong))] font-medium">
            {assignee ?? "Unassigned"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
