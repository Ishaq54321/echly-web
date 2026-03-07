export function echlyLog(category: string, message: string, data?: unknown): void {
  const prefix = `[ECHLY][${category}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}
