import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listAgentTools } from "../services/agent-tool.service";

export function useAgentTools(agentId: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["agents", selectedOrgId, agentId, "tools"],
    queryFn: () => listAgentTools(agentId),
    enabled: Boolean(selectedOrgId) && Boolean(agentId),
  });
}
