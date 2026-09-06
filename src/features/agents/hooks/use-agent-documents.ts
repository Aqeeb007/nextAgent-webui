import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listAgentDocuments } from "../services/agent-document.service";

export function useAgentDocuments(agentId: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["agents", selectedOrgId, agentId, "documents"],
    queryFn: () => listAgentDocuments(agentId),
    enabled: Boolean(selectedOrgId) && Boolean(agentId),
  });
}
