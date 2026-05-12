"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ImageBlock } from "./ImageBlock";

export default function ImageNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const src = (node.attrs.src as string) || "";
  const alt = (node.attrs.alt as string) || "";
  const widthAttr = node.attrs.width as string | number | null | undefined;
  const aspectAttr = node.attrs["data-aspect"] as string | number | null | undefined;

  const parsedWidth =
    typeof widthAttr === "number"
      ? widthAttr
      : widthAttr
        ? parseInt(String(widthAttr), 10) || undefined
        : undefined;
  const parsedAspect =
    typeof aspectAttr === "number"
      ? aspectAttr
      : aspectAttr
        ? parseFloat(String(aspectAttr)) || undefined
        : undefined;

  return (
    <NodeViewWrapper as="div" className="image-block-wrapper" data-drag-handle>
      <ImageBlock
        src={src}
        alt={alt}
        width={parsedWidth}
        aspect={parsedAspect}
        editable={editor.isEditable}
        onResize={(newWidth) => {
          updateAttributes({ width: String(newWidth) });
        }}
        onAspectDetected={(detected) => {
          if (!parsedAspect) {
            updateAttributes({ "data-aspect": String(detected) });
          }
        }}
      />
    </NodeViewWrapper>
  );
}
