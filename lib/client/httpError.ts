/** Thrown when an API call returns a non-OK status; preserves HTTP status for client handling (e.g. 403). */
export class HttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
