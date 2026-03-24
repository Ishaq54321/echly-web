# Fix: Scroll listener lifecycle after tray minimize / reopen

## Problem

Pagination (`ECHLY_LOAD_MORE`) stopped working after minimizing and reopening the extension tray because the scroll `useEffect` did not re-run when the list DOM was recreated. The dependency array omitted visibility-related inputs (`showPanel`, `expanded` / `effectiveIsOpen`), so React kept the previous effect instance while `listScrollRef` pointed at a new element—or no listener was bound to the new scroll container.

## Changes (`lib/capture-engine/core/CaptureWidget.tsx`)

1. **`showPanel` in the scroll effect dependency array**  
   When the tray is minimized or reopened, `showPanel` changes, so the effect cleans up the old listener and attaches to the current `listScrollRef` target after commit.

2. **Mount epoch + stable ref callback**  
   - `scrollListMountEpoch` increments when the list scroll container mounts (non-null ref).  
   - `listScrollRefCallback` is wrapped in `useCallback` so the ref identity is stable across renders (avoids detach/reattach every render from an inline ref).  
   This forces a rebind when the list node mounts even if `showPanel` alone did not change (e.g. conditional inner list visibility).

3. **Temporary logging**  
   - On attach: `console.log("[ECHLY UI] scroll listener attached")`  
   - On cleanup: `console.log("[ECHLY UI] scroll listener removed")`  

   Remove or gate behind a debug flag once verified in production.

## How to verify

1. Open the extension with a session and a long feedback list.  
2. Scroll near the bottom → confirm `[ECHLY UI] scroll listener attached` (once per mount) and scroll / `ECHLY_LOAD_MORE` behavior.  
3. Minimize the tray, then reopen.  
4. Scroll near the bottom again.  

**Expected:** `scroll listener removed` on minimize (when the list unmounts), `scroll listener attached` after reopen, `ECHLY_LOAD_MORE` fires and pagination works.

## Success criteria

- Scroll listener reattaches after reopen.  
- `ECHLY_LOAD_MORE` fires after resume.  
- Pagination behaves the same as before minimize/reopen.
