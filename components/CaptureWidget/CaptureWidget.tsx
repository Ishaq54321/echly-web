"use client";

import React from "react";
import Image from "next/image";
import AudioWaveform from "@/components/AudioWaveform";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackList from "./FeedbackList";
import WidgetFooter from "./WidgetFooter";
import type { CaptureWidgetProps } from "./types";

export default function CaptureWidget({
  sessionId,
  userId,
  extensionMode = false,
  initialPointers,
  onComplete,
  onDelete,
  widgetToggleRef,
  onRecordingChange,
  expanded,
  onExpandRequest,
  onCollapseRequest,
}: CaptureWidgetProps) {
  const {
    state,
    handlers,
    derivedValues,
    refs,
  } = useCaptureWidget({
    sessionId,
    userId,
    extensionMode,
    initialPointers,
    onComplete,
    onDelete,
    onRecordingChange,
  });

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  if (!effectiveIsOpen) {
    return (
      <div className="fixed bottom-10 right-10 z-50 capture-floating-wrapper">
        <button
          type="button"
          onClick={() => (onExpandRequest ? onExpandRequest() : handlers.setIsOpen(true))}
          className="capture-floating-trigger
                     flex items-center gap-3
                     bg-white border border-[rgba(0,0,0,0.08)]
                     px-5 py-2.5 rounded-[20px]
                     text-[#111827] font-semibold
                     shadow-[0_10px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)]
                     transition-[transform_80ms_ease-in,box-shadow_150ms_ease-out]
                     hover:-translate-y-px hover:shadow-[0_12px_34px_rgba(0,0,0,0.14),0_5px_12px_rgba(0,0,0,0.08)]
                     active:scale-[0.98] cursor-pointer"
        >
          <Image src="/Echly_logo.svg" alt="Echly" width={26} height={26} className="shrink-0" />
          Capture Feedback
        </button>
      </div>
    );
  }

  return (
    <>
      {!extensionMode && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-[4px] bg-black/8"
          aria-hidden
        />
      )}
      <div
        ref={refs.widgetRef}
        className={`fixed w-[480px] transition-all duration-200 ${
          !extensionMode && state.position ? "" : !extensionMode ? "bottom-10 right-10" : ""
        } ${extensionMode ? "" : "z-50"}`}
        style={
          extensionMode
            ? {
                position: "fixed",
                ...(state.position
                  ? { left: state.position.x, top: state.position.y }
                  : { bottom: "24px", right: "24px" }),
                zIndex: 2147483647,
                pointerEvents: "auto",
              }
            : {
                ...(state.position ? { left: state.position.x, top: state.position.y } : {}),
              }
        }
      >
        <div className="bg-white rounded-lg
                        border border-slate-200/80
                        shadow-[0_16px_40px_rgba(0,0,0,0.12),0_6px_16px_rgba(0,0,0,0.08)]
                        overflow-hidden font-sans">
        <CaptureHeader
          onStartDrag={handlers.startDrag}
          onShare={handlers.handleShare}
          onMoreClick={() => handlers.setShowMenu((p) => !p)}
          onClose={() => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false))}
          showMenu={state.showMenu}
          onResetSession={handlers.resetSession}
          menuRef={refs.menuRef}
        />

        <div className="px-6 py-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <FeedbackList
            items={state.pointers}
            expandedId={state.expandedId}
            editingId={state.editingId}
            editedTitle={state.editedTitle}
            editedDescription={state.editedDescription}
            onExpand={handlers.setExpandedId}
            onStartEdit={handlers.startEditing}
            onSaveEdit={handlers.saveEdit}
            onDelete={handlers.deletePointer}
            onEditedTitleChange={handlers.setEditedTitle}
            onEditedDescriptionChange={handlers.setEditedDescription}
          />

          {state.errorMessage && (
            <div className="text-sm text-neutral-600 bg-neutral-100/70 border border-neutral-200 rounded-md px-4 py-3">
              {state.errorMessage}
            </div>
          )}

          {state.state === "capturing" && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm text-slate-600">
              Capturing screenshot…
            </div>
          )}

          {(state.state === "processing" || state.state === "anticipation") && (
            <div className="capture-processing-enter relative flex items-center gap-4 text-sm text-slate-600 py-3 pr-4 min-h-[52px]">
              <div className="capture-structuring-text flex items-center gap-2 flex-1">
                <span className="text-slate-600">Structuring your feedback</span>
                <span className="capture-ellipsis inline-flex gap-0.5" aria-hidden>
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
              <div
                className={`capture-structuring-progress ${state.state === "anticipation" ? "capture-structuring-progress--complete" : ""}`}
                aria-hidden
              >
                <div className="capture-structuring-progress-fill" />
              </div>
            </div>
          )}

          {state.state === "listening" && (
            <div className="capture-listening-enter border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-slate-800">Listening...</span>
                <span className="capture-timer text-sm text-slate-500">{derivedValues.formatTime()}</span>
              </div>
              <div className="capture-listening-waveform-wrap mb-4 flex items-center justify-center">
                <AudioWaveform isActive={state.state === "listening"} />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={handlers.discardListening} className="text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-neutral-100 transition-colors duration-120 cursor-pointer px-3 py-2 rounded-md">Cancel</button>
                <button type="button" onClick={handlers.finishListening} className="bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] px-5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 cursor-pointer">Done</button>
              </div>
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
