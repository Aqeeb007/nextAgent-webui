import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type { AgentDocument } from "../types/agent-document.types";

export async function listAgentDocuments(agentId: string) {
  const { data } = await apiClient.get<AgentDocument[]>(
    endpoints.agents.documents.list(agentId)
  );
  return data;
}

export async function attachAgentDocument(agentId: string, documentId: string) {
  const { data } = await apiClient.post(endpoints.agents.documents.list(agentId), {
    documentId,
  });
  return data;
}

export async function detachAgentDocument(agentId: string, documentId: string) {
  await apiClient.delete(endpoints.agents.documents.detail(agentId, documentId));
}
