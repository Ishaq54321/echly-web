"use client";

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

export function triggerAddMoreTickets(sessionId: string): void {
  if (typeof window === "undefined") return;

  let acknowledged = false;

  const handlePong = (event: MessageEvent) => {
    if (event.source !== window) return;
    if (event.data?.type !== "ECHLY_EXTENSION_PONG") return;
    if (acknowledged) return;
    acknowledged = true;
    window.clearTimeout(timeoutId);
    window.removeEventListener("message", handlePong);
    window.postMessage({ type: "ECHLY_RESUME_SESSION", sessionId }, "*");
  };

  window.addEventListener("message", handlePong);
  window.postMessage({ type: "ECHLY_EXTENSION_PING" }, "*");

  const timeoutId = window.setTimeout(() => {
    if (acknowledged) return;
    window.removeEventListener("message", handlePong);
    window.open(CHROME_EXTENSION_URL, "_blank", "noopener,noreferrer");
  }, 500);
}
