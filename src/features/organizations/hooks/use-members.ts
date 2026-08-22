import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listMembers } from "../services/organization.service";

export function useMembers() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Scoped by the X-Organization-Id header (see interceptors.ts), so the
    // query key must include it — otherwise switching orgs would keep
    // serving the previous org's cached member list.
    queryKey: ["organizations", "members", selectedOrgId],
    queryFn: listMembers,
    enabled: Boolean(selectedOrgId),
  });
}
