"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createSession, getUserSessions } from "@/lib/sessions";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const userSessions = await getUserSessions(currentUser.uid);
      setSessions(userSessions);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCreateSession = async () => {
    if (!user) return;

    const sessionId = await createSession(user.uid);
    router.push(`/dashboard/${sessionId}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Sessions</h1>

      <button
        onClick={handleCreateSession}
        className="bg-black text-white px-4 py-2 rounded mb-6"
      >
        + New Session
      </button>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => router.push(`/dashboard/${session.id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100"
          >
            <h2 className="font-semibold">{session.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}