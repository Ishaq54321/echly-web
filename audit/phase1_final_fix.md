## Removed session state

- Removed local `useState` ownership for `sessionMode`, `sessionPaused`, and `sessionStatus` from `useCaptureWidget`.
- Session values are now derived from background-driven props:
  - `sessionMode` from `globalSessionModeActive`
  - `sessionPaused` from `globalSessionPaused`
  - `sessionStatus` computed from derived session mode plus local UI pending (`startSessionPending`)

## Removed sync logic

- Deleted local synchronization writes:
  - `setSessionMode(...)`
  - `setSessionPaused(...)`
  - `setSessionStatus(...)`
- Updated global session effects to perform only UI/flow side effects (pending flags, marker cleanup, panel resets) without writing local session truth.
- Kept allowed local state only for UI/process control (`pausePending`, `endPending`, capture/recording/interaction state).

## Final hook behavior

- `useCaptureWidget` now behaves as a dispatcher + renderer:
  - Reads session truth from background-provided globals.
  - Dispatches session actions (`start`, `pause`, `resume`, `end`) through existing callbacks/environment functions.
  - Maintains only transient UI/pipeline state locally (never canonical session ownership).
- Background remains the single source of truth for session active/paused status.
