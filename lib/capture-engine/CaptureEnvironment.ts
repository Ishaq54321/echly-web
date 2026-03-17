/**
 * Environment-specific operations used by the capture system.
 * Allows the same capture logic to run in Chrome extension, dashboard, or future browsers
 * without depending on extension runtime behavior.
 */
export interface CaptureEnvironment {
  /** Create a new session (e.g. POST /api/sessions). Returns { id } or limit object when 403 PLAN_LIMIT_REACHED. */
  createSession(): Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  >;

  /** Authenticated fetch (e.g. with extension token or session cookie). */
  authenticatedFetch(url: string, options?: RequestInit): Promise<Response>;

  /** Notify the environment that a feedback ticket was created (e.g. sync to background). */
  notifyFeedbackCreated(ticket: { id: string; title: string; actionSteps?: string[]; type?: string }): void;

  /** Set the active session (e.g. notify background). */
  setActiveSession(sessionId: string): void | Promise<void>;

  /** Start session mode (e.g. enable overlay in all tabs). */
  startSessionMode(): void | Promise<void>;

  /** Pause session mode. */
  pauseSessionMode(): void | Promise<void>;

  /** Resume session mode. */
  resumeSessionMode(): void | Promise<void>;

  /** End session mode (e.g. disable overlay, optionally open dashboard). */
  endSessionMode(): void | Promise<void>;

  /** Report user activity (e.g. reset idle timeout). */
  reportActivity(): void | Promise<void>;

  /** Expand the capture widget. */
  expandWidget(): void;

  /** Collapse the capture widget. */
  collapseWidget(): void;

  /** Open login / auth broker. */
  openLogin(): void;

  /** Open dashboard at the given URL. */
  openDashboard(url: string): void;

  /** Capture current tab screenshot (e.g. via background). Returns data URL or null. */
  captureTabScreenshot(): Promise<string | null>;
}
