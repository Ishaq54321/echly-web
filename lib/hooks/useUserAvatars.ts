"use client";

import { useEffect, useState } from "react";
import {
  subscribeToUserAvatar,
  getCachedUserAvatar,
} from "@/lib/realtime/userAvatarStore";

/**
 * Subscribe to live avatars for a list of uids.
 *
 * Returns a Map of uid → avatarUrl (null when the user has no avatar set or
 * the uid is unknown). The map updates in real-time whenever any subscribed
 * user uploads a new photo or removes theirs.
 *
 * Falsy uids are filtered out; passing an empty list is a no-op. The effect
 * only re-subscribes when the *set* of uids changes (not on every render),
 * so passing a freshly-mapped array each render is fine.
 */
export function useUserAvatars(
  uids: Array<string | null | undefined>
): Map<string, string | null> {
  const uniqueUids = Array.from(
    new Set(uids.filter((u): u is string => Boolean(u && u.trim())))
  ).sort();
  const key = uniqueUids.join("|");

  const [avatars, setAvatars] = useState<Map<string, string | null>>(() => {
    const initial = new Map<string, string | null>();
    for (const uid of uniqueUids) {
      initial.set(uid, getCachedUserAvatar(uid)?.avatarUrl ?? null);
    }
    return initial;
  });

  useEffect(() => {
    if (uniqueUids.length === 0) {
      setAvatars((prev) => (prev.size === 0 ? prev : new Map()));
      return;
    }

    const unsubscribers = uniqueUids.map((uid) =>
      subscribeToUserAvatar(uid, (record) => {
        setAvatars((prev) => {
          if (prev.get(record.uid) === record.avatarUrl && prev.has(record.uid)) {
            return prev;
          }
          const next = new Map(prev);
          next.set(record.uid, record.avatarUrl);
          return next;
        });
      })
    );

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
    // `key` is the stable identity of the uid set; uniqueUids is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return avatars;
}

/**
 * Singular convenience wrapper. Returns the live avatar URL for one uid, or
 * null when unset/unknown. Pass null/undefined to no-op.
 */
export function useUserAvatar(uid: string | null | undefined): string | null {
  const map = useUserAvatars([uid]);
  if (!uid) return null;
  return map.get(uid) ?? null;
}
