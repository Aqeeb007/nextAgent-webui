import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { createOrganization } from "../services/organization.service";
import type { Organization } from "../types/organization.types";

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const setSelectedOrgId = useOrganizationStore((state) => state.setSelectedOrgId);

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (organization) => {
      // Write straight into the cache rather than invalidating: useOrganizations()
      // falls back to the first org whenever the selected id isn't in its list, so
      // selecting the new org before the list query has actually refetched it would
      // get immediately overwritten back to the old selection.
      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        old ? [...old, organization] : [organization]
      );
      setSelectedOrgId(organization.id);
    },
  });
}
