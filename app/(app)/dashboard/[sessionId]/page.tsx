"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addFeedback, deleteFeedback, updateFeedback } from "@/lib/feedback";
import CaptureWidget from "@/components/CaptureWidget";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import FeedbackSidebar from "@/components/session/FeedbackSidebar";
import FeedbackDetail from "@/components/session/feedbackDetail/FeedbackDetail";
import { ActivityPanel } from "@/components/session/feedbackDetail/ActivityPanel";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";

function formatRelativeTime(
  createdAt: { toDate?: () => Date; seconds?: number } | null | undefined
): string {
  if (!createdAt) return "";
  try {
    const date =
      typeof createdAt.toDate === "function"
        ? createdAt.toDate()
        : createdAt.seconds != null
          ? new Date(createdAt.seconds * 1000)
          : null;
    if (!date) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "";
  }
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const {
    feedback,
    setFeedback,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    fetchNextPage: fetchNextFeedbackPage,
    refetchFirstPage: refetchFeedbackFirstPage,
  } = useSessionFeedbackPaginated(sessionId as string | undefined);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      setSessionLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  // Select first feedback when first page loads and none selected.
  useEffect(() => {
    if (feedback.length > 0 && selectedId === null) {
      setSelectedId(feedback[0].id);
    }
  }, [feedback, selectedId]);

  /* ================= SELECTED ITEM WITH INDEX ================= */

  const selectedIndex = feedback.findIndex(
    (f) => f.id === selectedId
  );

  const selectedItem =
    selectedIndex !== -1
      ? {
          ...feedback[selectedIndex],
          index: selectedIndex + 1,
          total: feedback.length,
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

  /* ================= SYNC DESCRIPTION ================= */

  useEffect(() => {
    if (selectedItem) {
      setDescriptionDraft(selectedItem.description);
      setIsEditingDescription(false);
    }
  }, [selectedId]);

  /* ================= SAVE TITLE (inline, optimistic + revert on fail) ================= */

  const saveTitle = async (newTitle: string) => {
    if (!selectedId || newTitle.trim() === "") return;
    const prevTitle = feedback.find((f) => f.id === selectedId)?.title ?? "";
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, title: newTitle.trim() } : item
      )
    );
    try {
      await updateFeedback(selectedId, { title: newTitle.trim() });
    } catch {
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, title: prevTitle } : item
        )
      );
    }
  };

  /* ================= SAVE DESCRIPTION (PATCH on blur) ================= */

  const saveDescription = async () => {
    if (!selectedId || descriptionDraft === feedback.find((f) => f.id === selectedId)?.description) {
      setIsEditingDescription(false);
      return;
    }
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, description: descriptionDraft } : item
      )
    );
    setIsEditingDescription(false);
    try {
      await updateFeedback(selectedId, { description: descriptionDraft });
    } catch {
      const prevDescription = feedback.find((f) => f.id === selectedId)?.description ?? "";
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, description: prevDescription } : item
        )
      );
    }
  };

  /* ================= SAVE ACTION ITEMS ================= */

  const saveActionItems = async (actionItems: string[]) => {
    if (!selectedId) return;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, actionItems } : item
      )
    );
    try {
      await updateFeedback(selectedId, { actionItems });
    } catch {
      const prevItems = feedback.find((f) => f.id === selectedId)?.actionItems ?? null;
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, actionItems: prevItems } : item
        )
      );
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
    await deleteFeedback(id);
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    setShowDeleteModal(false);
    router.push(`/dashboard/${sessionId}`);
  };

  if (sessionLoading) return null;

  return (
    <>
      <div
        className={`h-full grid grid-cols-1 ${
          isCommentsOpen
            ? "grid-rows-[0_1fr_1fr_1fr] lg:grid-cols-[340px_1fr_380px] lg:grid-rows-none"
            : "grid-rows-[0_1fr_1fr] lg:grid-cols-[340px_1fr] lg:grid-rows-none"
        }`}
      >
        <aside className="flex flex-col h-full min-h-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
          <FeedbackSidebar
            feedback={feedback}
            selectedId={selectedId}
            onSelect={setSelectedId}
            selectedIndex={selectedIndex}
            total={feedback.length}
            loadingMore={feedbackLoading}
            hasMore={hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            onLoadMore={fetchNextFeedbackPage}
          />
        </aside>

        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-neutral-50">
          <div className="max-w-4xl mx-auto w-full px-8 pt-5 pb-3 shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))]">
              {session?.title ?? "Session"}
            </h1>
            <div className="text-sm text-[hsl(var(--text-secondary))] mt-1 flex items-center gap-1.5 [&_span]:opacity-[0.92]">
              <span>You</span>
              <span aria-hidden>•</span>
              <span>{formatRelativeTime(session?.createdAt) || "—"}</span>
              <span aria-hidden>•</span>
              <span>
                {feedback.length} feedback item{feedback.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50">
              <div className="flex flex-col h-full px-8 py-6">
                <FeedbackDetail
                  sessionId={sessionId as string}
                  selectedItem={selectedItem}
                  isEditingDescription={isEditingDescription}
                  descriptionDraft={descriptionDraft}
                  setIsEditingDescription={setIsEditingDescription}
                  setDescriptionDraft={setDescriptionDraft}
                  saveDescription={saveDescription}
                  onSaveTitle={saveTitle}
                  onRequestDelete={() => setShowDeleteModal(true)}
                  onSaveActionItems={saveActionItems}
                  setIsImageExpanded={setIsImageExpanded}
                  isCommentsOpen={isCommentsOpen}
                  onToggleActivity={() => setIsCommentsOpen((prev) => !prev)}
                />
              </div>
            </div>
          </div>
        </div>

        {isCommentsOpen && (
            <aside className="flex flex-col h-full min-h-0 hidden lg:block bg-[hsl(var(--surface-1))] border-l border-[hsl(var(--border)/0.8)] px-6">
              <ActivityPanel
                comments={comments}
                loading={loadingComments}
                sendComment={sendComment}
              />
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
              className="bg-[hsl(var(--surface-1))] rounded-lg shadow-xl max-w-sm w-full p-6 border border-[hsl(var(--border))]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-ticket-title" className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                Delete ticket?
              </h2>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
                This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFeedback(selectedId)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
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
