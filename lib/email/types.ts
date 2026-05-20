import "server-only";

export type EmailSendResult =
  | { sent: true }
  | { sent: false; reason: string };
