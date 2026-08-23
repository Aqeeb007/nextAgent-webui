import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listConversations } from "../services/conversation.service";

export function useConversations(agentId: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["agents", selectedOrgId, agentId, "conversations"],
    queryFn: () => listConversations(agentId),
    enabled: Boolean(selectedOrgId) && Boolean(agentId),
  });
}
