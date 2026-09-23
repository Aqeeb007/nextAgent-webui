import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { deleteWorkflow } from "../services/workflow.service";

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", selectedOrgId] });
    },
  });
}
