"use client";

import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ScreenshotEditor } from "@/components/ui/ScreenshotEditor";

export interface ImageViewerProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
  /** Required to show the Edit button */
  screenshotId?: string | null;
  sessionId?: string | null;
  isWorkspaceMember?: boolean;
  hasPins?: boolean;
  onScreenshotUpdate?: (newScreenshotId: string) => void;
  openInEditMode?: boolean;
}

export function ImageViewer({
  imageUrl,
  fileName,
  onClose,
  screenshotId,
  sessionId,
  isWorkspaceMember,
  hasPins,
  onScreenshotUpdate,
  openInEditMode,
}: ImageViewerProps) {
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(openInEditMode ?? false);

  useEffect(() => {
    if (openInEditMode && !editMode) {
      onClose();
    }
  }, [editMode]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  const displayName = fileName ?? "image";
  const canEdit = Boolean(isWorkspaceMember && screenshotId && sessionId);

  return (
    <Modal
      open
      onClose={onClose}
      overlayClassName={`bg-black/80 backdrop-blur-md transition-opacity duration-150 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      panelClassName="w-full h-full max-w-none !bg-transparent !shadow-none !rounded-none !border-0 !p-0"
    >
      <div
        className={`relative w-full h-full flex items-center justify-center p-4 sm:p-6 transition-transform duration-150 ease-out ${
          visible ? "scale-100" : "scale-95"
        }`}
        onClick={editMode ? undefined : onClose}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            if (editMode) {
              setEditMode(false);
            } else {
              onClose();
            }
          }}
          className="absolute top-6 right-6 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors z-30"
          aria-label="Close viewer"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* Edit button */}
        {canEdit && !editMode && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#15101F] hover:bg-[#54495F] text-white text-[14px] font-medium rounded-2xl shadow-2xl border border-white/10 transition-colors"
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
              Edit
            </button>
          </div>
        )}

        {!editMode && (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={imageUrl}
              alt={displayName}
              className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-xl"
              loading="eager"
              decoding="async"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {editMode && canEdit && (
          <div
            className="absolute inset-0 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <ScreenshotEditor
              imageUrl={imageUrl}
              sessionId={sessionId!}
              screenshotId={screenshotId!}
              hasPins={hasPins ?? false}
              embedded={true}
              onSave={(newId) => {
                onScreenshotUpdate?.(newId);
                onClose();
              }}
              onClose={() => {
                setEditMode(false);
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
