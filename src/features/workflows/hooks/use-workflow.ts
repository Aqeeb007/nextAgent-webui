import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getWorkflow } from "../services/workflow.service";

export function useWorkflow(id: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["workflows", selectedOrgId, id],
    queryFn: () => getWorkflow(id),
    enabled: Boolean(selectedOrgId) && Boolean(id),
  });
}
