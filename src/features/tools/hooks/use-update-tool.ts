import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { updateTool } from "../services/tool.service";
import type { UpdateToolPayload } from "../types/tool.types";

export function useUpdateTool() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateToolPayload }) =>
      updateTool(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools", selectedOrgId] });
    },
  });
}
