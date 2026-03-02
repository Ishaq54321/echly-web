"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AudioWaveform from "@/components/AudioWaveform";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackList from "./FeedbackList";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import ProcessingSkeletonCard from "./ProcessingSkeletonCard";
import { RegionCaptureOverlay } from "./RegionCaptureOverlay";
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
  liveStructureFetch,
  captureDisabled = false,
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
    liveStructureFetch,
  });

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;

  /** When transitioning from saving-feedback/anticipation to idle, keep skeleton visible and fade it out (200ms). */
  const [processingExiting, setProcessingExiting] = useState(false);
  const prevStateRef = useRef(state.state);
  useEffect(() => {
    const wasProcessing = prevStateRef.current === "saving-feedback" || prevStateRef.current === "anticipation";
    if (state.state === "idle" && wasProcessing) {
      setProcessingExiting(true);
      const t = setTimeout(() => setProcessingExiting(false), 200);
      return () => clearTimeout(t);
    }
    prevStateRef.current = state.state;
  }, [state.state]);

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
      {extensionMode && state.state === "capturing" && (
        <RegionCaptureOverlay
          getFullTabImage={handlers.getFullTabImage}
          onCapture={handlers.handleRegionCaptured}
          onCancel={handlers.handleCancelCapture}
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
          isProcessingStructure={state.state === "processing-structure"}
        />

        <div className="px-6 py-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <div className="capture-feedback-list flex flex-col space-y-2">
            {/* First slot: skeleton (when publishing) or first ticket (when idle) — no layout shift */}
            {state.state === "saving-feedback" || state.state === "anticipation" || processingExiting ? (
              <ProcessingSkeletonCard exiting={processingExiting} />
            ) : state.pointers[0] ? (
              <FeedbackItem
                item={state.pointers[0]}
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
            ) : null}
            <FeedbackList
              items={
                state.state === "saving-feedback" || state.state === "anticipation" || processingExiting
                  ? state.pointers
                  : state.pointers.slice(1)
              }
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
          </div>

          {state.errorMessage && (
            <div className="text-sm text-neutral-600 bg-neutral-100/70 border border-neutral-200 rounded-md px-4 py-3">
              {state.errorMessage}
            </div>
          )}

          {state.state === "capturing" && !extensionMode && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm text-slate-600">
              Capturing screenshot…
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
              {state.liveStructured && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-100/80 px-3 py-2.5 transition-opacity duration-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-accent/60 animate-pulse" aria-hidden />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Understanding…</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate pr-2">{state.liveStructured.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {state.liveStructured.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/80 text-slate-600 border border-slate-200/80"
                      >
                        {tag}
                      </span>
                    ))}
                    {state.liveStructured.priority && state.liveStructured.priority !== "medium" && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/80 text-slate-600 border border-slate-200/80 capitalize"
                      >
                        {state.liveStructured.priority}
                      </span>
                    )}
                  </div>
                </div>
              )}
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
              captureDisabled={captureDisabled}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
