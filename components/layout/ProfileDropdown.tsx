"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ProfileCommandPanel } from "@/components/layout/ProfileCommandPanel";

export function ProfileDropdown() {
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={avatarRef}
        type="button"
        aria-label="Profile"
        aria-expanded={open}
        className="shrink-0 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar
          image={(user as { image?: string | null } | null)?.image}
          photoURL={user?.photoURL}
          name={
            user?.displayName?.trim() ||
            user?.email?.split("@")[0] ||
            undefined
          }
          className="h-9 w-9 cursor-pointer"
        />
      </button>
      <ProfileCommandPanel
        open={open}
        onClose={() => setOpen(false)}
        user={user}
        anchorRef={avatarRef}
      />
    </>
  );
}
