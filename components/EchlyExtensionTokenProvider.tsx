"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

const ECHLY_REQUEST_TOKEN = "ECHLY_REQUEST_TOKEN";
const ECHLY_TOKEN_RESPONSE = "ECHLY_TOKEN_RESPONSE";

/**
 * Listens for extension token requests (postMessage) and responds with the current
 * Firebase ID token. Allows the Echly Chrome extension to be stateless: it gets
 * a fresh token from the dashboard page instead of storing refresh tokens.
 */
export function EchlyExtensionTokenProvider() {
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type !== ECHLY_REQUEST_TOKEN) return;

      const user = auth.currentUser;
      if (!user) {
        window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token: null }, "*");
        return;
      }

      try {
        const token = await user.getIdToken();
        window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token }, "*");
      } catch {
        window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token: null }, "*");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* Cookie-bridge: extension content script requests token; we fetch in page context so __session cookie is sent. */
  useEffect(() => {
    async function handler(event: MessageEvent) {
      if (event.data?.type !== "ECHLY_EXTENSION_TOKEN_REQUEST") return;

      const id = event.data.id;

      try {
        const res = await fetch("/api/auth/extensionToken", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("UNAUTH");

        const data = await res.json();

        window.postMessage(
          {
            type: "ECHLY_EXTENSION_TOKEN_RESPONSE",
            id,
            token: data.token,
            uid: data.uid,
          },
          "*"
        );
      } catch {
        window.postMessage(
          {
            type: "ECHLY_EXTENSION_TOKEN_RESPONSE",
            id,
            token: null,
          },
          "*"
        );
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return null;
}
