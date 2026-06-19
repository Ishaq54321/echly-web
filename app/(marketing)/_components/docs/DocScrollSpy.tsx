"use client";

import { useEffect } from "react";

/* Client-only scroll-spy ported from the static docs prototype's docs-spy.js.
   Highlights the right-rail TOC link and the mobile jump-row link for whichever
   section is currently in view. Markup is server-rendered (DocToc / DocJump
   emit `[data-toc]` / `[data-jump]` anchors); this just toggles `.active`. */
export function DocScrollSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (!ids.length) return;

    const tocLinks: Record<string, HTMLElement | null> = {};
    const jumpLinks: Record<string, HTMLElement | null> = {};
    ids.forEach((id) => {
      tocLinks[id] = document.querySelector(`.toc a[data-toc="${id}"]`);
      jumpLinks[id] = document.querySelector(`.jump a[data-jump="${id}"]`);
    });

    const setActive = (id: string) => {
      ids.forEach((k) => {
        const on = k === id;
        tocLinks[k]?.classList.toggle("active", on);
        jumpLinks[k]?.classList.toggle("active", on);
      });
    };

    const sections = ids.map((id) => document.getElementById(id));

    const onScroll = () => {
      const line = 140;
      let current = ids[0];
      for (let i = 0; i < sections.length; i++) {
        const el = sections[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top - line <= 0) current = ids[i];
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return null;
}
