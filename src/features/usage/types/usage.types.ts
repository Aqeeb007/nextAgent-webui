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

// GET /usage/by-agent response shape — one row per (agent, event type)
// pair that has at least one event in the period. `agentId` is null for
// events with no agent to attribute them to (document-upload embeddings —
// a document isn't owned by a single agent).
export interface UsageSummaryByAgentRow {
  agentId: string | null;
  eventType: UsageEventType;
  totalQuantity: number;
  eventCount: number;
}

// GET /usage/daily response shape — one row per day with at least one
// chat_completion/embedding event, oldest first. Tool calls are excluded
// (different unit — see UsageTrendChart).
export interface UsageDailyPoint {
  day: string; // "YYYY-MM-DD"
  totalTokens: number;
}
