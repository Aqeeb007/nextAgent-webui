import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listWorkflows } from "../services/workflow.service";

export function useWorkflows() {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["workflows", selectedOrgId],
    queryFn: listWorkflows,
    enabled: Boolean(selectedOrgId),
  });
}
