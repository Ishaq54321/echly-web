/**
 * Environment-specific operations used by the capture system.
 * Allows the same capture logic to run in Chrome extension, dashboard, or future browsers
 * without depending on extension runtime behavior.
 *
 * REQUIRED (core depends on these; missing → clear runtime error):
 * - createSession
 * - authenticatedFetch
 * - captureTabScreenshot
 * - openDashboard
 *
 * OPTIONAL (extension/dashboard may omit; core checks before calling):
 * - setActiveSession, startSessionMode, pauseSessionMode, resumeSessionMode, endSessionMode
 * - reportActivity, expandWidget, collapseWidget, openLogin
 * - notifyFeedbackCreated
 */
export interface CaptureEnvironment {
  /** [REQUIRED] Create a new session (e.g. POST /api/sessions). Returns { id } or limit object when 403 PLAN_LIMIT_REACHED. */
  createSession(): Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  >;

  /** [REQUIRED] Authenticated fetch (e.g. with extension token or session cookie). */
  authenticatedFetch(url: string, options?: RequestInit): Promise<Response>;

  /** [REQUIRED] Capture current tab screenshot (e.g. via background). Returns data URL or null. */
  captureTabScreenshot(): Promise<string | null>;

  /** [REQUIRED] Open dashboard at the given URL. */
  openDashboard(url: string): void;

  /** [OPTIONAL] Notify the environment that a feedback ticket was created (e.g. sync to background). */
  notifyFeedbackCreated?(ticket: { id: string; title: string; actionSteps?: string[]; type?: string }): void;

  /** [OPTIONAL] Set the active session (e.g. notify background). */
  setActiveSession?(sessionId: string): void | Promise<void>;

  /** [OPTIONAL] Start session mode (e.g. enable overlay in all tabs). */
  startSessionMode?(): void | Promise<void>;

  /** [OPTIONAL] Pause session mode. */
  pauseSessionMode?(): void | Promise<void>;

  /** [OPTIONAL] Resume session mode. */
  resumeSessionMode?(): void | Promise<void>;

  /** [OPTIONAL] End session mode (e.g. disable overlay, optionally open dashboard). */
  endSessionMode?(): void | Promise<void>;

  /** [OPTIONAL] Report user activity (e.g. reset idle timeout). */
  reportActivity?(): void | Promise<void>;

  /** [OPTIONAL] Expand the capture widget. */
  expandWidget?(): void;

  /** [OPTIONAL] Collapse the capture widget. */
  collapseWidget?(): void;

  /** [OPTIONAL] Open login / auth broker. */
  openLogin?(): void;
}

/** Runtime guard: assert required environment methods exist. Call when core needs environment. */
export function requireCaptureEnvironment(env: CaptureEnvironment | null | undefined): asserts env is CaptureEnvironment {
  if (!env) {
    throw new Error("[ECHLY CORE] No capture environment provided.");
  }
  if (typeof env.createSession !== "function") {
    throw new Error("[ECHLY CORE] Capture environment must implement createSession.");
  }
  if (typeof env.authenticatedFetch !== "function") {
    throw new Error("[ECHLY CORE] Capture environment must implement authenticatedFetch.");
  }
  if (typeof env.captureTabScreenshot !== "function") {
    throw new Error("[ECHLY CORE] Capture environment must implement captureTabScreenshot.");
  }
  if (typeof env.openDashboard !== "function") {
    throw new Error("[ECHLY CORE] Capture environment must implement openDashboard.");
  }
}
