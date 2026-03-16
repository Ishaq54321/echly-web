/**
 * Popup: Loom-style toggle. Click icon → widget opens; click again → widget closes.
 * If tray is closed and user not authenticated, background redirects to login.
 */
import React from "react";
import { createRoot } from "react-dom/client";

function getTrayState(): Promise<{ trayOpen: boolean; visible: boolean } | undefined> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_TRAY_STATE" },
      (r: { trayOpen?: boolean; visible?: boolean } | undefined) => {
        if (chrome.runtime.lastError) {
          resolve(undefined);
          return;
        }
        resolve(
          r != null
            ? { trayOpen: !!r.trayOpen, visible: !!r.visible }
            : undefined
        );
      }
    );
  });
}

function closeWidget(): Promise<void> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "ECHLY_CLOSE_WIDGET" }, () => {
      resolve();
    });
  });
}

function openWidget(): Promise<{ ok: boolean; redirectToLogin?: boolean }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_OPEN_WIDGET" },
      (r: { ok?: boolean; redirectToLogin?: boolean } | undefined) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false });
          return;
        }
        resolve({ ok: !!r?.ok, redirectToLogin: !!r?.redirectToLogin });
      }
    );
  });
}

function PopupApp() {
  React.useEffect(() => {
    (async () => {
      const state = await getTrayState();

      if (state?.trayOpen) {
        await closeWidget();
        window.close();
        return;
      }

      await openWidget();
      window.close();
    })();
  }, []);

  return (
    <div className="echly-popup-loading">
      Loading…
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<PopupApp />);
}
