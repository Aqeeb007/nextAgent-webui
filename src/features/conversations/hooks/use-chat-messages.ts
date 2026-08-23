import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getMessages } from "../services/conversation.service";

export function useChatMessages(agentId: string, conversationId: string | null) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: [
      "agents",
      selectedOrgId,
      agentId,
      "conversations",
      conversationId,
      "messages",
    ],
    queryFn: () => getMessages(agentId, conversationId as string),
    enabled: Boolean(selectedOrgId) && Boolean(agentId) && Boolean(conversationId),
  });
}
