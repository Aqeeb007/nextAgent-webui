import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { createWorkflow } from "../services/workflow.service";

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", selectedOrgId] });
    },
  });
}
