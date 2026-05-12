"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Loader2 } from "lucide-react";

function PlaceholderView() {
  return (
    <NodeViewWrapper as="div" className="image-upload-placeholder">
      <div className="image-upload-placeholder-inner">
        <Loader2 className="image-upload-spinner" size={24} />
      </div>
    </NodeViewWrapper>
  );
}

export const ImageUploadPlaceholder = Node.create({
  name: "imageUploadPlaceholder",
  group: "block",
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      uploadId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload-placeholder"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "image-upload-placeholder" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PlaceholderView);
  },
});

export default ImageUploadPlaceholder;
