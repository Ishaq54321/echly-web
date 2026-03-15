/**
 * Stub for extension build. Extension no longer uses Firebase; auth is via backend session.
 * Any residual import of @/lib/firebase in shared code gets this stub.
 */
export const auth = {} as unknown as { currentUser: null };
export const db = {} as unknown;
export const storage = {} as unknown;
