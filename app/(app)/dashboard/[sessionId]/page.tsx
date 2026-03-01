"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addFeedback, deleteFeedback } from "@/lib/feedback";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import CaptureWidget from "@/components/CaptureWidget";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import FeedbackSidebar from "@/components/session/FeedbackSidebar";
import FeedbackDetail from "@/components/session/feedbackDetail/FeedbackDetail";
import { ActivityPanel } from "@/components/session/feedbackDetail/ActivityPanel";
import { Pencil, Check } from "lucide-react";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";

/** Ticket shape returned by GET/PATCH /api/tickets/:id (DB source of truth). */
type TicketFromApi = {
  id: string;
  title: string;
  description: string;
  actionItems?: string[] | null;
  [key: string]: unknown;
};

const sessionDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});
const sessionTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function formatSessionCreatedMeta(
  createdAt:
    | { toDate?: () => Date; seconds?: number }
    | string
    | null
    | undefined
): { dateStr: string; timeStr: string } {
  if (!createdAt) return { dateStr: "—", timeStr: "" };
  try {
    const date =
      typeof createdAt === "string"
        ? new Date(createdAt)
        : typeof (createdAt as { toDate?: () => Date }).toDate === "function"
          ? (createdAt as { toDate: () => Date }).toDate()
          : (createdAt as { seconds?: number }).seconds != null
            ? new Date((createdAt as { seconds: number }).seconds * 1000)
            : null;
    if (!date) return { dateStr: "—", timeStr: "" };
    return {
      dateStr: sessionDateFormatter.format(date),
      timeStr: sessionTimeFormatter.format(date),
    };
  } catch {
    return { dateStr: "—", timeStr: "" };
  }
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  /** Detail panel: always from DB (GET /api/tickets/:id). Do not use memory state. */
  const [detailTicket, setDetailTicket] = useState<TicketFromApi | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {
    feedback,
    setFeedback,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    refetchFirstPage: refetchFeedbackFirstPage,
    loadMoreRef: feedbackLoadMoreRef,
  } = useSessionFeedbackPaginated(sessionId as string | undefined);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [saveDescriptionSuccess, setSaveDescriptionSuccess] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
  const [isSavingSessionTitle, setIsSavingSessionTitle] = useState(false);
  const [saveSessionTitleSuccess, setSaveSessionTitleSuccess] = useState(false);

  /* ================= LOAD SESSION ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const sessionRef = doc(db, "sessions", sessionId as string);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        router.push("/dashboard");
        return;
      }

      const data = sessionSnap.data();

      if (data.userId !== currentUser.uid) {
        router.push("/dashboard");
        return;
      }

      setSession({ id: sessionSnap.id, ...data });
      setUserName(
        currentUser.displayName || currentUser.email || "You"
      );
      setUserPhotoURL(currentUser.photoURL ?? null);
      setSessionLoading(false);

      const viewerId = getViewerId(currentUser.uid);
      if (viewerId) {
        recordSessionViewIfNew(sessionSnap.id, viewerId).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  // Select first feedback when first page loads and none selected.
  useEffect(() => {
    if (feedback.length > 0 && selectedId === null) {
      setSelectedId(feedback[0].id);
    }
  }, [feedback, selectedId]);

  /* ================= FETCH DETAIL FROM DB (single source of truth) ================= */

  const fetchDetailTicket = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
      } else {
        setDetailTicket(null);
      }
    } catch {
      setDetailTicket(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetailTicket(null);
      return;
    }
    fetchDetailTicket(selectedId);
  }, [selectedId, fetchDetailTicket]);

  /* ================= SELECTED ITEM WITH INDEX (from DB) ================= */

  const selectedIndex = feedback.findIndex(
    (f) => f.id === selectedId
  );

  const selectedItem =
    detailTicket != null
      ? {
          ...detailTicket,
          index: selectedIndex !== -1 ? selectedIndex + 1 : 1,
          total: feedback.length || 1,
        }
      : null;

  const {
    comments,
    loadingComments,
    sendComment,
  } = useFeedbackDetailController({
    sessionId: sessionId as string,
    feedbackId: selectedId,
  });

  /* ================= SYNC DESCRIPTION (from DB-backed detail) ================= */

  useEffect(() => {
    if (detailTicket) {
      setDescriptionDraft(detailTicket.description);
      setIsEditingDescription(false);
    }
  }, [selectedId, detailTicket]);

  /* ================= SAVE TITLE (PATCH → DB, then update UI from response) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!selectedId || newTitle.trim() === "") return;
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, title: data.ticket!.title } : item
          )
        );
      }
    } catch {
      // revert detail to current state; could refetch
      if (detailTicket) setDetailTicket((t) => (t ? { ...t } : null));
    }
  };

  /* ================= SAVE DESCRIPTION (PATCH → DB, then update UI from response) ================= */

  const saveDescription = async (): Promise<void> => {
    if (!selectedId || descriptionDraft === detailTicket?.description) {
      setIsEditingDescription(false);
      return;
    }
    setIsSavingDescription(true);
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionDraft }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setDescriptionDraft(data.ticket.description);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, description: data.ticket!.description } : item
          )
        );
        setIsEditingDescription(false);
        setSaveDescriptionSuccess(true);
        setTimeout(() => setSaveDescriptionSuccess(false), 1200);
      }
    } catch {
      if (detailTicket) setDescriptionDraft(detailTicket.description);
    } finally {
      setIsSavingDescription(false);
    }
  };

  /* ================= SAVE ACTION ITEMS (PATCH → DB, then update UI from response) ================= */

  const saveActionItems = async (actionItems: string[]) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionItems }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, actionItems: data.ticket!.actionItems ?? null } : item
          )
        );
      }
    } catch {
      if (detailTicket) setDetailTicket((t) => (t ? { ...t } : null));
    }
  };

  const saveTags = async (suggestedTags: string[]) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedTags }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, suggestedTags: data.ticket!.suggestedTags ?? null } : item
          )
        );
      }
    } catch {
      if (detailTicket) setDetailTicket((t) => (t ? { ...t } : null));
    }
  };

  /* ================= AI SAVE (Elite Structuring) ================= */

  const normalizePriority = (s: string | undefined): "low" | "medium" | "high" | "critical" => {
    const v = (s ?? "medium").toLowerCase();
    if (v === "low" || v === "medium" || v === "high" || v === "critical") return v;
    return "medium";
  };

  const handleTranscript = async (
    transcript: string,
    screenshot: string | null
  ) => {
    const res = await fetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = (await res.json()) as { success?: boolean; tickets?: any[]; error?: string };
    console.log("STRUCTURING RESPONSE:", data);

    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    if (!data.success || tickets.length === 0) {
      console.warn("No structured tickets returned", data);
      return;
    }

    let screenshotUrl: string | null = null;
    let firstFeedbackId: string | null = null;
    if (tickets.length > 0 && screenshot) {
      firstFeedbackId = generateFeedbackId();
      screenshotUrl = await uploadScreenshot(screenshot, sessionId as string, firstFeedbackId);
    }

    const created: any[] = [];
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      const payload = {
        title: t.title,
        description: t.contextSummary ?? t.title,
        type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
        contextSummary: t.contextSummary ?? null,
        actionItems: t.actionItems ?? [],
        impact: t.impact ?? null,
        suggestedTags: t.suggestedTags,
        priority: normalizePriority(t.suggestedPriority),
        screenshotUrl: i === 0 ? screenshotUrl : null,
        timestamp: Date.now(),
      };

      const docRef = await addFeedback(
        sessionId as string,
        session.userId,
        payload,
        i === 0 && firstFeedbackId ? firstFeedbackId : undefined
      );
      const newItem = {
        id: docRef.id,
        ...payload,
        status: "open",
        clientTimestamp: Date.now(),
      };
      created.push(newItem);
    }

    setFeedback((prev) => [...created, ...prev]);
    setSelectedId(created[0].id);
    await refetchFeedbackFirstPage();

    return created[0];
  };

  const handleDeleteFeedback = async (id: string) => {
    await deleteFeedback(id, sessionId as string);
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    setShowDeleteModal(false);
    router.push(`/dashboard/${sessionId}`);
  };

  if (sessionLoading) return null;

  return (
    <>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="surface-sidebar w-[280px] shrink-0 min-h-0 flex flex-col border-r border-neutral-200">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <FeedbackSidebar
            feedback={feedback}
            selectedId={selectedId}
            onSelect={setSelectedId}
            selectedIndex={selectedIndex}
            total={feedback.length}
            loadingMore={feedbackLoadingMore}
            hasMore={hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            loadMoreRef={feedbackLoadMoreRef}
          />
          </div>
        </aside>

        <main className="surface-main flex-1 min-h-0 flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="max-w-4xl mx-auto w-full px-10 py-8 border-b border-neutral-200 shrink-0">
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0 flex-1">
                {isEditingSessionTitle ? (
                  <>
                    <input
                      value={sessionTitleDraft}
                      onChange={(e) => setSessionTitleDraft(e.target.value)}
                      onBlur={async () => {
                        const trimmed = sessionTitleDraft.trim();
                        if (!sessionId || !session) return;
                        if (trimmed === (session.title ?? "")) {
                          setIsEditingSessionTitle(false);
                          return;
                        }
                        setIsSavingSessionTitle(true);
                        try {
                          const safeTitle =
                            trimmed && trimmed.length > 0
                              ? trimmed
                              : session.title || "Untitled Session";
                          const res = await fetch(`/api/sessions/${sessionId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ title: safeTitle }),
                          });
                          const data = (await res.json()) as { success?: boolean; session?: Record<string, unknown> };
                          if (data.success && data.session) {
                            setSession((prev: any) => (prev ? { ...prev, ...data.session } : prev));
                            setSessionTitleDraft((data.session.title as string) ?? trimmed);
                            setIsSavingSessionTitle(false);
                            setSaveSessionTitleSuccess(true);
                            setTimeout(() => setSaveSessionTitleSuccess(false), 1200);
                            setIsEditingSessionTitle(false);
                          } else {
                            setIsSavingSessionTitle(false);
                            setIsEditingSessionTitle(false);
                          }
                        } catch {
                          setSessionTitleDraft(session.title ?? "Session");
                          setIsSavingSessionTitle(false);
                          setIsEditingSessionTitle(false);
                        }
                      }}
                      onFocus={(e) => e.currentTarget.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          setSessionTitleDraft(session?.title ?? "Session");
                          setIsEditingSessionTitle(false);
                          e.currentTarget.blur();
                        }
                      }}
                      autoFocus
                      className="text-[18px] font-medium tracking-[-0.01em] text-neutral-900 w-full bg-white border border-neutral-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 transition-all duration-150"
                      aria-label="Session title"
                    />
                    <p className="text-[13px] text-neutral-500 mt-1">
                      Enter to save
                    </p>
                    {isSavingSessionTitle && (
                      <p className="text-[13px] text-neutral-500 mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
                        Saving...
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className="group flex items-center gap-2 cursor-pointer min-h-[2rem]"
                      onClick={() => {
                        setSessionTitleDraft(session?.title ?? "Session");
                        setIsEditingSessionTitle(true);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSessionTitleDraft(session?.title ?? "Session");
                          setIsEditingSessionTitle(true);
                        }
                      }}
                      aria-label="Edit session title"
                    >
                      <h1 className="text-[18px] font-medium text-neutral-900">
                        {session?.title ?? "Session"}
                      </h1>
                      {saveSessionTitleSuccess ? (
                        <Check size={14} className="text-neutral-600 shrink-0" aria-hidden />
                      ) : (
                        <Pencil
                          size={14}
                          className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-[hsl(var(--text-secondary))] shrink-0"
                          aria-hidden
                        />
                      )}
                    </div>
                    {saveSessionTitleSuccess && (
                      <p className="text-[13px] text-neutral-600 mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
                        <Check size={12} className="shrink-0" aria-hidden />
                        Saved
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="text-[13px] text-neutral-500 flex-shrink-0 flex items-center">
                {(() => {
                  const { dateStr, timeStr } = formatSessionCreatedMeta(session?.createdAt);
                  return (
                    <>
                      <span>{dateStr}</span>
                      <span aria-hidden className="mx-1">·</span>
                      <span>{timeStr}</span>
                      <span aria-hidden className="mx-1">·</span>
                      <span>{userName}</span>
                      {userPhotoURL && (
                        <img
                          src={userPhotoURL}
                          alt=""
                          className="w-6 h-6 rounded-full border border-neutral-200 ml-2 flex-shrink-0"
                          width={24}
                          height={24}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full px-10 py-8">
              {detailLoading && selectedId ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[13px] text-neutral-500">Loading…</p>
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center mt-24">
                  <div className="text-[16px] font-medium text-neutral-800">
                    No feedback yet
                  </div>
                  <div className="mt-2 text-[14px] text-neutral-500">
                    Capture feedback to start organizing insights.
                  </div>
                </div>
              ) : (
                <FeedbackDetail
                  sessionId={sessionId as string}
                  selectedItem={selectedItem}
                  isEditingDescription={isEditingDescription}
                  descriptionDraft={descriptionDraft}
                  setIsEditingDescription={setIsEditingDescription}
                  setDescriptionDraft={setDescriptionDraft}
                  saveDescription={saveDescription}
                  isSavingDescription={isSavingDescription}
                  saveDescriptionSuccess={saveDescriptionSuccess}
                  onSaveTitle={saveTitle}
                  onRequestDelete={() => setShowDeleteModal(true)}
                  onSaveActionItems={saveActionItems}
                  onSaveTags={saveTags}
                  setIsImageExpanded={setIsImageExpanded}
                  isCommentsOpen={isCommentsOpen}
                  onToggleActivity={() => setIsCommentsOpen((prev) => !prev)}
                />
              )}
            </div>
          </div>
        </main>

        {isCommentsOpen && (
            <aside className="w-[320px] shrink-0 min-h-0 flex flex-col hidden lg:block border-l border-[hsl(var(--border)/0.8)] bg-[hsl(var(--surface-1))]">
              <div className="flex-1 min-h-0 overflow-y-auto px-6">
                <ActivityPanel
                comments={comments}
                loading={loadingComments}
                sendComment={sendComment}
              />
              </div>
            </aside>
          )}
      </div>

      {isCommentsOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
            <div
              className="absolute inset-0 bg-black/50 transition-opacity duration-200"
              onClick={() => setIsCommentsOpen(false)}
              aria-hidden
            />
            <div
              className="relative w-full max-w-sm h-full bg-[hsl(var(--surface-1))] flex flex-col transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ActivityPanel
                comments={comments}
                loading={loadingComments}
                sendComment={sendComment}
              />
            </div>
          </div>
        )}

        {isImageExpanded && selectedItem?.screenshotUrl && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-10"
            onClick={() => setIsImageExpanded(false)}
          >
            <img
              src={selectedItem.screenshotUrl}
              alt="Expanded Screenshot"
              className="max-h-full max-w-full rounded-xl"
            />
          </div>
        )}

        {showDeleteModal && selectedId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ticket-title"
          >
            <div
              className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.06)] max-w-sm w-full p-6 border border-neutral-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-ticket-title" className="text-[18px] font-medium leading-[1.35] text-neutral-900">
                Delete feedback permanently?
              </h2>
              <p className="mt-2 text-[14px] text-neutral-500">
                This action cannot be undone. This will permanently remove this feedback and associated activity.
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-[13px] font-medium rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFeedback(selectedId)}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 transition-colors"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}

      {session && (
        <CaptureWidget
          sessionId={sessionId as string}
          userId={session.userId}
          onComplete={handleTranscript}
          onDelete={handleDeleteFeedback}
        />
      )}
    </>
  );
}
