import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getCurrentOrganization } from "../services/organization.service";

export function useCurrentOrganization() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Response is scoped by the X-Organization-Id header (see interceptors.ts),
    // so the query key must include it — otherwise switching orgs would keep
    // serving the previous org's cached result.
    queryKey: ["organizations", "current", selectedOrgId],
    queryFn: getCurrentOrganization,
    enabled: Boolean(selectedOrgId),
  });
}
