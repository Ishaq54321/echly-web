import { logger } from "@/lib/logger";

(function initSessionRelay() {
  if ((window as any).__ECHLY_RELAY_INITIALIZED__) return;
  (window as any).__ECHLY_RELAY_INITIALIZED__ = true;

  // This is the ONE window "message" listener that runs on every page at
  // document_start (the web app's extension-installed probe needs it everywhere).
  // It is therefore on the message hot path of postMessage-saturated pages, so it
  // MUST reject irrelevant messages on the cheapest possible comparison.
  //
  // Ordering (cheapest rejection first):
  //   1. event.source !== window  →  bail. This rejects ALL cross-frame messages
  //      (the bulk of an iframe-heavy page's traffic — LinkedIn's embeds/analytics)
  //      on the very first comparison, before any deserialization or type work.
  //      Safe even for the install PING: the web app posts the PING from its own
  //      top document (window.postMessage on its own window), so a legitimate probe
  //      always has event.source === window. A foreign-frame message is never a
  //      real probe, so dropping it here cannot break install-detection.
  //   2. Then read data/type and handle the PING (origin-agnostic: the probe answer
  //      is public, and same-window already guarantees it's this document's code).
  //   3. Privileged actions (open recorder, resume, workspace switch) additionally
  //      require same-origin so a sandboxed same-window context can't forge them.
  window.addEventListener("message", (event) => {
    // Cheapest rejection first — foreign frames never carry a message we act on.
    if (event.source !== window) return;

    const data = event.data;
    if (!data || typeof data !== "object") return;
    const type = (data as { type?: unknown }).type;
    if (typeof type !== "string") return;

    if (type === "ECHLY_EXTENSION_PING") {
      // Installation probe. Same-window is already guaranteed above; origin is
      // irrelevant for a public "are you installed?" answer.
      logger.debug("extension", "ping_received");
      window.postMessage({ type: "ECHLY_EXTENSION_PONG" }, "*");
      return;
    }

    // All remaining actions are privileged; require same-origin (same-window is
    // already established).
    if (event.origin !== "" && event.origin !== window.origin) return;

    if (type === "ECHLY_OPEN_RECORDER") {
      logger.debug("extension", "open_recorder_requested");
      chrome.runtime.sendMessage({ type: "OPEN_RECORDER" }, (response) => {
        logger.debug("extension", "open_recorder_dispatched", response);
      });

      window.postMessage({ type: "ECHLY_RECORDER_OPENED" }, "*");
      return;
    }

    if (
      type === "ECHLY_RESUME_SESSION" &&
      typeof (data as { sessionId?: unknown }).sessionId === "string" &&
      ((data as { sessionId: string }).sessionId).length > 0
    ) {
      const sessionId = (data as { sessionId: string }).sessionId;
      logger.debug("extension", "resume_session_requested", { sessionId });
      chrome.runtime.sendMessage(
        { type: "RESUME_SESSION", sessionId },
        (response) => {
          logger.debug("extension", "resume_session_dispatched", response);
        }
      );
      window.postMessage({ type: "ECHLY_SESSION_RESUMED" }, "*");
      return;
    }

    // Dashboard signals a workspace switch — propagate to the background
    // worker so it can invalidate its cached extension token and refetch
    // the active workspace from the server.
    if (type === "ANNOTE_WORKSPACE_SWITCH") {
      logger.debug("extension", "workspace_switch_signal", {
        workspaceId: (data as { workspaceId?: unknown }).workspaceId ?? null,
      });
      chrome.runtime.sendMessage(
        {
          type: "WORKSPACE_SWITCHED",
          workspaceId:
            typeof (data as { workspaceId?: unknown }).workspaceId === "string"
              ? (data as { workspaceId: string }).workspaceId
              : null,
          uid:
            typeof (data as { uid?: unknown }).uid === "string"
              ? (data as { uid: string }).uid
              : null,
        },
        () => {
          /* ignore response */
        }
      );
    }
  });
})();
