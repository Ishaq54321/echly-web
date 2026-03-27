"use client";

import { useEffect, useState } from "react";

type ShareCounts = {
  total: number;
  open: number;
  resolved: number;
};

export function useShareCounts(
  sessionId: string,
  token: string
): { counts: ShareCounts | null; loading: boolean } {
  const [counts, setCounts] = useState<ShareCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setCounts(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const params = new URLSearchParams({ sessionId });
    if (token) params.set("token", token);

    fetch(`/api/feedback/counts?${params.toString()}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("counts_failed"))))
      .then((data) => {
        setCounts(data as ShareCounts);
        setLoading(false);
      })
      .catch(() => {
        setCounts(null);
        setLoading(false);
      });
  }, [sessionId, token]);

  return {
    counts,
    loading,
  };
}
