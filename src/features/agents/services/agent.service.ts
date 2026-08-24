import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  Agent,
  AgentPayload,
  UpdateAgentPayload,
} from "../types/agent.types";

export async function listAgents() {
  const { data } = await apiClient.get<Agent[]>(endpoints.agents.list);
  return data;
}

export async function getAgent(id: string) {
  const { data } = await apiClient.get<Agent>(endpoints.agents.detail(id));
  return data;
}

export async function createAgent(payload: AgentPayload) {
  const { data } = await apiClient.post<Agent>(endpoints.agents.list, payload);
  return data;
}

export async function updateAgent(id: string, payload: UpdateAgentPayload) {
  const { data } = await apiClient.patch<Agent>(
    endpoints.agents.detail(id),
    payload
  );
  return data;
}

export async function deleteAgent(id: string) {
  await apiClient.delete(endpoints.agents.detail(id));
}
