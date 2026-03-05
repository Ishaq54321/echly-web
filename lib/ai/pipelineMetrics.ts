/**
 * Lightweight pipeline telemetry for measuring and tuning.
 * Logs only when NODE_ENV !== "production". No external services.
 */

export interface PipelineMetrics {
  pipelineLatencyMs: number;
  extractionLatencyMs: number;
  refinementLatencyMs: number;
  contextCharactersSent: number;
  instructionCount: number;
  aiCallCount: number;
}

export function createPipelineMetrics(): PipelineMetrics {
  return {
    pipelineLatencyMs: 0,
    extractionLatencyMs: 0,
    refinementLatencyMs: 0,
    contextCharactersSent: 0,
    instructionCount: 0,
    aiCallCount: 0,
  };
}

export function logPipelineMetrics(metrics: PipelineMetrics): void {
  if (process.env.NODE_ENV === "production") return;
  console.debug("ECHLY PIPELINE METRICS", {
    pipelineLatencyMs: metrics.pipelineLatencyMs,
    aiCallCount: metrics.aiCallCount,
    extractionLatencyMs: metrics.extractionLatencyMs,
    refinementLatencyMs: metrics.refinementLatencyMs,
    instructionCount: metrics.instructionCount,
    contextCharactersSent: metrics.contextCharactersSent,
  });
}
