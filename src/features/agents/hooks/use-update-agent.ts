import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { updateAgent } from "../services/agent.service";
import type { UpdateAgentPayload } from "../types/agent.types";

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgentPayload }) =>
      updateAgent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", selectedOrgId] });
    },
  });
}
