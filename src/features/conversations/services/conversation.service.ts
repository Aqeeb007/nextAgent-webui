import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  ChatHistory,
  SendMessagePayload,
  SendMessageResult,
} from "../types/conversation.types";

export async function getChatHistory(agentId: string) {
  const { data } = await apiClient.get<ChatHistory>(endpoints.agents.chat(agentId));
  return data;
}

export async function sendChatMessage(agentId: string, payload: SendMessagePayload) {
  const { data } = await apiClient.post<SendMessageResult>(
    endpoints.agents.chat(agentId),
    payload
  );
  return data;
}

export async function resetChat(agentId: string) {
  await apiClient.delete(endpoints.agents.chat(agentId));
}
