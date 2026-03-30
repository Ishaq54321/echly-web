import { getAuth, signInWithCustomToken } from "firebase/auth";
import "@/lib/firebase";
import { getShareToken } from "@/lib/client/shareToken";

let initializedForSession: string | null = null;

export async function ensureShareAuth(sessionId: string) {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid) return;
  if (initializedForSession === sid) return;

  if (initializedForSession && initializedForSession !== sid) {
    const auth = getAuth();
    await auth.signOut();
    initializedForSession = null;
  }

  const shareTok = getShareToken()?.trim() ?? "";
  if (!shareTok) return;

  const res = await fetch("/api/auth/share-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-share-token": shareTok,
    },
    body: JSON.stringify({ sessionId: sid }),
  });

  if (!res.ok) return;

  const { token } = (await res.json()) as { token?: string };

  if (!token) return;

  const auth = getAuth();

  await signInWithCustomToken(auth, token);

  initializedForSession = sid;
}
