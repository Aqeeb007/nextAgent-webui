import type { Agent } from "@/features/agents/types/agent.types";

import type { UsageBreakdownRow, UsageSummaryByAgentRow } from "../types/usage.types";

const UNASSIGNED_LABEL = "Unassigned (no agent)";
const UNKNOWN_AGENT_LABEL = "Deleted agent";

// Pivots the API's long-format (agent × source × event type) rows into one
// row per agent, summed across every source — "how much has this agent
// cost in total", whether from a direct chat turn or a workflow step that
// happened to use it. See usage-by-source.ts for the complementary pivot of
// these same rows by *which surface* drove the usage instead of by agent.
// Agent names come from the already-fetched agent list rather than a
// backend join — usage_events has no FK to agents (see UsageService), so an
// id with no matching agent means it was deleted since, not a bug; it's
// still labeled rather than dropped, since the usage genuinely happened.
// `agentId: null` rows (document-upload/RAG-query embeddings, or a workflow
// `tool` step's calls — see usage.types.ts) collect into one "Unassigned"
// row rather than being dropped.
export function pivotUsageByAgent(
  rows: UsageSummaryByAgentRow[] | undefined,
  agents: Agent[] | undefined
): UsageBreakdownRow[] {
  if (!rows || rows.length === 0) return [];

  const agentNames = new Map(agents?.map((agent) => [agent.id, agent.name]));
  const byAgent = new Map<string | null, UsageBreakdownRow>();

  for (const row of rows) {
    const key = row.agentId;
    const existing = byAgent.get(key) ?? {
      key: key ?? "unassigned",
      label: key === null ? UNASSIGNED_LABEL : (agentNames.get(key) ?? UNKNOWN_AGENT_LABEL),
      chatTokens: 0,
      embeddingTokens: 0,
      toolCalls: 0,
    };

    if (row.eventType === "chat_completion") existing.chatTokens += row.totalQuantity;
    else if (row.eventType === "embedding") existing.embeddingTokens += row.totalQuantity;
    else if (row.eventType === "tool_execution") existing.toolCalls += row.totalQuantity;

    byAgent.set(key, existing);
  }

  return Array.from(byAgent.values()).sort(
    (a, b) =>
      b.chatTokens +
      b.embeddingTokens +
      b.toolCalls -
      (a.chatTokens + a.embeddingTokens + a.toolCalls)
  );
}
