// Mirrors webapp-api's chat module (src/chat/*) — multiple conversations per
// (agent, user), each with its own message thread.
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

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  createdAt: string;
}

// GET /agents/:agentId/conversations — preview is the first user message
// (truncated server-side), lastMessageAt is null for a conversation with no
// messages yet (ConversationsService.listForUser).
export interface ConversationListItem extends Conversation {
  preview: string | null;
  lastMessageAt: string | null;
}

// GET /agents/:agentId/conversations/:conversationId/messages
export interface ChatHistory {
  conversationId: string;
  messages: ChatMessage[];
}

// Returned by the 'messageSent' socket ack (ChatService.sendMessage's
// result) — only the final assistant text, not the full row set (tool-call
// turns are persisted server-side but not echoed here), so callers refetch
// the message list rather than append this in place.
export interface SendMessageResult {
  conversationId: string;
  message: string;
}

// Live progress emitted over Socket.IO while a 'sendMessage' call is in
// flight (ChatGateway.emitStep, mirroring ChatService's ChatStepEvent) — the
// event name on the wire equals `type`, the payload is the object itself.
// Purely a UI progress indicator; the persisted messages still come from
// refetching after 'messageSent' resolves.
export type ChatStepEvent =
  | { type: "thinking" }
  | { type: "tool_call"; toolName: string }
  | { type: "tool_result"; toolName: string; result: unknown }
  | { type: "done"; content: string };
