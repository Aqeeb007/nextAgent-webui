import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useOrganizationStore } from "@/stores/organization.store";

import { listOrganizations } from "../services/organization.service";

export function useOrganizations() {
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: listOrganizations,
  });

  const selectedOrgId = useOrganizationStore((state) => state.selectedOrgId);
  const setSelectedOrgId = useOrganizationStore((state) => state.setSelectedOrgId);

  useEffect(() => {
    if (!query.data || query.data.length === 0) return;

    const selectionStillValid = query.data.some((org) => org.id === selectedOrgId);
    if (!selectionStillValid) {
      setSelectedOrgId(query.data[0].id);
    }
  }, [query.data, selectedOrgId, setSelectedOrgId]);

  return { ...query, selectedOrgId, setSelectedOrgId };
}
