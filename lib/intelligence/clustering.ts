/**
 * Signal Clustering Engine.
 * Groups similar signals; returns cluster id and label. Feeds sorting and merge suggestions.
 */

import type { SignalInput } from "./types";
import type { ClusterAssignment } from "./types";

export function assignCluster(signal: SignalInput, _allSignals: SignalInput[]): ClusterAssignment | null {
  const tag = signal.tags?.[0];
  if (tag) {
    return {
      signalId: signal.id,
      clusterId: tag.toLowerCase().replace(/\s+/g, "-"),
      clusterLabel: tag,
      confidence: 85,
    };
  }
  return null;
}
