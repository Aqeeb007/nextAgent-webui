import type { RoleSlug } from "../types/organization.types";

// Mirrors webapp-api's rbac.seed.ts ROLE_PERMISSIONS: only owner and admin
// carry MEMBER_INVITE — "member" only has MEMBER_READ. Keep in sync if the
// backend seed changes.
export function canInviteMembers(role: RoleSlug | undefined): boolean {
  return role === "owner" || role === "admin";
}
