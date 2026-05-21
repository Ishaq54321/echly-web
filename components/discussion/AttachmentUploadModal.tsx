"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Upload, FileIcon } from "lucide-react";
import type { CommentAttachment } from "@/lib/domain/comment";
import { uploadAttachmentWithProgress } from "@/lib/uploadAttachment";
import { Modal } from "@/components/ui/Modal";

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
    <Modal open={open} onClose={handleClose} ariaLabelledBy="upload-attachment-title">
      <div
        className="relative w-full sm:max-w-[520px] h-full sm:h-auto rounded-none sm:rounded-xl border border-[var(--border)] bg-white shadow-lg"
      >
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              <h2
                id="upload-attachment-title"
                className="text-lg font-semibold text-[var(--text-heading)]"
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
              className="p-2 rounded-lg text-secondary hover:bg-[var(--surface-hover)] hover:text-[var(--text-body)] transition-colors"
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
                  ${dragOver ? "border-[var(--brand)] bg-[var(--brand-subtle)]" : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-subtle)]"}
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
                <p className="text-sm font-medium text-[var(--text-body)]">
                  Drag & drop a file here
                </p>
                <p className="text-sm text-secondary mt-0.5">or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded-lg bg-[var(--surface-hover)] text-[var(--text-body)] text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors"
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
              <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
                {validationError || uploadError}
              </p>
            )}

            {!showPreview && (
              <p className="mt-4 text-sm text-secondary">
                Max file size: <strong className="text-[var(--text-body)]">15 MB</strong>
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
                      className="max-h-[220px] w-auto rounded-lg object-contain bg-[var(--surface-subtle)]"
                    />
                    <p className="mt-2 text-sm font-medium text-[var(--text-body)] truncate max-w-full">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center text-secondary">
                      <FileIcon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-heading)] truncate">
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
                    <div className="h-[6px] rounded-full bg-[var(--surface-hover)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
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
                  <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
                    {validationError || uploadError}
                  </p>
                )}

                <p className="mt-4 text-sm text-secondary">
                  Max file size: <strong className="text-[var(--text-body)]">15 MB</strong>
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={uploading || !uploadedAttachment}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      </Modal>
  );
}
