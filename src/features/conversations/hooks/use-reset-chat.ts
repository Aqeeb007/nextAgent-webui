import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { resetChat } from "../services/conversation.service";

export function useResetChat(agentId: string) {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: () => resetChat(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agents", selectedOrgId, agentId, "chat"],
        exact: true,
      });
    },
  });
}
