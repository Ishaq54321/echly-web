import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildDigestViewModel,
  buildDigestSubject,
} from "./buildDigest";
import type { NotificationRow, NotificationType } from "@/lib/domain/notification";

// Run with: node --import tsx --test lib/email/digest/buildDigest.test.ts
//
// buildDigest imports the domain ONLY as a type (import type), which tsx erases
// before module resolution — so this test needs no @/ path-alias runtime setup.

let seq = 0;
function notif(
  partial: Partial<NotificationRow> & {
    type: NotificationType | string;
    sessionId: string;
    actorName: string;
  }
): NotificationRow {
  seq += 1;
  return {
    id: partial.id ?? `n${seq}`,
    userId: partial.userId ?? "user1",
    workspaceId: partial.workspaceId ?? "ws1",
    sessionId: partial.sessionId,
    sessionTitle: partial.sessionTitle ?? null,
    feedbackId: partial.feedbackId ?? null,
    commentId: partial.commentId ?? null,
    type: partial.type as NotificationType,
    actor: { id: partial.actorName, name: partial.actorName },
    title: partial.title ?? `${partial.actorName} did ${partial.type}`,
    entityTitle: partial.entityTitle ?? null,
    body: partial.body ?? null,
    read: false,
    readAt: null,
    createdAt: partial.createdAt ?? seq * 1000,
    digestedAt: null,
  };
}

test("empty input → null (no email)", () => {
  assert.equal(buildDigestViewModel([]), null);
  assert.equal(buildDigestViewModel(null as unknown as NotificationRow[]), null);
});

test("single session → subject uses session title", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "Homepage", actorName: "Maya" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "Homepage", actorName: "Sam" }),
  ];
  const vm = buildDigestViewModel(rows)!;
  assert.equal(vm.sessionCount, 1);
  assert.equal(vm.totalCount, 2);
  assert.equal(vm.subject, "Annote: 2 updates in Homepage");
  // Two distinct commenters → "from Maya and Sam".
  const commentsLine = vm.sections[0].buckets.find((b) => b.bucket === "comments")!;
  assert.equal(commentsLine.summary, "2 new comments from Maya and Sam");
});

test("multi-session → subject uses 'across N sessions'", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "A", actorName: "Maya" }),
    notif({ type: "comment.added", sessionId: "s2", sessionTitle: "B", actorName: "Sam" }),
    notif({ type: "feedback.resolved", sessionId: "s2", sessionTitle: "B", actorName: "Sam" }),
  ];
  const vm = buildDigestViewModel(rows)!;
  assert.equal(vm.sessionCount, 2);
  assert.equal(vm.totalCount, 3);
  assert.equal(vm.subject, "Annote: 3 updates across 2 sessions");
});

test("singular counts pluralize correctly", () => {
  assert.equal(
    buildDigestSubject({ totalCount: 1, sessionCount: 1, sessionTitle: "Solo" }),
    "Annote: 1 update in Solo"
  );
  assert.equal(
    buildDigestSubject({ totalCount: 5, sessionCount: 1, sessionTitle: "Solo" }),
    "Annote: 5 updates in Solo"
  );
});

test("actor de-dup: same actor across many comments counts once in 'from'", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "Maya" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "Maya" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "Maya" }),
  ];
  const vm = buildDigestViewModel(rows)!;
  const comments = vm.sections[0].buckets.find((b) => b.bucket === "comments")!;
  assert.equal(comments.count, 3);
  assert.deepEqual(comments.actorNames, ["Maya"]);
  assert.equal(comments.summary, "3 new comments from Maya");
});

test("3+ distinct actors render as 'from N people'", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "B" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "C" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "D" }),
  ];
  const vm = buildDigestViewModel(rows)!;
  const comments = vm.sections[0].buckets.find((b) => b.bucket === "comments")!;
  assert.equal(comments.summary, "4 new comments from 4 people");
});

