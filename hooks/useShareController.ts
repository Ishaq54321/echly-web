"use client";

import { useState, useCallback } from "react";
import { authFetch } from "@/lib/authFetch";

export type ShareGeneralAccessUi = "restricted" | "public";

function apiGeneralAccessToUi(
  value: string | undefined
): ShareGeneralAccessUi {
  if (value === "link_view") return "public";
  return "restricted";
}

function uiGeneralAccessToApi(value: ShareGeneralAccessUi): "restricted" | "link_view" {
  return value === "public" ? "link_view" : "restricted";
}

export function useShareController(sessionId: string) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [generalAccess, setGeneralAccess] =
    useState<ShareGeneralAccessUi>("restricted");
  const [canManageGeneralAccess, setCanManageGeneralAccess] = useState(false);

  const load = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    const res = await authFetch(`/api/share/${encodeURIComponent(sid)}`);
    if (!res) {
      throw new Error("Not authenticated");
    }
    const json = (await res.json()) as {
      success?: boolean;
      data?: { link?: string; generalAccess?: string };
      error?: { message?: string };
      access?: { capabilities?: { canDeleteTicket?: boolean } };
    };

    if (!json.success) {
      throw new Error(json.error?.message ?? "Failed to load share settings");
    }

    const data = json.data;
    if (typeof data?.link === "string") {
      setLink(data.link);
    }
    setGeneralAccess(apiGeneralAccessToUi(data?.generalAccess));
    setCanManageGeneralAccess(
      json.access?.capabilities?.canDeleteTicket === true
    );
  }, [sessionId]);

  const updateAccess = useCallback(
    async (access: ShareGeneralAccessUi) => {
      const res = await authFetch(`/api/share/${encodeURIComponent(sessionId.trim())}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generalAccess: uiGeneralAccessToApi(access) }),
      });
      if (!res) {
        throw new Error("Not authenticated");
      }
      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!json.success) {
        throw new Error(json.error?.message ?? "Failed to update access");
      }
      setGeneralAccess(access);
    },
    [sessionId]
  );

  const copy = useCallback(() => {
    if (!link) return;
    void navigator.clipboard.writeText(link);
  }, [link]);

  return {
    open,
    setOpen,
    link,
    generalAccess,
    canManageGeneralAccess,
    load,
    updateAccess,
    copy,
  };
}
