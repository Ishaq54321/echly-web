"use client";

import { MessageSquare } from "lucide-react";

interface FeedbackHeaderProps {
  title: string;
  index: number;
  total: number;
  isActivityOpen: boolean;
  onToggleActivity: () => void;
}

export function FeedbackHeader({
  title,
  index,
  total,
  isActivityOpen,
  onToggleActivity,
}: FeedbackHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {index} of {total}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleActivity}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActivityOpen
            ? "bg-slate-200 text-slate-900"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        aria-pressed={isActivityOpen}
      >
        <MessageSquare size={16} />
        Activity
      </button>
    </div>
  );
}
