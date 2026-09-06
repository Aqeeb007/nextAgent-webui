import type { DocumentStatus } from "@/features/documents/types/document.types";

// Shape of GET /agents/:agentId/documents — a curated join of
// agent_documents + documents, distinct from the full Document record in
// the documents feature (mirrors AgentTool's relationship to Tool).
export interface AgentDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  attachedAt: string;
}
