import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listDocuments } from "../services/document.service";

export function useDocuments() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    // Scoped by the X-Organization-Id header (see interceptors.ts), so the
    // query key must include it — otherwise switching orgs would keep
    // serving the previous org's cached document list.
    queryKey: ["documents", selectedOrgId],
    queryFn: listDocuments,
    enabled: Boolean(selectedOrgId),
  });
}
