import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useOrganizationStore } from "@/stores/organization.store";

import { listOrganizations } from "../services/organization.service";
import { useSetActiveOrganization } from "./use-set-active-organization";

export function useOrganizations() {
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: listOrganizations,
  });

  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);
  const { setActiveOrganization } = useSetActiveOrganization();

  useEffect(() => {
    if (!query.data || query.data.length === 0) return;

    const selectionStillValid = query.data.some((org) => org.id === selectedOrgId);
    if (!selectionStillValid) {
      // Only reached when the selection is missing or no longer valid (e.g.
      // removed from that org) — applySession() already seeds the right org
      // from login, so this is a genuine fallback, not the common path.
      setActiveOrganization(query.data[0].id);
    }
  }, [query.data, selectedOrgId, setActiveOrganization]);

  return { ...query, selectedOrgId, setSelectedOrgId: setActiveOrganization };
}
