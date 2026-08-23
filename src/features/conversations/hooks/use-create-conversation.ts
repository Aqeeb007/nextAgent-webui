import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { createConversation } from "../services/conversation.service";

export function useCreateConversation(agentId: string) {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: () => createConversation(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agents", selectedOrgId, agentId, "conversations"],
        exact: true,
      });
    },
  });
}