test("event-type bucketing: all covered types map to distinct lines", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "comment.mention", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "description.mention", sessionId: "s1", sessionTitle: "X", actorName: "B" }),
    notif({ type: "feedback.created", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "feedback.resolved", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "feedback.reopened", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "ticket.assigned", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "session.shared", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
    notif({ type: "session.opened", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
  ];
  const vm = buildDigestViewModel(rows)!;
  const buckets = vm.sections[0].buckets.map((b) => b.bucket);
  // mentions merges comment.mention + description.mention into one bucket (2).
  const mentions = vm.sections[0].buckets.find((b) => b.bucket === "mentions")!;
  assert.equal(mentions.count, 2);
  // mentions + assigned come first per BUCKET_ORDER.
  assert.equal(buckets[0], "mentions");
  assert.equal(buckets[1], "assigned");
  assert.ok(buckets.includes("newTickets"));
  assert.ok(buckets.includes("resolved"));
  assert.ok(buckets.includes("reopened"));
  assert.ok(buckets.includes("shared"));
  assert.ok(buckets.includes("opened"));
});

test("session ordering: most-active first, tie-break most-recent", () => {
  const rows = [
    // s2 has 3 (most active) → should sort first.
    notif({ type: "comment.added", sessionId: "s2", sessionTitle: "Busy", actorName: "A", createdAt: 10 }),
    notif({ type: "comment.added", sessionId: "s2", sessionTitle: "Busy", actorName: "A", createdAt: 20 }),
    notif({ type: "comment.added", sessionId: "s2", sessionTitle: "Busy", actorName: "A", createdAt: 30 }),
    // s1 has 1.
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "Quiet", actorName: "A", createdAt: 99 }),
  ];
  const vm = buildDigestViewModel(rows)!;
  assert.equal(vm.sections[0].sessionTitle, "Busy");
  assert.equal(vm.sections[1].sessionTitle, "Quiet");
});

test("session ordering tie-break by recency when totals equal", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "old", sessionTitle: "Old", actorName: "A", createdAt: 100 }),
    notif({ type: "comment.added", sessionId: "new", sessionTitle: "New", actorName: "A", createdAt: 500 }),
  ];
  const vm = buildDigestViewModel(rows)!;
  // Equal totals (1 each) → most-recent (createdAt 500) first.
  assert.equal(vm.sections[0].sessionTitle, "New");
});

test("representative items deduped by feedbackId, capped at 3", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A", feedbackId: "f1", entityTitle: "Ticket 1" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "B", feedbackId: "f1", entityTitle: "Ticket 1" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A", feedbackId: "f2", entityTitle: "Ticket 2" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A", feedbackId: "f3", entityTitle: "Ticket 3" }),
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A", feedbackId: "f4", entityTitle: "Ticket 4" }),
  ];
  const vm = buildDigestViewModel(rows)!;
  const comments = vm.sections[0].buckets.find((b) => b.bucket === "comments")!;
  // f1 appears twice but is deduped; cap is 3 distinct items.
  assert.equal(comments.items.length, 3);
  assert.deepEqual(
    comments.items.map((i) => i.feedbackId),
    ["f1", "f2", "f3"]
  );
});

test("truncated flag threads through and totalCount reflects loaded set", () => {
  const rows = [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "X", actorName: "A" }),
  ];
  const vm = buildDigestViewModel(rows, { truncated: true })!;
  assert.equal(vm.truncated, true);
  // totalCount is the loaded set (the "+N more" lives in the template note).
  assert.equal(vm.totalCount, 1);
});

test("missing actor name falls back to 'Someone'", () => {
  const row: NotificationRow = {
    id: "x",
    userId: "u",
    workspaceId: "w",
    sessionId: "s1",
    sessionTitle: "X",
    feedbackId: null,
    commentId: null,
    type: "comment.added",
    actor: { id: "anon_1", name: "" },
    title: "t",
    entityTitle: null,
    body: null,
    read: false,
    readAt: null,
    createdAt: 1,
    digestedAt: null,
  };
  const vm = buildDigestViewModel([row])!;
  const comments = vm.sections[0].buckets.find((b) => b.bucket === "comments")!;
  assert.deepEqual(comments.actorNames, ["Someone"]);
});

test("deterministic: same input → identical view-model twice", () => {
  const make = () => [
    notif({ type: "comment.added", sessionId: "s1", sessionTitle: "A", actorName: "Maya", createdAt: 1 }),
    notif({ type: "feedback.resolved", sessionId: "s2", sessionTitle: "B", actorName: "Sam", createdAt: 2 }),
    notif({ type: "comment.mention", sessionId: "s1", sessionTitle: "A", actorName: "Sam", createdAt: 3 }),
  ];
  seq = 0;
  const a = buildDigestViewModel(make());
  seq = 0;
  const b = buildDigestViewModel(make());
  assert.deepEqual(a, b);
});
