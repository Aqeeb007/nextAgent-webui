import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getUsageSummary } from "../services/usage.service";

export function useUsageSummary(since?: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Scoped by the X-Organization-Id header (see interceptors.ts), so the
    // query key must include it — otherwise switching orgs or periods would
    // keep serving a stale cached result.
    queryKey: ["usage", "summary", selectedOrgId, since],
    queryFn: () => getUsageSummary(since),
    enabled: Boolean(selectedOrgId),
  });
}
