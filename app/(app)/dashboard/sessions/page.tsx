"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Folder, Loader2 } from "lucide-react";
import {
  useWorkspaceOverview,
  type SessionWithCounts,
} from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import SessionsTableSkeleton from "@/components/skeleton/SessionsTableSkeleton";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

function formatLastActivity(updatedAt: unknown): string {
  if (updatedAt == null) return "—";
  const sec =
    typeof (updatedAt as { seconds?: number }).seconds === "number"
      ? (updatedAt as { seconds: number }).seconds
      : null;
  if (sec == null) return "—";
  const d = new Date(sec * 1000);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SESSION_LIMIT = 50;

interface FolderData {
  id: string;
  name: string;
  sessionIds: string[];
}

const FOLDERS_CACHE_KEY = "echly_folders";

function FolderItem({
  folder,
}: {
  folder: FolderData;
}) {
  const router = useRouter();
  const count = folder.sessionIds.length;

  return (
    <button
      type="button"
      onClick={() => router.push(`/folders/${folder.id}`)}
      className="w-full text-left bg-white rounded-xl p-5 border border-[rgba(0,0,0,0.06)] hover:border-[#155DFC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-150 flex items-center gap-3"
      style={{ borderWidth: "1px" }}
    >
      <Folder className="w-5 h-5 text-[#155DFC] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-neutral-900 truncate">
          {folder.name}
        </p>
        <p className="text-[13px] text-secondary">
          {count} {count === 1 ? "session" : "sessions"}
        </p>
      </div>
    </button>
  );
}

export default function SessionsPage() {
  const router = useRouter();
  const { user, sessions: sessionsWithCounts, loading: sessionsLoading } =
    useWorkspaceOverview("all");
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openingSessionId, setOpeningSessionId] = useState<string | null>(null);

  const tableSessions = useMemo(() => {
    const sorted = [...sessionsWithCounts].sort((a, b) => {
      const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
      const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
      return (tb?.seconds ?? 0) - (ta?.seconds ?? 0);
    });
    return sorted.slice(0, SESSION_LIMIT);
  }, [sessionsWithCounts]);

  const loadFolders = useCallback(async (uid: string) => {
    setFoldersLoading(true);
    try {
      const cached = sessionStorage.getItem(FOLDERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setFolders(parsed as FolderData[]);
      }
    } catch {
      // Ignore cache read/parse errors.
    }
    try {
      const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
      const q = query(
        collection(db, "folders"),
        where("workspaceId", "==", workspaceId)
      );
      const snapshot = await getDocs(q);
      const list: FolderData[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: (data.name as string) ?? "Untitled Folder",
          sessionIds: (data.sessionIds as string[]) ?? [],
        };
      });
      setFolders(list);
      try {
        sessionStorage.setItem(FOLDERS_CACHE_KEY, JSON.stringify(list));
      } catch {
        // Ignore cache write errors.
      }
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    void loadFolders(user.uid);
  }, [user?.uid, loadFolders]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tableSessions;
    return tableSessions.filter(({ session }) =>
      session.title.toLowerCase().includes(q)
    );
  }, [tableSessions, search]);

  const sessionIdToFolder = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const folder of folders) {
      for (const sid of folder.sessionIds) {
        map.set(sid, { id: folder.id, name: folder.name });
      }
    }
    return map;
  }, [folders]);

  function getCreatedByLabel(session: SessionWithCounts["session"]): string {
    const cb = session.createdBy;
    if (!cb) return "User";
    const name = [cb.firstName, cb.lastName].filter(Boolean).join(" ").trim();
    return name || "User";
  }

  return (
    <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20">
      <div className="mx-auto w-full max-w-[1200px] px-8 pt-8 pb-10">
        <div className="mb-6">
          <div className="text-sm text-secondary font-medium">
            Table View
          </div>
          <h1 className="text-4xl font-semibold text-neutral-900">
            Sessions
          </h1>
        </div>

        <div className="relative w-full max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-meta pointer-events-none" />
          <input
            type="search"
            placeholder="Search sessions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-full border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
            aria-label="Search sessions"
          />
        </div>

        {foldersLoading ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Folders
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : folders.length > 0 ? (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Folders
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}
            </div>
          </div>
        ) : null}

        <h2 className="text-sm font-semibold text-neutral-700 mb-3">
          Sessions
        </h2>

        {sessionsLoading ? (
          <SessionsTableSkeleton />
        ) : filteredSessions.length > 0 ? (
          <div className="max-w-[1200px] w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[11px] tracking-wide text-meta font-medium px-3 py-2">
                    Session
                  </th>
                  <th className="text-[11px] tracking-wide text-meta font-medium px-3 py-2 w-[110px]">
                    Status
                  </th>
                  <th className="text-[11px] tracking-wide text-meta font-medium px-3 py-2 w-[80px] text-right">
                    Open
                  </th>
                  <th className="text-[11px] tracking-wide text-meta font-medium px-3 py-2 w-[90px] text-right">
                    Resolved
                  </th>
                  <th className="text-[11px] tracking-wide text-meta font-medium px-3 py-2 w-[120px] text-right">
                    Progress
                  </th>
                  <th className="text-right w-[140px] text-[11px] tracking-wide text-meta font-medium px-3 py-2">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(({ session, counts }) => {
                  const open = counts.open;
                  const resolved = counts.resolved;
                  const total = counts.total;
                  const progress = total > 0 ? Math.round((resolved / total) * 100) : 0;
                  const status = session.archived ? "Archived" : "Active";
                  const folder = sessionIdToFolder.get(session.id);
                  const createdBy = getCreatedByLabel(session);
                  return (
                    <tr
                      key={session.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setOpeningSessionId(session.id);
                        router.push(`/dashboard/${session.id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpeningSessionId(session.id);
                          router.push(`/dashboard/${session.id}`);
                        }
                      }}
                      className={`border-b border-[rgba(0,0,0,0.06)] hover:bg-[#155DFC0D] cursor-pointer transition-colors ${
                        openingSessionId === session.id ? "ring-2 ring-[#155DFC]/30 bg-[#155DFC0D]" : ""
                      }`}
                    >
                      <td className="px-3 py-[12px]">
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 inline-flex items-center gap-2">
                            {session.title || "Untitled Session"}
                            {openingSessionId === session.id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            )}
                          </p>
                          {folder && (
                            <p className="text-xs text-secondary mt-1">
                              Folder: {folder.name}
                            </p>
                          )}
                          <p className="text-xs text-secondary mt-1">
                            Created by {createdBy} • {total} feedback
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-[12px]">
                        <span
                          className={
                            status === "Active"
                              ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgba(16,185,129,0.08)] text-[#059669]"
                              : "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgba(107,114,128,0.08)] text-[#4b5563]"
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-[12px] text-right tabular-nums text-[13px] text-secondary">
                        {open}
                      </td>
                      <td className="px-3 py-[12px] text-right tabular-nums text-[13px] text-secondary">
                        {resolved}
                      </td>
                      <td className="px-3 py-[12px]">
                        <div className="w-[80px] h-1.5 bg-neutral-200 rounded-full">
                          <div
                            className="h-full bg-[#155DFC] rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-[12px] text-right text-secondary text-[13px]">
                        {formatLastActivity(session.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {!sessionsLoading && filteredSessions.length === 0 && (
          <p className="text-[14px] text-secondary py-8">
            {search.trim()
              ? "No sessions match your search."
              : "No sessions yet. Create one from the Dashboard to get started."}
          </p>
        )}
      </div>
    </div>
  );
}
