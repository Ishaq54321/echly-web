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
  const brandBlue = "#5A49BF";
  const isComplete = normalizedValue >= 100;

  const angle = (normalizedValue / 100) * 360;

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

  const wedgeRadius = Math.max(0, radius - strokeWidth - 2);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          stroke={brandBlue}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />
        {isComplete ? (
          <circle cx={radius} cy={radius} r={wedgeRadius} fill={brandBlue} />
        ) : (
          normalizedValue > 0 &&
          wedgeRadius > 0 && (
            <path
              d={describeArc(radius, radius, wedgeRadius, 0, angle)}
              fill={brandBlue}
            />
          )
        )}
      </svg>
      {isComplete && (
        <>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: wedgeRadius * 0.9,
              height: wedgeRadius * 0.9,
              position: "relative",
              animation: "progressPieCheckFade 200ms ease-out both",
            }}
          >
            <polyline points="20 7 10 17 5 12" />
          </svg>
          <style>{`@keyframes progressPieCheckFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </>
      )}
    </div>
  );
}
