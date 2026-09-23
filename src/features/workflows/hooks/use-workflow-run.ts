import { useQuery } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { getWorkflowRun } from "../services/workflow.service";

// Per-step detail only exists on the single-run endpoint (the run list has
// no stepRuns) — callers enable this only once a specific run is expanded.
export function useWorkflowRun(workflowId: string, runId: string | null) {
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useQuery({
    queryKey: ["workflow-runs", selectedOrgId, workflowId, runId],
    queryFn: () => getWorkflowRun(workflowId, runId as string),
    enabled: Boolean(selectedOrgId) && Boolean(workflowId) && Boolean(runId),
  });
}
