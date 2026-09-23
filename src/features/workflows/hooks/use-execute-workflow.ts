import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { executeWorkflow } from "../services/workflow.service";
import type { ExecuteWorkflowPayload } from "../types/workflow.types";

export function useExecuteWorkflow() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({
      workflowId,
      payload,
    }: {
      workflowId: string;
      payload: ExecuteWorkflowPayload;
    }) => executeWorkflow(workflowId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflow-runs", selectedOrgId, variables.workflowId],
      });
    },
  });
}
