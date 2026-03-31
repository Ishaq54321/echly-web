/**
 * Client gate for ticket/thread resolve mutations.
 * Uses {@link AccessCapabilities.canResolve} from server context only (e.g. GET /api/sessions/:id).
 * @returns whether `run` was invoked (true = allowed and started).
 */
export function safeResolveAction(args: {
  canResolve: boolean;
  triggerRequestAccessFlow: () => void;
  run: () => void;
}): boolean {
  if (!args.canResolve) {
    args.triggerRequestAccessFlow();
    return false;
  }
  args.run();
  return true;
}
