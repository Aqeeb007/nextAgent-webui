import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { addMember } from "../services/organization.service";

export function useAddMember() {
  const queryClient = useQueryClient();
  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);

  return useMutation({
    mutationFn: addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", "members", selectedOrgId],
      });
    },
  });
}
