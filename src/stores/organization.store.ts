import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizationState {
  selectedOrgId: string | null;
  setSelectedOrgId: (id: string) => void;
  clearSelectedOrg: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      selectedOrgId: null,
      setSelectedOrgId: (id) => set({ selectedOrgId: id }),
      clearSelectedOrg: () => set({ selectedOrgId: null }),
    }),
    { name: "nexagent_selected_org" }
  )
);
