"use client";

import Image from "next/image";
import AudioWaveform from "@/components/AudioWaveform";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackList from "./FeedbackList";
import WidgetFooter from "./WidgetFooter";
import type { CaptureWidgetProps, StructuredFeedback } from "./types";

export default function CaptureWidget({
  sessionId,
  userId,
  initialPointers,
  onComplete,
  onDelete,
}: CaptureWidgetProps) {
  const {
    state,
    handlers,
    derivedValues,
    refs,
  } = useCaptureWidget({
    sessionId,
    userId,
    initialPointers,
    onComplete,
    onDelete,
  });

  const getFeedbackItemHandlers = (p: StructuredFeedback) => ({
    onExpand: () => handlers.setExpandedId(state.expandedId === p.id ? null : p.id),
    onEdit: () => handlers.startEditing(p),
    onSaveEdit: () => handlers.saveEdit(p.id),
    onDelete: () => handlers.deletePointer(p.id),
    onEditedTitleChange: handlers.setEditedTitle,
    onEditedDescriptionChange: handlers.setEditedDescription,
  });

  if (!state.isOpen) {
    return (
      <button
        onClick={() => handlers.setIsOpen(true)}
        className="fixed bottom-10 right-10 z-50
                   flex items-center gap-3
                   bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] border-opacity-50
                   px-5 py-2.5 rounded-full
                   shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                   text-[hsl(var(--text-primary))] font-medium tracking-tight
                   transition-all duration-150 ease-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
      >
        <Image src="/Echly_logo.svg" alt="Echly" width={26} height={26} />
        Capture Feedback
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 backdrop-blur-[4px] bg-black/6"
        aria-hidden
      />
      <div
        ref={refs.widgetRef}
        className={`fixed z-50 w-[480px] transition-all duration-200 ${
          state.position ? "" : "bottom-10 right-10"
        }`}
        style={state.position ? { left: state.position.x, top: state.position.y } : undefined}
      >
        <div className="bg-white rounded-lg
                        border border-slate-200/80
                        shadow-[0_12px_30px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.06)]
                        overflow-hidden font-sans">
        <CaptureHeader
          onStartDrag={handlers.startDrag}
          onShare={handlers.handleShare}
          onMoreClick={() => handlers.setShowMenu((p) => !p)}
          onClose={() => handlers.setIsOpen(false)}
          showMenu={state.showMenu}
          onResetSession={handlers.resetSession}
          menuRef={refs.menuRef}
        />

        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <FeedbackList
            items={state.pointers}
            expandedId={state.expandedId}
            editingId={state.editingId}
            editedTitle={state.editedTitle}
            editedDescription={state.editedDescription}
            getHandlers={getFeedbackItemHandlers}
          />

          {state.state === "processing" && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              Structuring your feedback...
            </div>
          )}

          {state.state === "listening" && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium text-slate-800">Listening...</span>
                <span className="text-sm text-slate-500">{derivedValues.formatTime()}</span>
              </div>
              <div className="mb-3">
                <AudioWaveform isActive={state.state === "listening"} />
              </div>
              <div className="flex justify-between">
                <button onClick={handlers.discardListening} className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-[120ms] ease-out">Cancel</button>
                <button onClick={handlers.finishListening} className="bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-95 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-[120ms] ease-out">Done</button>
              </div>
            </div>
          )}
          {state.errorMessage && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-4 py-2.5">
              {state.errorMessage}
            </div>
          )}

          {state.state === "idle" && (
            <WidgetFooter
              isIdle={state.state === "idle"}
              onAddFeedback={handlers.handleAddFeedback}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
