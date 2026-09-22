import { useMutation } from "@tanstack/react-query";

import { useOrganizationStore } from "@/stores/organization.store";

import { setActiveOrganization as persistActiveOrganization } from "../services/organization.service";

/**
 * Switches the active org: updates the local selection immediately (so the
 * UI and the X-Organization-Id header interceptor pick it up for this and
 * every subsequent request right away), then persists the choice server-side
 * via POST /organizations/active so the next login reopens this org instead
 * of falling back to the oldest membership (see AuthService in webapp-api).
 * Use this instead of calling useOrganizationStore's setSelectedOrgId
 * directly anywhere the org switch is a real user/system choice worth
 * remembering across sessions.
 */
export function useSetActiveOrganization() {
  const mutation = useMutation({ mutationFn: persistActiveOrganization });

  function setActiveOrganization(organizationId: string) {
    useOrganizationStore.getState().setSelectedOrgId(organizationId);
    mutation.mutate();
  }

  return { setActiveOrganization, ...mutation };
}
