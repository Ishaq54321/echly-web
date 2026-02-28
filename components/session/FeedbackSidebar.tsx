"use client";

import { motion } from "framer-motion";

interface Props {
  feedback: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  selectedIndex?: number;
  total?: number;
}

export default function FeedbackSidebar({
  feedback,
  selectedId,
  onSelect,
  selectedIndex,
  total,
}: Props) {
  const badgeColors: any = {
    Bug: "bg-red-100 text-red-700",
    "UI Issue": "bg-orange-100 text-orange-700",
    "UX Issue": "bg-purple-100 text-purple-700",
    "Copy Issue": "bg-blue-100 text-blue-700",
    Performance: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="w-full max-w-[280px] bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Feedback
        </div>

        {selectedIndex !== undefined && total !== undefined && (
          <div className="mt-2 text-xs text-slate-400">
            {selectedIndex + 1} of {total}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {feedback.map((item) => {
          const isActive = item.id === selectedId;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`relative w-full text-left px-6 py-4 transition-colors duration-150
                ${isActive ? "bg-white" : "hover:bg-slate-50"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 h-full w-[3px] bg-rose-500 rounded-r-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                  }}
                />
              )}

              <div
                className={`text-sm truncate ${
                  isActive
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-700"
                }`}
              >
                {item.title}
              </div>

              <div className="mt-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    badgeColors[item.type] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.type}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}