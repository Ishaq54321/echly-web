/**
 * Intelligence engine types — backend infrastructure.
 * No AI branding; scoring, clustering, risk, decay, velocity, patterns.
 */

export interface SignalInput {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  createdAtMs: number | null;
  updatedAtMs?: number | null;
  isResolved: boolean;
  tags?: string[] | null;
  ownerId?: string | null;
}

export interface ScoredSignal extends SignalInput {
  impactScore: number;
  riskScore: number;
  confidencePercent: number;
  timeDecayHours: number | null;
  resolutionVelocity: "fast" | "normal" | "slow" | null;
  clusterId?: string | null;
}

/** Inputs for impact scoring (frequency, severity, sentiment, sessions, decay, velocity). */
export interface ImpactScoringInput {
  signalId: string;
  frequencyInSessions?: number;
  severityWeight?: number;
  sentimentWeight?: number;
  affectedSessionIds?: string[];
  timeDecayHours?: number;
  velocityStagnation?: boolean;
}

/** Inputs for risk (time open, owner load, dependency overlap, similar unresolved). */
export interface RiskScoringInput {
  signalId: string;
  timeOpenHours?: number;
  ownerLoad?: number;
  dependencyOverlapCount?: number;
  similarUnresolvedCount?: number;
}

export interface ClusterAssignment {
  signalId: string;
  clusterId: string;
  clusterLabel: string;
  confidence: number;
}

export interface MergeSuggestion {
  signalIds: string[];
  reason: "similar" | "duplicate" | "consolidate";
  /** Shown as system option, e.g. "Merge similar signals?" */
  label: string;
}

export interface LoadBalanceRecommendation {
  signalId: string;
  suggestedOwnerId: string | null;
  reason: string;
}
