/**
 * Signal model for Feedback Intelligence Operating System.
 * Maps to AI-derived and backend fields; supports decision-speed UX.
 */

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

export type SignalStatus = "Open" | "In Progress" | "Blocked" | "Resolved";

export type PriorityRadarBucket = "Critical" | "At Risk" | "Stalled" | "Trending";

export type MomentumDirection = "improving" | "stable" | "slowing";

/** Single feedback item as a "signal" in the stream. */
export interface Signal {
  id: string;
  sessionId: string;
  title: string;
  /** 0–100; AI or heuristic. */
  impactScore: number;
  urgency: UrgencyLevel;
  /** 0–100; AI confidence in classification. */
  confidencePercent: number;
  /** Cluster label from AI grouping. */
  clusterLabel: string | null;
  status: SignalStatus;
  ownerId: string | null;
  ownerName: string | null;
  /** Time decay: older = higher decay (e.g. hours since created). */
  timeDecayHours: number | null;
  /** Resolution velocity marker: fast / normal / slow (optional). */
  resolutionVelocity: "fast" | "normal" | "slow" | null;
  createdAt: { seconds: number } | null;
  clientTimestamp: number | null;
  updatedAt: string | null;
  isResolved: boolean;
  suggestedTags: string[] | null;
  contextSummary: string | null;
}

/** AI Executive Summary block (Command Center). */
export interface AIExecutiveSummary {
  highImpactItems: { id: string; title: string; sessionId: string; impactScore: number }[];
  riskAlerts: { id: string; title: string; sessionId: string; riskLevel: RiskLevel }[];
  emergingPattern: string | null;
  bottleneck: string | null;
  momentum: MomentumDirection;
}

/** Priority Radar grouping. */
export interface PriorityRadarGroup {
  bucket: PriorityRadarBucket;
  signals: { id: string; sessionId: string; title: string }[];
}

/** Execution Momentum metrics. */
export interface ExecutionMomentum {
  resolutionVelocityTrend: "up" | "flat" | "down";
  avgResolutionTimeHours: number | null;
  ownerLoadBalance: { ownerId: string; ownerName: string; openCount: number }[];
  confidenceScoreTrend: "up" | "flat" | "down";
}

/** Signal Heatmap: density of feedback clusters (session × cluster or time bucket). */
export interface SignalHeatmapBucket {
  label: string;
  count: number;
  sessionId?: string;
}

/** Derive urgency from existing data when AI not yet available. */
export function defaultUrgency(isResolved: boolean): UrgencyLevel {
  return isResolved ? "low" : "medium";
}

/** Derive risk from open + age when AI not yet available. */
export function defaultRiskLevel(isResolved: boolean): RiskLevel {
  return isResolved ? "none" : "low";
}

/** Default impact score when not from AI (e.g. 50). */
export const DEFAULT_IMPACT_SCORE = 50;

/** Default confidence when not from AI. */
export const DEFAULT_CONFIDENCE_PERCENT = 85;

/** Minimal feedback-like item for conversion to Signal. */
export interface FeedbackLike {
  id: string;
  sessionId: string;
  title: string;
  isResolved?: boolean;
  suggestedTags?: string[] | null;
  contextSummary?: string | null;
  createdAt?: { seconds: number } | null;
  clientTimestamp?: number | null;
  updatedAt?: string | null;
}

/** Convert feedback/list item to Signal for stream display. Backend can replace with AI-scored signals. */
export function feedbackToSignal(f: FeedbackLike): Signal {
  const status: SignalStatus = f.isResolved ? "Resolved" : "Open";
  const urgency = defaultUrgency(!!f.isResolved);
  const ms = f.createdAt?.seconds != null ? f.createdAt.seconds * 1000 : (f.clientTimestamp ?? 0);
  const timeDecayHours = ms ? (Date.now() - ms) / (1000 * 60 * 60) : null;
  return {
    id: f.id,
    sessionId: f.sessionId,
    title: f.title,
    impactScore: DEFAULT_IMPACT_SCORE,
    urgency,
    confidencePercent: DEFAULT_CONFIDENCE_PERCENT,
    clusterLabel: Array.isArray(f.suggestedTags) && f.suggestedTags[0] ? f.suggestedTags[0] : null,
    status,
    ownerId: null,
    ownerName: null,
    timeDecayHours,
    resolutionVelocity: null,
    createdAt: f.createdAt ?? null,
    clientTimestamp: f.clientTimestamp ?? null,
    updatedAt: f.updatedAt ?? null,
    isResolved: !!f.isResolved,
    suggestedTags: f.suggestedTags ?? null,
    contextSummary: f.contextSummary ?? null,
  };
}
