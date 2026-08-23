import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { deleteConversation } from "../services/conversation.service";

export function useDeleteConversation(agentId: string) {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(agentId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agents", selectedOrgId, agentId, "conversations"],
        exact: true,
      });
    },
  });
}
