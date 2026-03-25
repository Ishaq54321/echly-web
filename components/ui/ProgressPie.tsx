"use client";

import React from "react";

interface ProgressPieProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
}

export default function ProgressPie({
  value,
  size = 36,
  strokeWidth = 3,
}: ProgressPieProps) {
  const radius = size / 2;
  const normalizedValue = Math.max(0, Math.min(100, value));
  const brandBlue = "#3b82f6"; // blue-500

  // Convert percentage to angle
  const angle = (normalizedValue / 100) * 360;

  // Convert polar to cartesian
  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  // Describe arc path
  const describeArc = (
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      x,
      y,
      "L",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  return (
    <div style={{ width: size, height: size }}>
      <svg width={size} height={size}>

        {/* OUTER STROKE */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          stroke={brandBlue}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />

        {/* INNER PIE FILL */}
        {normalizedValue > 0 && (
          <path
            d={describeArc(radius, radius, radius - strokeWidth, 0, angle)}
            fill={brandBlue}
          />
        )}

      </svg>
    </div>
  );
}
