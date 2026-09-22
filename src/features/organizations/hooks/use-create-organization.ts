import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createOrganization } from "../services/organization.service";
import type { Organization } from "../types/organization.types";
import { useSetActiveOrganization } from "./use-set-active-organization";

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { setActiveOrganization } = useSetActiveOrganization();

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
      // Also persists as the user's active org server-side, so a later login
      // reopens it instead of falling back to their oldest membership.
      setActiveOrganization(organization.id);
    },
  });
}
