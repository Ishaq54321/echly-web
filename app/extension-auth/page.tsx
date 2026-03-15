"use client";

import { useEffect } from "react";

const LOGIN_REDIRECT = "/login?extension=true";

/**
 * Auth broker page: runs in dashboard origin so cookies are sent.
 * Fetches extension token, posts to extension via postMessage, then closes.
 * On 401 redirects to login.
 */
export default function ExtensionAuthPage() {
  useEffect(() => {
    let closed = false;

    async function run() {
      try {
        const res = await fetch("/api/auth/extensionToken", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = LOGIN_REDIRECT;
          return;
        }

        if (!res.ok) {
          window.location.href = LOGIN_REDIRECT;
          return;
        }

        const data = (await res.json()) as { token?: string; uid?: string };
        if (!data?.token || !data?.uid) {
          window.location.href = LOGIN_REDIRECT;
          return;
        }

        if (closed) return;
        window.postMessage(
          {
            type: "ECHLY_EXTENSION_TOKEN",
            token: data.token,
            uid: data.uid,
          },
          "*"
        );
        window.close();
      } catch {
        if (!closed) window.location.href = LOGIN_REDIRECT;
      }
    }

    run();
    return () => {
      closed = true;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        color: "#374151",
      }}
    >
      <p>Signing in to extension…</p>
    </div>
  );
}
