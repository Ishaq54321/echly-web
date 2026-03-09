/**
 * Shorten long device names for display.
 * Example: "Microphone (2-PD200X Podcast Microphone)" → "PD200X Podcast Mic"
 */
export function shortDeviceName(deviceLabel: string): string {
  if (!deviceLabel?.trim()) return "Default microphone";

  let s = deviceLabel.trim();

  // Extract content from parentheses, e.g. "Microphone (2-PD200X Podcast Microphone)" → "2-PD200X Podcast Microphone"
  const parenMatch = s.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inner = parenMatch[1].trim();
    // Remove leading "N-" prefix (device index)
    const withoutIndex = inner.replace(/^\d+-/, "").trim();
    if (withoutIndex) s = withoutIndex;
  }

  // Replace "Microphone" with "Mic" at end
  s = s.replace(/\s+Microphone$/i, " Mic");

  // Cap length
  if (s.length > 28) s = s.slice(0, 25).trim() + "…";

  return s || "Default microphone";
}
