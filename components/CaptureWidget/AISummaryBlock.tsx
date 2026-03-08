"use client";

import React from "react";

export type AISummaryBlockProps = {
  /** Number of feedback items (issues) detected */
  count: number;
  /** Whether AI has suggested improvements ready (e.g. from last run) */
  hasSuggestions?: boolean;
};

export function AISummaryBlock({ count, hasSuggestions = false }: AISummaryBlockProps) {
  if (count === 0 && !hasSuggestions) return null;

  return (
    <div className="echly-ai-summary-block">
      <div style={{ marginBottom: 4 }}>
        <strong>{count}</strong> {count === 1 ? "issue" : "issues"} detected
      </div>
      {hasSuggestions && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Suggested improvements ready
        </div>
      )}
    </div>
  );
}
