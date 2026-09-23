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

// Mirrors webapp-api's rbac.seed.ts: unlike tools (members get zero TOOL_*
// grants), members here DO get workflow:create/read — they can design
// workflows, just not change a saved one. Gates add/remove/reorder/configure
// step controls and the builder's Save button (workflow:update).
export function canManageWorkflows(role: RoleSlug | undefined): boolean {
  return role === "owner" || role === "admin";
}

// Separate from canManageWorkflows: workflow:execute is withheld from
// members specifically because a run can trigger real outbound tool calls
// and real spend (same trust tier as tool:execute) — see rbac.seed.ts's
// comment on WORKFLOW_EXECUTE.
export function canExecuteWorkflows(role: RoleSlug | undefined): boolean {
  return role === "owner" || role === "admin";
}

// Mirrors canDeleteDocuments's shape: workflow:delete in rbac.seed.ts is
// owner-only, stricter than workflow:update's owner+admin.
export function canDeleteWorkflows(role: RoleSlug | undefined): boolean {
  return role === "owner";
}
