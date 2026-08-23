import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { sendChatMessage } from "../services/conversation.service";
import type { ChatHistory, ChatMessage } from "../types/conversation.types";

interface SendChatMessageVariables {
  message: string;
}

export function useSendChatMessage(agentId: string) {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);
  const queryKey = ["agents", selectedOrgId, agentId, "chat"];

  return useMutation({
    mutationFn: ({ message }: SendChatMessageVariables) =>
      sendChatMessage(agentId, { message }),
    // Optimistically echo the user's message — POST only returns the final
    // assistant text, not the full row set (tool-call turns are persisted
    // but not echoed), so the authoritative view comes from refetching
    // history on success rather than appending the response in place.
    onMutate: async ({ message }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ChatHistory>(queryKey);

      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId: previous?.conversationId ?? "",
        role: "user",
        content: message,
        toolCallData: null,
        sequence: Number.MAX_SAFE_INTEGER,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatHistory>(queryKey, (old) => ({
        conversationId: old?.conversationId ?? null,
        messages: [...(old?.messages ?? []), optimisticMessage],
      }));

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
}
