import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { addWorkflowStep } from "../services/workflow.service";
import type { WorkflowStepPayload } from "../types/workflow.types";

export function useAddWorkflowStep() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({
      workflowId,
      payload,
    }: {
      workflowId: string;
      payload: WorkflowStepPayload;
    }) => addWorkflowStep(workflowId, payload),
    onSuccess: (_data, variables) => {
      // A workflow's first-ever step silently becomes its entry step
      // server-side, so the detail query must refetch either way.
      queryClient.invalidateQueries({
        queryKey: ["workflows", selectedOrgId, variables.workflowId],
      });
    },
  });
}
