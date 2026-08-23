import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  ChatHistory,
  Conversation,
  ConversationListItem,
  SendMessagePayload,
  SendMessageResult,
} from "../types/conversation.types";

export async function listConversations(agentId: string) {
  const { data } = await apiClient.get<ConversationListItem[]>(
    endpoints.agents.conversations.list(agentId)
  );
  return data;
}

export async function createConversation(agentId: string) {
  const { data } = await apiClient.post<Conversation>(
    endpoints.agents.conversations.list(agentId),
    {}
  );
  return data;
}

export async function deleteConversation(agentId: string, conversationId: string) {
  await apiClient.delete(endpoints.agents.conversations.detail(agentId, conversationId));
}

export async function getMessages(agentId: string, conversationId: string) {
  const { data } = await apiClient.get<ChatHistory>(
    endpoints.agents.conversations.messages(agentId, conversationId)
  );
  return data;
}

export async function sendMessage(
  agentId: string,
  conversationId: string,
  payload: SendMessagePayload
) {
  const { data } = await apiClient.post<SendMessageResult>(
    endpoints.agents.conversations.messages(agentId, conversationId),
    payload
  );
  return data;
}
