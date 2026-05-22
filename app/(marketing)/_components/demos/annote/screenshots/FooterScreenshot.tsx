"use client";

/**
 * Mock screenshot for the "footer Status link goes to wrong URL" ticket.
 * A website footer with three link columns; the "Status" link is framed with
 * the capture highlight.
 *
 * Marketing-only. Pure SVG, no assets. ~280×180.
 */

import React from "react";

export function FooterScreenshot() {
  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" role="img" aria-label="Website footer, Status link highlighted">
      <rect width="280" height="180" fill="#F6F7F9" />
      {/* Page body hint above the footer */}
      <rect x="0" y="0" width="280" height="58" fill="#FFFFFF" />
      <rect x="24" y="22" width="90" height="6" rx="3" fill="#DDE0E6" />
      <rect x="24" y="36" width="150" height="4" rx="2" fill="#E7E9EE" />
      {/* Footer band */}
      <rect x="0" y="58" width="280" height="122" fill="#1B1F2C" />
      {/* Logo */}
      <rect x="24" y="76" width="40" height="8" rx="4" fill="#FFFFFF" opacity="0.85" />
      {/* Link columns */}
      {[120, 200].map((x, c) => (
        <g key={x}>
          <rect x={x} y="76" width="30" height="5" rx="2.5" fill="#FFFFFF" opacity="0.5" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x} y={92 + i * 14} width="44" height="4" rx="2" fill="#FFFFFF" opacity="0.28" />
          ))}
        </g>
      ))}
      {/* The "Status" link (second column, middle row) */}
      <rect x="200" y="106" width="34" height="4" rx="2" fill="#9DA8FF" opacity="0.9" />

      {/* Capture highlight on the Status link */}
      <rect x="194" y="100" width="48" height="16" rx="5" fill="rgba(90,73,191,0.16)" stroke="#9DA8FF" strokeWidth="2" />
    </svg>
  );
}
