import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { removeWorkflowStep } from "../services/workflow.service";

export function useRemoveWorkflowStep() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    // workflow_step_edges FKs cascade-delete server-side, so edges pointing
    // to/from the removed step disappear on their own — no separate edge
    // cleanup needed here.
    mutationFn: ({ workflowId, stepId }: { workflowId: string; stepId: string }) =>
      removeWorkflowStep(workflowId, stepId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflows", selectedOrgId, variables.workflowId],
      });
    },
  });
}
