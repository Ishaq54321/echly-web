"use client";

import React, { type ReactNode } from "react";

export interface ModeTileProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  badge?: ReactNode;
  tooltip?: string;
}

export function ModeTile({
  icon,
  title,
  description,
  selected,
  onClick,
  badge,
  tooltip,
}: ModeTileProps) {
  return (
    <div
      className={`echly-mode-tile ${selected ? "selected" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
      title={tooltip}
      aria-pressed={selected}
    >
      <div className="tile-header">
        <div className="tile-icon">{icon}</div>
        <div className="tile-title">{title}</div>
        {badge && <div className="tile-badge">{badge}</div>}
      </div>
      {!selected && (
        <div className="tile-description">
          {description}
        </div>
      )}
    </div>
  );
}
