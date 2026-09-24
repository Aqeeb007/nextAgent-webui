// Mirrors src/usage/constants/usage-event-types.ts in webapp-api.
export type UsageEventType = "chat_completion" | "embedding" | "tool_execution";

// GET /usage response shape — one row per event type that has at least one
// event in the period. A type with no usage yet is simply absent, not a
// zero-value row, so callers must default missing types to 0 themselves.
export interface UsageSummaryRow {
  eventType: UsageEventType;
  totalQuantity: number;
  eventCount: number;
}

// GET /usage/by-agent response shape — one row per (agent, source, event
// type) triple that has at least one event in the period. `agentId` is null
// for events with no agent to attribute them to: document-upload embeddings
// (a document isn't owned by a single agent) and workflow `tool` step calls
// (a workflow step runs a tool directly, with no agent in the loop — a
// workflow `agent` step, by contrast, does carry its agentId). `source` is
// null for a direct chat turn, and otherwise one of "rag_query" |
// "document_upload" | "workflow_step" — see usage-by-source.ts, which pivots
// on this field instead of `agentId` to answer "which surface" rather than
// "which agent".
export interface UsageSummaryByAgentRow {
  agentId: string | null;
  source: string | null;
  eventType: UsageEventType;
  totalQuantity: number;
  eventCount: number;
}

// Shared row shape behind both the "By agent" and "By source" tables on the
// Usage page — same three metric columns, different grouping key — so both
// pivots (usage-by-agent.ts / usage-by-source.ts) can render through one
// UsageTable component instead of two near-identical ones.
export interface UsageBreakdownRow {
  key: string;
  label: string;
  chatTokens: number;
  embeddingTokens: number;
  toolCalls: number;
}

// GET /usage/daily response shape — one row per day with at least one
// chat_completion/embedding event, oldest first. Tool calls are excluded
// (different unit — see UsageTrendChart).
export interface UsageDailyPoint {
  day: string; // "YYYY-MM-DD"
  totalTokens: number;
}
