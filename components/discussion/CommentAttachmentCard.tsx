"use client";

import { FileIcon, Download } from "lucide-react";
import type { CommentAttachment } from "@/lib/domain/comment";

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico",
]);
const IMAGE_TYPES = /^image\//;

function isImageAttachment(attachment: CommentAttachment): boolean {
  const name = (attachment.file_name || "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "";
  if (IMAGE_EXTENSIONS.has(ext)) return true;
  return false;
}

export interface CommentAttachmentCardProps {
  attachment: CommentAttachment;
  /** When provided, clicking the image opens this viewer instead of linking. */
  onImageClick?: (url: string, fileName: string) => void;
}

export function CommentAttachmentCard({ attachment, onImageClick }: CommentAttachmentCardProps) {
  const isImage = isImageAttachment(attachment);
  const url = attachment.file_url;
  const name = attachment.file_name;

  const imageContent = (
    <img
      src={url}
      alt={name}
      className="max-w-full h-auto max-h-[360px] object-contain rounded-lg"
    />
  );

  return (
    <div className="mt-3">
      {isImage ? (
        <>
          {onImageClick ? (
            <button
              type="button"
              onClick={() => onImageClick(url, name)}
              className="block max-w-[420px] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity text-left"
            >
              {imageContent}
            </button>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-[420px] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              {imageContent}
            </a>
          )}
          <div className="flex items-center gap-2 mt-1">
            <FileIcon className="h-4 w-4 text-neutral-500 shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-neutral-700 truncate min-w-0" title={name}>
              {name}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#155DFC] hover:underline shrink-0 inline-flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              Download
            </a>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-neutral-500 shrink-0" strokeWidth={1.5} />
          <span className="text-sm text-neutral-700 truncate min-w-0" title={name}>
            {name}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#155DFC] hover:underline shrink-0 inline-flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            Download
          </a>
        </div>
      )}
    </div>
  );
}
