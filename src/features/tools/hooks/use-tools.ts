import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listTools } from "../services/tool.service";

export function useTools() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Scoped by the X-Organization-Id header (see interceptors.ts), so the
    // query key must include it — otherwise switching orgs would keep
    // serving the previous org's cached tool list.
    queryKey: ["tools", selectedOrgId],
    queryFn: listTools,
    enabled: Boolean(selectedOrgId),
  });
}
