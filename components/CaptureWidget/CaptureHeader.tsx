"use client";

import { X } from "lucide-react";

type CaptureHeaderProps = {
  onClose: () => void;
  /** Dynamic summary e.g. "12 insights · 2 high priority" */
  summary?: string | null;
};

export default function CaptureHeader({
  onClose,
  summary = null,
}: CaptureHeaderProps) {
  return (
    <div className="echly-sidebar-header">
      <div className="echly-sidebar-header-left">
        <span className="echly-sidebar-title">Echly</span>
        {summary && (
          <span className="echly-sidebar-summary">{summary}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="echly-sidebar-close"
        aria-label="Close"
      >
        <X size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
