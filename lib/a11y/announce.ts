export function announceToScreenReader(message: string): void {
  if (typeof document === "undefined" || !message) return;
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  window.setTimeout(() => {
    announcement.remove();
  }, 1000);
}
