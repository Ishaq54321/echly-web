/**
 * Shared types for API and middleware.
 */

import type { Request } from "express";

/** Decoded Firebase ID token shape (subset). */
export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

/** Express Request extended with authenticated user (for server middleware). */
export interface RequestWithUser extends Request {
  user: DecodedIdToken;
}
