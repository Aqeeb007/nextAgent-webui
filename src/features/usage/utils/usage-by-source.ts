import type { UsageBreakdownRow, UsageSummaryByAgentRow } from "../types/usage.types";

// The three surfaces that can drive LLM/tool usage today (mirrors the rule
// in webapp-api's UsageService.summaryByAgent):
//  - "Agent Chat": a user talking to an agent directly — chat_completion /
//    tool_execution events with no `source` in metadata.
//  - "Knowledge Base": embeddings, whether ingesting a document on upload
//    or embedding a query for RAG retrieval — always eventType
//    "embedding", regardless of whether an agent triggered it.
//  - "Workflow": a workflow's `agent`/`tool` step running on its own —
//    metadata `source: "workflow_step"`.
type Channel = "agent_chat" | "knowledge_base" | "workflow";

const CHANNEL_LABEL: Record<Channel, string> = {
  agent_chat: "Agent Chat",
  knowledge_base: "Knowledge Base",
  workflow: "Workflow",
};

// Fixed display order, independent of which channels actually have data in
// the selected period, so the table always tells the same "these are the
// three surfaces" story rather than reshuffling row order run to run.
const CHANNEL_ORDER: Channel[] = ["agent_chat", "knowledge_base", "workflow"];

function channelFor(row: Pick<UsageSummaryByAgentRow, "eventType" | "source">): Channel {
  if (row.eventType === "embedding") return "knowledge_base";
  if (row.source === "workflow_step") return "workflow";
  return "agent_chat";
}

function emptyRow(channel: Channel): UsageBreakdownRow {
  return { key: channel, label: CHANNEL_LABEL[channel], chatTokens: 0, embeddingTokens: 0, toolCalls: 0 };
}

// Pivots the same API rows usage-by-agent.ts consumes, grouped by surface
// instead of by agent — "where is my usage coming from" rather than "which
// agent cost the most". Same underlying usage_events, so both tables' grand
// totals reconcile with each other and with the page's top StatCards.
export function pivotUsageBySource(rows: UsageSummaryByAgentRow[] | undefined): UsageBreakdownRow[] {
  if (!rows || rows.length === 0) return [];

  const byChannel = new Map<Channel, UsageBreakdownRow>(
    CHANNEL_ORDER.map((channel) => [channel, emptyRow(channel)])
  );

  for (const row of rows) {
    const bucket = byChannel.get(channelFor(row));

    if (!bucket) continue;

    if (row.eventType === "chat_completion") bucket.chatTokens += row.totalQuantity;
    else if (row.eventType === "embedding") bucket.embeddingTokens += row.totalQuantity;
    else if (row.eventType === "tool_execution") bucket.toolCalls += row.totalQuantity;
  }

  return CHANNEL_ORDER.map((channel) => byChannel.get(channel) as UsageBreakdownRow);
}
