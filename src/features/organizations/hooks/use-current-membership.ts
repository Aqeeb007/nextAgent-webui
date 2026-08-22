import { useAuthStore } from "@/stores/auth.store";

import { useMembers } from "./use-members";

// Derives the logged-in user's own membership row (and therefore role) from
// the org's member list — there's no dedicated "my membership" endpoint, and
// listMembers is already fetched for the members page.
export function useCurrentMembership() {
  const userId = useAuthStore((state) => state.user?.id);
  const { data: members, isPending } = useMembers();

  const membership = members?.find((member) => member.userId === userId) ?? null;

  return { membership, isPending };
}
