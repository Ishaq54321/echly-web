/**
 * Returns true if the host document has explicitly disallowed microphone via
 * the Permissions-Policy / Feature-Policy HTTP header (e.g. a site that sends
 * `Permissions-Policy: microphone=()`, as raycast.com does).
 *
 * This is fundamentally different from user denial: no permission change —
 * not in the browser prompt, not in chrome://settings — can override it. The
 * site itself has revoked the capability for every embedded context, so the
 * only honest UX is to point the user at Write mode.
 *
 * Shared by the two independent mic-permission paths: the ModeSelectionView
 * pre-flight (useMicPermission) and the in-pill recording failure path
 * (useCaptureWidget), so both classify a site block identically.
 */
export function isMicBlockedBySitePolicy(): boolean {
  if (typeof document === "undefined") return false;

  // Newer spec name.
  const newerPolicy = (
    document as unknown as {
      permissionsPolicy?: { allowsFeature?: (f: string) => boolean };
    }
  ).permissionsPolicy;
  if (typeof newerPolicy?.allowsFeature === "function") {
    return !newerPolicy.allowsFeature("microphone");
  }

  // Older spec name (still present in Chrome as of 2026).
  const olderPolicy = (
    document as unknown as {
      featurePolicy?: { allowsFeature?: (f: string) => boolean };
    }
  ).featurePolicy;
  if (typeof olderPolicy?.allowsFeature === "function") {
    return !olderPolicy.allowsFeature("microphone");
  }

  // Neither API exposed — can't determine here. Callers fall back to the
  // post-rejection getUserMedia error-message check.
  return false;
}

/**
 * True when a getUserMedia rejection message indicates a Permissions-Policy /
 * Feature-Policy block (the fallback when neither policy API is exposed for
 * the pre-flight check above).
 */
export function isPolicyBlockError(err: unknown): boolean {
  const msg = (err as Error)?.message?.toLowerCase() ?? "";
  return (
    msg.includes("permissions policy") || msg.includes("feature policy")
  );
}
