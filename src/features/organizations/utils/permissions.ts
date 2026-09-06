import type { RoleSlug } from "../types/organization.types";

// Mirrors webapp-api's rbac.seed.ts ROLE_PERMISSIONS: only owner and admin
// carry MEMBER_INVITE — "member" only has MEMBER_READ. Keep in sync if the
// backend seed changes.
export function canInviteMembers(role: RoleSlug | undefined): boolean {
  return role === "owner" || role === "admin";
}

// Same split as canInviteMembers — only owner/admin manage tools, member is read-only.
export function canManageTools(role: RoleSlug | undefined): boolean {
  return role === "owner" || role === "admin";
}

// Unlike canManageTools: every role can create/read documents (document
// config carries no secrets, unlike tool config), only delete is owner-only —
// mirrors agent:delete's gradient, not tool:*'s.
export function canDeleteDocuments(role: RoleSlug | undefined): boolean {
  return role === "owner";
}
