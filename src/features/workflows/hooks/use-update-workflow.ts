import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { updateWorkflow } from "../services/workflow.service";
import type { UpdateWorkflowPayload } from "../types/workflow.types";

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkflowPayload }) =>
      updateWorkflow(id, payload),
    onSuccess: () => {
      // Prefix match also covers ["workflows", selectedOrgId, id] (the
      // single-workflow detail query) — no need to invalidate it separately.
      queryClient.invalidateQueries({ queryKey: ["workflows", selectedOrgId] });
    },
  });
}
