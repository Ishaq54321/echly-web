"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Upload, FileIcon } from "lucide-react";
import type { CommentAttachment } from "@/lib/domain/comment";
import { uploadAttachmentWithProgress } from "@/lib/uploadAttachment";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface AttachmentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (attachment: CommentAttachment) => void;
}

export function AttachmentUploadModal({
  open,
  onClose,
  onSend,
}: AttachmentUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAttachment, setUploadedAttachment] = useState<CommentAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedFile(null);
    setUploadedAttachment(null);
    setUploading(false);
    setUploadProgress(null);
    setUploadError(null);
    setValidationError(null);
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const validateFile = useCallback((file: File): boolean => {
    setValidationError(null);
    if (file.size > MAX_FILE_SIZE) {
      setValidationError("File must be smaller than 15 MB.");
      return false;
    }
    return true;
  }, []);

  const startUpload = useCallback((file: File) => {
    setUploadError(null);
    setUploadProgress(0);
    setUploading(true);
    setUploadedAttachment(null);
    uploadAttachmentWithProgress(file, (p) => setUploadProgress(p))
      .then((result) => {
        setUploadedAttachment({
          file_name: result.name,
          file_url: result.url,
          file_size: result.size,
        });
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(null);
      });
  }, []);

  const setFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;
      setSelectedFile(file);
      setUploadError(null);
      startUpload(file);
    },
    [validateFile, startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      setFile(file);
    },
    [setFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFile(file);
      e.target.value = "";
    },
    [setFile]
  );

  const handleChooseFile = useCallback(() => {
    if (uploading) return;
    inputRef.current?.click();
  }, [uploading]);

  const handleSend = useCallback(() => {
    if (!uploadedAttachment) return;
    onSend(uploadedAttachment);
    handleClose();
  }, [uploadedAttachment, onSend, handleClose]);

  useEffect(() => {
    if (!open) return;
    resetState();
  }, [open, resetState]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, handleClose]);

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  if (!open) return null;

  const showPreview = selectedFile != null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-attachment-title"
      >
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
          aria-hidden
        />
        <div
          className="relative w-full max-w-[520px] rounded-xl border border-neutral-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              <h2
                id="upload-attachment-title"
                className="text-lg font-semibold text-neutral-900"
              >
                Upload attachment
              </h2>
              <p className="mt-1 text-sm text-secondary">
                Attach a file to this discussion
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-secondary hover:bg-[#E9ECEB] hover:text-[#111111] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="px-6 pb-6">
            {!showPreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleChooseFile}
                className={`
                  flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10
                  cursor-pointer transition-colors duration-150
                  ${dragOver ? "border-[#E5E7EB] bg-[#E9ECEB]" : "border-neutral-300 hover:border-[#E5E7EB] hover:bg-[#E9ECEB]"}
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept="*/*"
                />
                <div className="flex justify-center text-meta mb-3">
                  <Upload className="h-10 w-10" strokeWidth={1.25} />
                </div>
                <p className="text-sm font-medium text-neutral-700">
                  Drag & drop a file here
                </p>
                <p className="text-sm text-secondary mt-0.5">or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChooseFile();
                  }}
                >
                  Choose File
                </button>
              </div>
            ) : null}

            {!showPreview && (validationError || uploadError) && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {validationError || uploadError}
              </p>
            )}

            {!showPreview && (
              <p className="mt-4 text-sm text-secondary">
                Max file size: <strong className="text-neutral-700">15 MB</strong>
              </p>
            )}

            {showPreview ? (
              <div
                className="animate-in fade-in duration-150"
                style={{ animationDuration: "150ms" }}
              >
                {selectedFile.type.startsWith("image/") && imagePreviewUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreviewUrl}
                      alt=""
                      className="max-h-[220px] w-auto rounded-lg object-contain bg-neutral-50"
                    />
                    <p className="mt-2 text-sm font-medium text-neutral-700 truncate max-w-full">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center text-secondary">
                      <FileIcon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-secondary">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                )}

                {uploading && (
                  <div className="mt-4">
                    <div className="h-[6px] rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#9FE870] transition-all duration-300"
                        style={{
                          width: `${uploadProgress ?? 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-sm text-secondary">
                      Uploading…
                    </p>
                  </div>
                )}

                {(validationError || uploadError) && (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    {validationError || uploadError}
                  </p>
                )}

                <p className="mt-4 text-sm text-secondary">
                  Max file size: <strong className="text-neutral-700">15 MB</strong>
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={uploading || !uploadedAttachment}
                className="primary-cta px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
