import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getAgent } from "../services/agent.service";

export function useAgent(id: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["agents", selectedOrgId, id],
    queryFn: () => getAgent(id),
    enabled: Boolean(selectedOrgId) && Boolean(id),
  });
}
