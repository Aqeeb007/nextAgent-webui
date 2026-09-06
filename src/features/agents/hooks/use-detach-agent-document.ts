import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { detachAgentDocument } from "../services/agent-document.service";

export function useDetachAgentDocument(agentId: string) {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: (documentId: string) => detachAgentDocument(agentId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agents", selectedOrgId, agentId, "documents"],
      });
    },
  });
}
