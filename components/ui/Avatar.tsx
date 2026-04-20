"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  borderRadius?: string;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = 32,
  borderRadius = "50%",
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (src?.trim()) setLoading(true);
  }, [src]);

  const showImage = Boolean(src?.trim()) && !imgError;
  const initial = name?.trim().charAt(0).toUpperCase() ?? null;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {showImage ? (
        <img
          src={src!}
          alt=""
          onLoad={() => setLoading(false)}
          onError={() => { setImgError(true); setLoading(false); }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loading ? 0.6 : 1,
            animation: loading ? "pulse 1.5s ease-in-out infinite" : undefined,
            transition: "opacity 200ms",
          }}
        />
      ) : initial ? (
        <span
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            color: "#374151",
            fontSize: Math.max(size * 0.38, 10),
            fontWeight: 600,
            borderRadius,
            userSelect: "none",
          }}
          aria-hidden
        >
          {initial}
        </span>
      ) : (
        <span
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            borderRadius,
          }}
        >
          <User
            style={{ width: size * 0.55, height: size * 0.55, color: "#9ca3af" }}
            aria-hidden
          />
        </span>
      )}
    </span>
  );
}
