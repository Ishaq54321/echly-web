/**
 * Intelligence engines — backend infrastructure.
 * No AI branding. Powers sorting, alerts, momentum, clusters, merge suggestions, risk flags.
 */

export * from "./types";
export { scoreImpact } from "./impactScoring";
export { scoreRisk } from "./riskForecast";
export type { RiskLevel } from "./riskForecast";
export { assignCluster } from "./clustering";
export { computeTimeDecayHours } from "./timeDecay";
export { getResolutionVelocity } from "./velocityAnalyzer";
export type { VelocityMark } from "./velocityAnalyzer";
