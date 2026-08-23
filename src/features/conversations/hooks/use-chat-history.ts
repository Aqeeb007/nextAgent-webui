import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getChatHistory } from "../services/conversation.service";

export function useChatHistory(agentId: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["agents", selectedOrgId, agentId, "chat"],
    queryFn: () => getChatHistory(agentId),
    enabled: Boolean(selectedOrgId) && Boolean(agentId),
  });
}
