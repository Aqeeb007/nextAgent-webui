import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { removeWorkflowEdge } from "../services/workflow.service";

export function useRemoveWorkflowEdge() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({ workflowId, edgeId }: { workflowId: string; edgeId: string }) =>
      removeWorkflowEdge(workflowId, edgeId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflows", selectedOrgId, variables.workflowId],
      });
    },
  });
}
