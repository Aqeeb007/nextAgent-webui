import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { updateWorkflowStep } from "../services/workflow.service";
import type { UpdateWorkflowStepPayload } from "../types/workflow.types";

export function useUpdateWorkflowStep() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({
      workflowId,
      stepId,
      payload,
    }: {
      workflowId: string;
      stepId: string;
      payload: UpdateWorkflowStepPayload;
    }) => updateWorkflowStep(workflowId, stepId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflows", selectedOrgId, variables.workflowId],
      });
    },
  });
}
