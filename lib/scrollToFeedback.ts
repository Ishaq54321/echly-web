import { highlightElement } from "@/lib/highlightElement";
import type { FeedbackAnchor } from "@/lib/domain/feedback";

export function scrollToFeedback(anchor?: FeedbackAnchor) {
  if (!anchor) return;

  if (anchor.selector) {
    const el = document.querySelector(anchor.selector);

    if (el instanceof HTMLElement) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      highlightElement(el);
      return;
    }
  }

  if (typeof anchor.x === "number" && typeof anchor.y === "number") {
    window.scrollTo({
      top: anchor.y - window.innerHeight / 2,
      left: anchor.x,
      behavior: "smooth",
    });
  }
}

