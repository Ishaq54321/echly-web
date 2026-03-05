/**
 * Pipeline ticket type used by instruction graph and verification.
 * Legacy ontology and batch intent/ticket functions have been removed.
 */

export interface PipelineTicket {
  title: string;
  actionSteps: string[];
  tags: string[];
  confidenceScore: number;
}
