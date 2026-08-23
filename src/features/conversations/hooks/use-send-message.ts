import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { sendMessage } from "../services/conversation.service";
import type { ChatHistory, ChatMessage } from "../types/conversation.types";

interface SendMessageVariables {
  message: string;
}

export function useSendMessage(agentId: string, conversationId: string) {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);
  const messagesKey = [
    "agents",
    selectedOrgId,
    agentId,
    "conversations",
    conversationId,
    "messages",
  ];
  const listKey = ["agents", selectedOrgId, agentId, "conversations"];

  return useMutation({
    mutationFn: ({ message }: SendMessageVariables) =>
      sendMessage(agentId, conversationId, { message }),
    // Optimistically echo the user's message — POST only returns the final
    // assistant text, not the full row set (tool-call turns are persisted
    // but not echoed), so the authoritative view comes from refetching
    // messages on success rather than appending the response in place.
    onMutate: async ({ message }) => {
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const previous = queryClient.getQueryData<ChatHistory>(messagesKey);

      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        role: "user",
        content: message,
        toolCallData: null,
        sequence: Number.MAX_SAFE_INTEGER,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatHistory>(messagesKey, (old) => ({
        conversationId,
        messages: [...(old?.messages ?? []), optimisticMessage],
      }));

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messagesKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKey, exact: true });
      // Sending updates the conversation's preview/lastMessageAt in the list.
      queryClient.invalidateQueries({ queryKey: listKey, exact: true });
    },
  });
}
