"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Info, Loader2, Pencil, ZoomIn } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoScreenshotIllu } from "@/components/empty/canvasIllustrations";
import { Tooltip } from "@/components/ui/Tooltip";

interface ScreenshotBlockProps {
  screenshotId: string | null | undefined;
  /** Resolved download URL from parent `useScreenshotUrl` (single resolution per ticket). */
  screenshotUrl: string | null;
  screenshotUrlLoading: boolean;
  screenshotUrlError: string | null;
  onExpand: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  /** Omit outer frame when nested inside a parent attachment card. */
  embeddedInCard?: boolean;
  /** AI-detected page/section, e.g. "Pricing Page → Hero Section". Hidden when null/empty. */
  pageArea?: string | null;
  userAgent?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  devicePixelRatio?: number | null;
  createdAt?: string | number | Timestamp | null;
}

function parseDeviceInfo(
  ua: string | null | undefined,
  vw: number | null | undefined,
  vh: number | null | undefined,
  dpr: number | null | undefined
): string | null {
  if (!ua) return null;

  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (ua.includes("Edg")) {
    const match = ua.match(/Edg\/(\d+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  } else if (ua.includes("Firefox")) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/(\d+[\.\d]*)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  }

  if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (ua.includes("Windows NT 10")) {
    os = ua.includes("Windows NT 10.0") ? "Windows 10/11" : "Windows";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    const match = ua.match(/OS (\d+[._]\d+)/);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
  } else if (ua.includes("Android")) {
    const match = ua.match(/Android (\d+[\.\d]*)/);
    os = match ? `Android ${match[1]}` : "Android";
  }

  const viewport = vw && vh ? `${vw}×${vh}` : null;
  const ratio = dpr ? `@${dpr}x` : null;

  const parts = [browser, os, [viewport, ratio].filter(Boolean).join(" ")].filter(Boolean);
  return parts.join(" · ");
}

function formatLocalDateTime(createdAt: string | number | Timestamp | null | undefined): string | null {
  if (!createdAt) return null;
  try {
    let date: Date;
    if (typeof createdAt === "number") {
      date = new Date(createdAt);
    } else if (typeof createdAt === "string") {
      date = new Date(createdAt);
    } else if (typeof (createdAt as Timestamp).toDate === "function") {
      date = (createdAt as Timestamp).toDate();
    } else {
      return null;
    }
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return null;
  }
}

export function ScreenshotBlock({
  screenshotId,
  screenshotUrl: url,
  screenshotUrlLoading: loading,
  screenshotUrlError: error,
  onExpand,
  onEdit,
  canEdit,
  embeddedInCard = false,
  pageArea,
  userAgent,
  viewportWidth,
  viewportHeight,
  devicePixelRatio,
  createdAt,
}: ScreenshotBlockProps) {
  const trimmedPageArea = typeof pageArea === "string" ? pageArea.trim() : "";
  const deviceLine = parseDeviceInfo(userAgent, viewportWidth, viewportHeight, devicePixelRatio);
  const dateLine = formatLocalDateTime(createdAt);
  const tooltipContent = [trimmedPageArea, deviceLine, dateLine].filter(Boolean).join("\n");
  const [imageDecoded, setImageDecoded] = useState(false);

  useLayoutEffect(() => {
    setImageDecoded(false);
  }, [url]);
  useEffect(() => {
    if (!url) return;
    const timeout = window.setTimeout(() => {
      setImageDecoded(true);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [url]);

  const outerFrame = embeddedInCard
    ? "rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.005] group"
    : "rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-sm)] transition-transform duration-200 hover:scale-[1.005] group";
  const innerRadius = embeddedInCard ? "rounded-lg" : "rounded-[var(--radius-xl)]";

  return (
    <div className={outerFrame}>
      <div className={`relative overflow-hidden ${innerRadius} max-h-[317px] bg-[var(--layer-2-bg)]`} style={{ aspectRatio: "16/9" }}>
        {!screenshotId ? null : url ? (
        <img
          key={url} // Hard reset the image element on ticket switch
          src={url}
          alt="Screenshot"
          className={`w-full h-auto max-h-[317px] object-contain block transition-[filter,opacity] duration-300 ease-out ${
            imageDecoded ? "opacity-100 blur-0" : "opacity-[0.88] blur-md"
          }`}
          loading="eager"
          decoding="async"
          onLoad={() => {
            setImageDecoded(true);
          }}
          onError={() => setImageDecoded(true)}
        />
        ) : null}

        {(loading && !url) || (Boolean(screenshotId) && !url && !error) ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-[var(--layer-2-bg)]/80">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" strokeWidth={1.8} aria-hidden />
          </div>
        ) : null}
        {!loading && screenshotId && !url && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-[var(--layer-2-bg)] py-4">
            <CanvasEmptyState
              density="compact"
              illustration={<NoScreenshotIllu />}
              title="No screenshot"
              description={error ?? "This ticket doesn't have a screenshot attached."}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent pointer-events-none" />
        {url ? (
          <>
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="absolute top-3 right-[3.75rem] p-3 rounded-xl bg-white/95 text-[var(--text-primary-strong)] shadow-[var(--shadow-level-2)] hover:bg-white hover:shadow-[var(--shadow-level-3)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]"
                aria-label="Edit screenshot"
              >
                <Pencil className="h-[1.375rem] w-[1.375rem]" strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={onExpand}
              className="absolute top-3 right-3 p-3 rounded-xl bg-white/95 text-[var(--text-primary-strong)] shadow-[var(--shadow-level-2)] hover:bg-white hover:shadow-[var(--shadow-level-3)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]"
              aria-label="Expand screenshot"
            >
              <ZoomIn className="h-[1.375rem] w-[1.375rem]" strokeWidth={1.5} />
            </button>
            {tooltipContent ? (
              <div className="absolute top-3 left-3">
                <Tooltip content={tooltipContent} position="right">
                  <span
                    aria-label={trimmedPageArea ? `Page area: ${trimmedPageArea}` : "Device info"}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-black/55 text-white backdrop-blur-sm shadow-[var(--shadow-level-1)]"
                  >
                    <Info className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                  </span>
                </Tooltip>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
