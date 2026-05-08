import type { Timestamp } from "firebase/firestore";

export function parseDeviceInfo(
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

export function formatLocalDateTime(
  createdAt: string | number | Timestamp | null | undefined
): string | null {
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
