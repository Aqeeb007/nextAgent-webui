export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  model: string;
  configuration: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentPayload {
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  configuration?: Record<string, unknown>;
}

export type UpdateAgentPayload = Partial<AgentPayload>;
