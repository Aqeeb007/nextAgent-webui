import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { addWorkflowEdge } from "../services/workflow.service";
import type { WorkflowEdgePayload } from "../types/workflow.types";

export function useAddWorkflowEdge() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({
      workflowId,
      payload,
    }: {
      workflowId: string;
      payload: WorkflowEdgePayload;
    }) => addWorkflowEdge(workflowId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflows", selectedOrgId, variables.workflowId],
      });
    },
  });
}
