// Mirrors webapp-api's chat module (src/chat/*) — one conversation per
// (agent, user), not a list the user picks between.
export type MessageRole = "user" | "assistant" | "tool";

export interface AssistantToolCallData {
  toolCalls: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

export interface ToolResultData {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  // Present on an assistant turn that triggered tool calls (content is often
  // empty then) or on the matching tool-result row — see AssistantToolCallData
  // / ToolResultData above for the two shapes it can hold.
  toolCallData: Record<string, unknown> | null;
  sequence: number;
  createdAt: string;
}

// GET /agents/:agentId/chat — conversationId is null until the first
// message is sent (ChatService.getHistory / ConversationsService.findOrCreate).
export interface ChatHistory {
  conversationId: string | null;
  messages: ChatMessage[];
}

export interface SendMessagePayload {
  message: string;
}

// POST /agents/:agentId/chat — only the final assistant text, not the full
// row set (tool-call/tool-result turns are persisted server-side but not
// echoed here), so callers refetch history rather than append this in place.
export interface SendMessageResult {
  conversationId: string;
  message: string;
}
