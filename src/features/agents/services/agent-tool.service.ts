import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type { AgentTool } from "../types/agent-tool.types";

export async function listAgentTools(agentId: string) {
  const { data } = await apiClient.get<AgentTool[]>(endpoints.agents.tools.list(agentId));
  return data;
}

export async function attachAgentTool(agentId: string, toolId: string) {
  const { data } = await apiClient.post(endpoints.agents.tools.list(agentId), { toolId });
  return data;
}

export async function detachAgentTool(agentId: string, toolId: string) {
  await apiClient.delete(endpoints.agents.tools.detail(agentId, toolId));
}
