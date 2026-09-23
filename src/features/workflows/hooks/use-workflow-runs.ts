import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { listWorkflowRuns } from "../services/workflow.service";

export function useWorkflowRuns(workflowId: string) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["workflow-runs", selectedOrgId, workflowId],
    queryFn: () => listWorkflowRuns(workflowId),
    enabled: Boolean(selectedOrgId) && Boolean(workflowId),
  });
}
