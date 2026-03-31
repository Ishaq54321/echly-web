import { assert } from "@/lib/utils/assert";

export function assertValidSessionMember(data: any) {
  assert(data.userId, "Missing userId");
  assert(data.email, "Missing email");
  assert(data.access === "view" || data.access === "resolve", "Invalid access");
}
