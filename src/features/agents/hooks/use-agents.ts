import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listAgents } from "../services/agent.service";

export function useAgents() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Scoped by the X-Organization-Id header (see interceptors.ts), so the
    // query key must include it — otherwise switching orgs would keep
    // serving the previous org's cached agent list.
    queryKey: ["agents", selectedOrgId],
    queryFn: listAgents,
    enabled: Boolean(selectedOrgId),
  });
}
