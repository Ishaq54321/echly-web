"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Auth broker page for the Echly extension (Loom-style).
 * When loaded: if not authenticated → redirect to /login; if authenticated →
 * POST /api/extension/session, receive extension token, postMessage to extension, close tab.
 * The extension never sees or stores login credentials.
 */
export default function ExtensionAuthPage() {
  const router = useRouter();

  useEffect(() => {
    let closed = false;

    async function run() {
      const res = await fetch("/api/extension/session", {
        method: "POST",
        credentials: "include",
      });

      if (closed) return;

      if (res.status === 401) {
        const returnUrl = "/extension-auth";
        router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as {
        extensionToken?: string;
        user?: { uid: string; email?: string | null };
      };
      const token = data?.extensionToken;

      if (!token) {
        return;
      }

      window.postMessage(
        { type: "ECHLY_EXTENSION_TOKEN", token: data.extensionToken, user: data.user },
        "*"
      );
      closed = true;
      window.close();
    }

    void run();
    return () => {
      closed = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafc]">
      <p className="text-gray-500">Completing sign-in for Echly extension…</p>
    </div>
  );
}
