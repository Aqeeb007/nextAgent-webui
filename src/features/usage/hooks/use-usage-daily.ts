import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getUsageDaily } from "../services/usage.service";

export function useUsageDaily() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Scoped by the X-Organization-Id header (see interceptors.ts), so the
    // query key must include it — otherwise switching orgs would keep
    // serving the previous org's cached series. No `since` param — this
    // always asks for the backend's own default trailing window.
    queryKey: ["usage", "daily", selectedOrgId],
    queryFn: () => getUsageDaily(),
    enabled: Boolean(selectedOrgId),
  });
}
